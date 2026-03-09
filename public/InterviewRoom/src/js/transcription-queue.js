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
        } else {
          job.status = TRANSCRIPTION_STATUS.FAILED;
          IR.state.transcriptionStatus[job.questionIndex] = TRANSCRIPTION_STATUS.FAILED;
        }
      } catch (e) {
        console.error('Transcription job failed', e);
        job.status = TRANSCRIPTION_STATUS.FAILED;
        this.ensureStateArray();
        IR.state.transcriptionStatus[job.questionIndex] = TRANSCRIPTION_STATUS.FAILED;
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
    }
  };

  IR.TRANSCRIPTION_STATUS = TRANSCRIPTION_STATUS;
})(typeof window !== 'undefined' ? window : this);

