/**
 * Interview Room — Camera, microphone, and recording
 */
(function (global) {
  const IR = global.IR || (global.IR = {});
  IR.media = {
    stream: null,
    recorder: null,
    chunks: [],
    audioContext: null,
    analyser: null,
    micMonitorId: null,
    devices: { cameras: [], mics: [] },

    async requestAccess() {
      if (typeof navigator.mediaDevices === 'undefined' || !navigator.mediaDevices.getUserMedia) {
        IR.state.permState = 'error';
        IR.ui.updatePermUI(new Error('Camera and microphone are not supported in this browser or context. Use HTTPS or localhost.'));
        return { success: false, error: 'unsupported' };
      }
      const hasLiveStream = this.stream && this.stream.getTracks().every(t => t.readyState === 'live');
      if (hasLiveStream) {
        IR.state.permState = 'granted';
        IR.ui.updatePermUI();
        return { success: true };
      }
      IR.state.permState = 'requesting';
      IR.ui.updatePermUI();
      try {
        if (this.stream) {
          this.stream.getTracks().forEach(t => t.stop());
          this.stream = null;
        }
        const isMobile = IR.isMobile && IR.isMobile();
        const videoConstraints = isMobile
          ? { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' }
          : { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' };
        const s = await navigator.mediaDevices.getUserMedia({
          video: videoConstraints,
          audio: { echoCancellation: true, noiseSuppression: true }
        });
        this.stream = s;
        await this.enumerateDevices();
        this.setupAudioMonitor();
        IR.state.permState = 'granted';
        IR.ui.updatePermUI();
        return { success: true };
      } catch (err) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          IR.state.permState = 'denied';
          IR.ui.updatePermUI();
        } else if (err.name === 'NotFoundError') {
          IR.state.permState = 'error';
          IR.ui.updatePermUI(new Error('No camera or microphone was found. Connect a device and try again.'));
        } else if (err.name === 'NotReadableError' || err.name === 'DevicesNotFoundError') {
          IR.state.permState = 'error';
          IR.ui.updatePermUI(new Error('Camera or microphone is in use by another app, or could not be opened. Close other apps using the device and try again.'));
        } else {
          IR.state.permState = 'error';
          IR.ui.updatePermUI(err);
        }
        return { success: false, error: err.name };
      }
    },

    async enumerateDevices() {
      const d = await navigator.mediaDevices.enumerateDevices();
      this.devices.cameras = d.filter(x => x.kind === 'videoinput');
      this.devices.mics = d.filter(x => x.kind === 'audioinput');
    },

    async switchDevice(type, id) {
      if (!this.stream) return;
      const isMobile = IR.isMobile && IR.isMobile();
      const videoOpts = isMobile
        ? { deviceId: { exact: id }, width: { ideal: 640 }, height: { ideal: 480 } }
        : { deviceId: { exact: id }, width: { ideal: 1280 }, height: { ideal: 720 } };
      const c = type === 'camera'
        ? { video: videoOpts }
        : { audio: { deviceId: { exact: id }, echoCancellation: true, noiseSuppression: true } };
      try {
        const ns = await navigator.mediaDevices.getUserMedia(c);
        const old = type === 'camera' ? this.stream.getVideoTracks() : this.stream.getAudioTracks();
        old.forEach(t => {
          this.stream.removeTrack(t);
          t.stop();
        });
        ns.getTracks().forEach(t => this.stream.addTrack(t));
        if (type === 'camera') IR.ui.updateVideoEls();
        else this.setupAudioMonitor();
        IR.ui.toast('Device switched', 'success');
      } catch (e) {
        IR.ui.toast('Could not switch: ' + e.message, 'error');
      }
    },

    setupAudioMonitor() {
      if (this.micMonitorId) cancelAnimationFrame(this.micMonitorId);
      if (this.audioContext) try { this.audioContext.close(); } catch (e) {}
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      this.audioContext.createMediaStreamSource(this.stream).connect(this.analyser);
      const d = new Uint8Array(this.analyser.frequencyBinCount);
      const m = () => {
        this.analyser.getByteFrequencyData(d);
        const a = d.reduce((a, b) => a + b, 0) / d.length;
        const el = document.getElementById('micLevel');
        if (el) el.style.width = Math.min(100, (a / 128) * 100) + '%';
        this.micMonitorId = requestAnimationFrame(m);
      };
      m();
    },

    startRecording() {
      if (!this.stream) return;
      this.chunks = [];
      const mt = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus') ? 'video/webm;codecs=vp9,opus'
        : MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus') ? 'video/webm;codecs=vp8,opus'
        : MediaRecorder.isTypeSupported('video/webm') ? 'video/webm' : 'video/mp4';
      try {
        this.recorder = new MediaRecorder(this.stream, { mimeType: mt });
      } catch (e) {
        this.recorder = new MediaRecorder(this.stream);
      }
      this.recorder.ondataavailable = e => { if (e.data.size > 0) this.chunks.push(e.data); };
      this.recorder.start(1000);
    },

    stopRecording() {
      return new Promise(r => {
        if (!this.recorder || this.recorder.state === 'inactive') {
          r(null);
          return;
        }
        this.recorder.onstop = () => {
          const b = new Blob(this.chunks, { type: this.recorder.mimeType || 'video/webm' });
          this.chunks = [];
          this.recorder = null;
          r(b);
        };
        this.recorder.stop();
      });
    },

    stopAll() {
      if (this.micMonitorId) {
        cancelAnimationFrame(this.micMonitorId);
        this.micMonitorId = null;
      }
      if (this.audioContext) this.audioContext.close().catch(() => {});
      if (this.recorder && this.recorder.state !== 'inactive') {
        try { this.recorder.stop(); } catch (e) {}
        this.recorder = null;
        this.chunks = [];
      }
      if (this.stream) {
        this.stream.getTracks().forEach(t => t.stop());
        this.stream = null;
      }
    },

    handleDeviceChange() {
      this.enumerateDevices().then(() => {
        IR.ui.populateDevSelects();
        if (this.stream) {
          const videoEnded = !this.stream.getVideoTracks().length || this.stream.getVideoTracks()[0].readyState === 'ended';
          const audioEnded = !this.stream.getAudioTracks().length || this.stream.getAudioTracks()[0].readyState === 'ended';
          if (videoEnded || audioEnded) {
            this.stream.getTracks().forEach(t => t.stop());
            this.stream = null;
            if (IR.state.screen === 'techcheck') {
              IR.state.permState = 'error';
              IR.ui.updatePermUI(new Error('Camera or microphone was disconnected. Reconnect the device and click "Try again".'));
            } else {
              IR.ui.toast('Camera or microphone disconnected.', 'warning');
            }
          }
        }
      });
    }
  };
})(typeof window !== 'undefined' ? window : this);
