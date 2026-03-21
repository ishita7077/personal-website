/**
 * Interview Room — Transcription queue manager
 *
 * One-at-a-time Whisper transcription for recorded answers.
 */
(function (global) {
  const IR = global.IR || (global.IR = {});

  const TRANSCRIPTION_STATUS = {
    IDLE: 'idle',
    PENDING: 'pending',
    TRANSCRIBING: 'transcribing',
    READY: 'ready',
    FAILED: 'failed'
  };

  IR.transcription = {
    jobs: [],
    activeJob: null,

    ensureStateArray() {
      if (!Array.isArray(IR.state.transcriptionStatus)) {
        IR.state.transcriptionStatus = [];
      }
      if (!Array.isArray(IR.state.transcriptionError)) {
        IR.state.transcriptionError = [];
      }
    },

    _userFriendlyTranscriptionError(e) {
      if (!e) return 'Transcription could not be generated for this recording.';
      const msg = (e.message || String(e)).toLowerCase();
      if (msg.includes('unavailable') || msg.includes('transcription')) return 'Transcription is not available on this device. Your recording was saved — you can download it.';
      if (msg.includes('decode') || msg.includes('audio')) return 'Could not process the recording. Try Chrome or Edge on a desktop for best support.';
      if (msg.includes('load') || msg.includes('model')) return 'Transcription model could not be loaded. Your recording was saved.';
      return 'Transcription could not be generated. Your recording was saved — you can download it. For best results use Chrome or Edge on a desktop.';
    },

    enqueue(index, blob) {
      if (!blob) return;
      this.ensureStateArray();
      IR.state.transcriptionStatus[index] = TRANSCRIPTION_STATUS.PENDING;
      this.jobs.push({
        questionIndex: index,
        blob,
        status: TRANSCRIPTION_STATUS.PENDING
      });
      this.processNext();
    },

    async processNext() {
      if (this.activeJob) return;
      const job = this.jobs.find(j => j.status === TRANSCRIPTION_STATUS.PENDING);
      if (!job) return;
      this.activeJob = job;
      job.status = TRANSCRIPTION_STATUS.TRANSCRIBING;
      this.ensureStateArray();
      IR.state.transcriptionStatus[job.questionIndex] = TRANSCRIPTION_STATUS.TRANSCRIBING;

      try {
        if (!IR.ai || !IR.ai.transcribeWithWhisper) {
          throw new Error('Transcription unavailable');
        }
        const text = await IR.ai.transcribeWithWhisper(job.questionIndex, job.blob, '');
        const cleaned = (text || '').trim();
        if (cleaned) {
          IR.state.transcripts[job.questionIndex] = cleaned;
          job.status = TRANSCRIPTION_STATUS.READY;
          IR.state.transcriptionStatus[job.questionIndex] = TRANSCRIPTION_STATUS.READY;
          if (IR.state.transcriptionError[job.questionIndex] !== undefined) {
            IR.state.transcriptionError[job.questionIndex] = null;
          }
          // When a final transcript is ready, the review UI and any
          // OpenAI-backed flows can use IR.state.transcripts directly.
        } else {
          job.status = TRANSCRIPTION_STATUS.FAILED;
          IR.state.transcriptionStatus[job.questionIndex] = TRANSCRIPTION_STATUS.FAILED;
          IR.state.transcriptionError[job.questionIndex] = IR.transcription._userFriendlyTranscriptionError(
            IR.ai && IR.ai.whisper && IR.ai.whisper.error
          );
        }
      } catch (e) {
        console.error('Transcription job failed', e);
        job.status = TRANSCRIPTION_STATUS.FAILED;
        this.ensureStateArray();
        IR.state.transcriptionStatus[job.questionIndex] = TRANSCRIPTION_STATUS.FAILED;
        IR.state.transcriptionError[job.questionIndex] = this._userFriendlyTranscriptionError(e);
      } finally {
        this.activeJob = null;
        // If we are in the waiting room, refresh to update button states / messages
        if (IR.state.screen === 'waiting' && IR.ui && IR.ui.renderWaitingRoom) {
          IR.ui.renderWaitingRoom();
        }
        // If we are in review, refresh transcripts
        if (IR.state.screen === 'review' && IR.ui && IR.ui.refreshTranscriptForIndex) {
          IR.ui.refreshTranscriptForIndex(-1);
        }
        // Continue with next job
        this.processNext();
      }
    },

    hasPendingJobs() {
      return this.jobs.some(j => j.status === TRANSCRIPTION_STATUS.PENDING || j.status === TRANSCRIPTION_STATUS.TRANSCRIBING);
    },

    areAllReadyForCompletedQuestions() {
      this.ensureStateArray();
      const statuses = IR.state.questionStatuses || [];
      const tStatus = IR.state.transcriptionStatus || [];
      let anyCompleted = false;
      for (let i = 0; i < statuses.length; i++) {
        if (statuses[i] === 'done') {
          anyCompleted = true;
          const s = tStatus[i];
          if (s !== TRANSCRIPTION_STATUS.READY && s !== TRANSCRIPTION_STATUS.FAILED) {
            return false;
          }
        }
      }
      return anyCompleted ? true : true;
    },

    reset() {
      this.jobs = [];
      this.activeJob = null;
      this.ensureStateArray();
      const arr = IR.state.transcriptionStatus || [];
      for (let i = 0; i < arr.length; i++) {
        arr[i] = TRANSCRIPTION_STATUS.IDLE;
      }
      const errArr = IR.state.transcriptionError || [];
      for (let i = 0; i < errArr.length; i++) {
        errArr[i] = null;
      }
    }
  };

  IR.TRANSCRIPTION_STATUS = TRANSCRIPTION_STATUS;
})(typeof window !== 'undefined' ? window : this);

