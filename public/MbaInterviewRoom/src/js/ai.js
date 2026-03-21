/**
 * Interview Room — Local AI helpers (Whisper via transformers.js)
 * All inference runs in-browser; only model weights are downloaded.
 */
(function (global) {
  const IR = global.IR || (global.IR = {});

  IR.ai = {
    whisper: {
      initPromise: null,
      pipeline: null,
      ready: false,
      error: null,
      lastFailAt: 0
    },

    async ensureWhisperLoaded() {
      if (this.whisper.ready) return;
      const now = Date.now();
      if (this.whisper.initPromise) {
        await this.whisper.initPromise;
        return;
      }
      if (this.whisper.lastFailAt && now - this.whisper.lastFailAt < 5 * 60 * 1000) {
        return;
      }
      IR.ui.setAiOverlay({ label: 'Loading transcription model…', progress: 0 });
      this.whisper.initPromise = (async () => {
        try {
          const mod = await import('https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2/dist/transformers.min.js');
          const pipeline = await mod.pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny.en', {
            progress_callback: ev => {
              if (ev.status === 'progress' && ev.loaded != null && ev.total != null && ev.total > 0) {
                const pct = Math.round((ev.loaded / ev.total) * 100);
                IR.ui.setAiOverlay({ label: 'Loading transcription model…', progress: pct });
              }
              if (ev.status === 'ready') {
                IR.ui.setAiOverlay({ label: 'Transcription model ready', progress: 100 });
                setTimeout(() => IR.ui.setAiOverlay({ visible: false }), 1000);
              }
            }
          });
          this.whisper.pipeline = pipeline;
          this.whisper.ready = true;
          this.whisper.error = null;
        } catch (e) {
          console.error('Whisper load failed', e);
          this.whisper.error = e;
          this.whisper.lastFailAt = Date.now();
          IR.ui.setAiOverlay({ visible: false });
          IR.ui.toast('Could not load the transcription model. Notes will not be available for this session.', 'warning');
        } finally {
          this.whisper.initPromise = null;
        }
      })();
      await this.whisper.initPromise;
    },

    async transcribeWithWhisper(index, blob, provisionalText) {
      await this.ensureWhisperLoaded();
      if (!this.whisper.ready || !this.whisper.pipeline) {
        throw new Error('Transcription unavailable');
      }
      let wavUrl = null;
      try {
        const wavBlob = await IR.convert.webmToWav(blob);
        wavUrl = URL.createObjectURL(wavBlob);
        IR.ui.setAiOverlay({ label: 'Transcribing answer locally…', indeterminate: true, longRunning: true });
        const out = await this.whisper.pipeline(wavUrl, {
          chunk_length_s: 30,
          return_timestamps: false
        });
        const text = (typeof out === 'string' ? out : (out && out.text)) || provisionalText || '';
        IR.state.transcripts[index] = (text || '').trim() || provisionalText || '';
        if (IR.state.transcriptEnhanced == null) IR.state.transcriptEnhanced = {};
        IR.state.transcriptEnhanced[index] = true;
        if (IR.ui.refreshTranscriptForIndex) IR.ui.refreshTranscriptForIndex(index);
        return IR.state.transcripts[index];
      } catch (e) {
        console.error('Whisper transcription failed', e);
        return provisionalText;
      } finally {
        IR.ui.setAiOverlay({ visible: false });
        if (wavUrl) URL.revokeObjectURL(wavUrl);
      }
    },

    async ensureReviewLoaded() {
      if (this.review.ready) return;
      const now = Date.now();
      if (this.review.initPromise) {
        await this.review.initPromise;
        return;
      }
      if (this.review.lastFailAt && now - this.review.lastFailAt < 5 * 60 * 1000) {
        return;
      }
      IR.ui.setAiOverlay({ label: 'Loading review model…', indeterminate: true });
      this.review.initPromise = (async () => {
        try {
          const mod = await import('https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2/dist/transformers.min.js');
          const pipelineFn = mod.pipeline || (mod.default && mod.default.pipeline) || (mod.default && mod.default.default && mod.default.default.pipeline);
          if (!pipelineFn) {
            const keys = mod.default ? Object.keys(mod.default) : Object.keys(mod);
            throw new Error('pipeline not found on transformers module');
          }
          const pipeline = await pipelineFn('text2text-generation', this.review.defaultModel);
          this.review.pipeline = pipeline;
          this.review.ready = true;
          this.review.error = null;
        } catch (e) {
          console.error('Review model load failed', e);
          this.review.error = e;
          this.review.lastFailAt = Date.now();
          IR.ui.setAiOverlay({ visible: false });
          const msg = (e && e.message) ? e.message : String(e);
          IR.ui.toast('Could not load the review model. ' + (msg.length > 50 ? msg.slice(0, 50) + '…' : msg), 'warning');
        } finally {
          this.review.initPromise = null;
          IR.ui.setAiOverlay({ visible: false });
        }
      })();
      await this.review.initPromise;
    },

    _safeJsonParse(text) {
      if (!text) return null;
      const trimmed = String(text).trim();
      let toParse = trimmed;
      const firstBrace = trimmed.indexOf('{');
      const lastBrace = trimmed.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        toParse = trimmed.slice(firstBrace, lastBrace + 1);
      }
      try {
        return JSON.parse(toParse);
      } catch (_) {}
      const fixed = toParse.replace(/,(\s*[}\]])/g, '$1');
      try {
        return JSON.parse(fixed);
      } catch (_) {}
      return null;
    },

    /** Remove echoed prompt so we only try to parse the model's continuation (after last "JSON:"). */
    _stripEchoedPrompt(text, sentinel) {
      if (!text || !sentinel) return text;
      const s = String(text);
      const idx = s.toLowerCase().lastIndexOf(sentinel.toLowerCase());
      if (idx === -1) return s;
      return s.slice(idx + sentinel.length).trim();
    },

  };
})(typeof window !== 'undefined' ? window : this);

