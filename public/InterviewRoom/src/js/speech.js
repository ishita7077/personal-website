/**
 * Interview Room — Web Speech API (live transcription)
 */
(function (global) {
  const IR = global.IR || (global.IR = {});
  IR.speech = {
    recognition: null,
    supported: false,
    finalTranscript: '',
    interimTranscript: '',
    isListening: false,

    init() {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.supported = !!SR;
      if (!SR) return;
      this.recognition = new SR();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';
      this.recognition.onresult = e => {
        let i = '';
        for (let x = e.resultIndex; x < e.results.length; x++) {
          const t = e.results[x][0].transcript;
          if (e.results[x].isFinal) this.finalTranscript += t + ' ';
          else i += t;
        }
        this.interimTranscript = i;
        IR.ui.updateLiveTranscript();
      };
      this.recognition.onerror = e => {
        if ((e.error === 'no-speech' || e.error === 'aborted') && this.isListening && IR.state.phase === 'answer') {
          try { this.recognition.start(); } catch (ex) {}
        }
      };
      this.recognition.onend = () => {
        if (this.isListening && IR.state.phase === 'answer') {
          try { this.recognition.start(); } catch (ex) {}
        }
      };
    },

    start() {
      if (!this.supported) return;
      this.finalTranscript = '';
      this.interimTranscript = '';
      this.isListening = true;
      try { this.recognition.start(); } catch (ex) {}
    },

    stop() {
      this.isListening = false;
      if (this.recognition) try { this.recognition.stop(); } catch (ex) {}
      return (this.finalTranscript + this.interimTranscript).trim() || this.finalTranscript.trim();
    }
  };
})(typeof window !== 'undefined' ? window : this);
