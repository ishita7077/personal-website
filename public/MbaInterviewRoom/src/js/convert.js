/**
 * Interview Room — WebM → WAV for Whisper (Web Audio API).
 * Video/audio downloads are WebM directly (no conversion).
 */
(function (global) {
  const IR = global.IR || (global.IR = {});

  IR.convert = {
    ffmpeg: null,
    ffmpegLoadPromise: null,

    async loadFFmpeg() {
      if (this.ffmpeg) return this.ffmpeg;
      if (this.ffmpegLoadPromise) return this.ffmpegLoadPromise;
      this.ffmpegLoadPromise = (async () => {
        const { FFmpeg } = await import('https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.12.10/dist/esm/index.js');
        const { fetchFile, toBlobURL } = await import('https://cdn.jsdelivr.net/npm/@ffmpeg/util@0.12.1/dist/esm/index.js');
        const baseURL = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/umd';
        const ffmpeg = new FFmpeg();
        await ffmpeg.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        });
        this.ffmpeg = { ffmpeg, fetchFile };
        return this.ffmpeg;
      })();
      return this.ffmpegLoadPromise;
    },

    async webmToWav(blob) {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const buf = await ctx.decodeAudioData(await blob.arrayBuffer());
        const sr = buf.sampleRate;
        const ch = buf.numberOfChannels;
        const len = buf.length * ch * 2;
        const arr = new ArrayBuffer(44 + len);
        const view = new DataView(arr);
        const writeStr = (offset, str) => { for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i)); };
        writeStr(0, 'RIFF');
        view.setUint32(4, 36 + len, true);
        writeStr(8, 'WAVE');
        writeStr(12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, ch, true);
        view.setUint32(24, sr, true);
        view.setUint32(28, sr * ch * 2, true);
        view.setUint16(32, ch * 2, true);
        view.setUint16(34, 16, true);
        writeStr(36, 'data');
        view.setUint32(40, len, true);
        const d = new Int16Array((len / 2) | 0);
        for (let c = 0; c < ch; c++) {
          const chData = buf.getChannelData(c);
          for (let i = 0; i < buf.length; i++) d[i * ch + c] = Math.max(-32768, Math.min(32767, chData[i] * 32768));
        }
        new Uint8Array(arr).set(new Uint8Array(d.buffer), 44);
        return new Blob([arr], { type: 'audio/wav' });
      } catch (e) {
        return this.webmToWavViaFFmpeg(blob);
      }
    },

    async webmToWavViaFFmpeg(blob) {
      const { ffmpeg, fetchFile } = await this.loadFFmpeg();
      await ffmpeg.writeFile('in.webm', await fetchFile(blob));
      await ffmpeg.exec(['-i', 'in.webm', '-vn', '-c:a', 'pcm_s16le', '-ar', '16000', '-ac', '1', 'out.wav']);
      const data = await ffmpeg.readFile('out.wav');
      await ffmpeg.deleteFile('in.webm');
      await ffmpeg.deleteFile('out.wav');
      return new Blob([data.buffer], { type: 'audio/wav' });
    }
  };
})(typeof window !== 'undefined' ? window : this);
