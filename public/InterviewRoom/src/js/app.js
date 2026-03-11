/**
 * Interview Room — Main app logic, navigation, session flow
 */
(function (global) {
  const IR = global.IR || (global.IR = {});

  (function () {
    const origWarn = console.warn;
    console.warn = function () {
      const s = arguments[0] != null ? String(arguments[0]) : '';
      if (/onnxruntime|Removing initializer|CleanUnusedInitializers/i.test(s)) return;
      origWarn.apply(console, arguments);
    };
  })();

  IR.version = '1.0.0';

  IR.isMobile = function () {
    return window.innerWidth <= 640 || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  };

  IR.state = {
    screen: 'home',
    selectedSchool: null,
    sessionActive: false,
    currentQuestion: 0,
    phase: null,
    timeLeft: 0,
    sessionQuestions: [],
    recordings: [],
    transcripts: [],
    answerDurations: [],
    questionStatuses: [],
    guideOpen: false,
    permState: 'idle',
    finalizingAnswer: false,
    reviewBlobUrls: {},
    transcriptEnhanced: {},
    transcriptionStatus: [],
    transcriptionError: [],
    sessionId: null,
    // Per-answer AI review state (Phase 2+)
    aiReviews: [],
    reviewStatus: [],
    reviewError: [],
    transcriptQuality: [],
    ramblingMeta: [],
    // Session-level AI state (Phase 2+)
    sessionSummary: null,
    sessionSummaryStatus: 'idle',
    sessionSummaryError: null,
    aiEngineStatus: 'idle',
    aiAvailability: 'unknown',
    aiModelName: null,
    // Enhanced (OpenAI) feedback — consent-driven, optional
    enhancedAnswerReviews: {},
    enhancedAnswerStatus: {},
    enhancedSessionSummary: null,
    enhancedSessionSummaryStatus: 'idle',
    enhancedSessionSummaryError: null
  };

  IR.handleResourcesClick = function () {
    const screen = IR.state.screen;
    const isSessionScreen = screen === 'session';
    const isReviewScreen = screen === 'review';
    const inSession = isSessionScreen || isReviewScreen;
    const isRecording = isSessionScreen && IR.state.phase === 'answer';
    const openInNewTab = () => {
      const base = window.location.origin + window.location.pathname;
      window.open(base + '#resources', '_blank');
    };
    if (!inSession) {
      IR.navigateTo('resources');
      return;
    }
    if (isRecording) {
      IR.ui.showModal(
        'Open resources?',
        'You are in the middle of a recorded answer. Finish or end this answer before leaving. If needed, you can open Haas resources in a new tab.',
        [
          { label: 'Stay here', class: 'ir-btn-ghost' },
          { label: 'Open in new tab', class: 'ir-btn-primary', action: openInNewTab }
        ]
      );
      return;
    }
    IR.ui.showModal(
      'Open resources?',
      'This session lives only in this tab. Before you close it or start a new session, download your recordings or transcripts. You can open the Haas resources in a separate tab so this page stays as-is.',
      [
        { label: 'Cancel', class: 'ir-btn-ghost' },
        { label: 'Open in new tab', class: 'ir-btn-primary', action: openInNewTab }
      ]
    );
  };

  IR.init = function () {
    IR.speech.init();
    navigator.mediaDevices?.addEventListener('devicechange', () => IR.media.handleDeviceChange());
    document.getElementById('cameraSelect').addEventListener('change', e => IR.media.switchDevice('camera', e.target.value));
    document.getElementById('micSelect').addEventListener('change', e => IR.media.switchDevice('mic', e.target.value));
    document.addEventListener('keydown', e => {
      if (IR.state.screen !== 'session' || !IR.state.sessionActive) return;
      if (IR.state.finalizingAnswer) return;
      if (e.code === 'Space' && (e.target === document.body || e.target.closest('.ir-session'))) {
        e.preventDefault();
        IR.skipPhase();
      } else if (e.code === 'Escape') {
        e.preventDefault();
        IR.confirmEndSession();
      }
    });
    document.getElementById('modalOverlay').addEventListener('click', e => {
      if (e.target === e.currentTarget) IR.ui.hideModal();
    });

    document.getElementById('navLogo').addEventListener('click', () => IR.navigateTo('home'));
    document.getElementById('navLogo').addEventListener('keydown', e => { if (e.key === 'Enter') IR.navigateTo('home'); });
    const resourcesBtn = document.getElementById('resourcesBtn');
    if (resourcesBtn) {
      resourcesBtn.addEventListener('click', (e) => { e.preventDefault(); IR.handleResourcesClick(); });
    }
    const resourcesBackBtn = document.getElementById('resourcesBackBtn');
    if (resourcesBackBtn) {
      resourcesBackBtn.addEventListener('click', () => {
        if (window.opener && !window.opener.closed) {
          window.close();
          try {
            window.location.hash = '';
          } catch (e) {
            // ignore
          }
        } else {
          IR.navigateTo('home');
        }
      });
    }
    document.getElementById('schoolCardHaas').addEventListener('click', () => IR.selectSchool('haas-mba'));
    document.getElementById('schoolCardHaas').addEventListener('keydown', e => { if (e.key === 'Enter') IR.selectSchool('haas-mba'); });
    document.getElementById('guideBtn').addEventListener('click', () => IR.toggleGuide());
    document.getElementById('guideBackdrop').addEventListener('click', () => IR.toggleGuide());
    document.getElementById('guideCloseBtn').addEventListener('click', () => IR.toggleGuide());
    document.getElementById('retryPermBtn').addEventListener('click', () => IR.retryPermissions());
    document.getElementById('techcheckBackBtn').addEventListener('click', () => IR.navigateTo('home'));
    document.getElementById('beginBtn').addEventListener('click', () => IR.startSession());
    document.getElementById('waitingExitBtn').addEventListener('click', () => IR.leaveWaitingRoom());
    document.getElementById('waitingReviewBtn').addEventListener('click', () => IR.requestReview());
    document.getElementById('skipBtn').addEventListener('click', () => IR.skipPhase());
    document.getElementById('endSessionBtn').addEventListener('click', () => IR.confirmEndSession());
    document.getElementById('exportTranscriptsBtn').addEventListener('click', () => IR.exportTranscripts());
    document.getElementById('downloadAllVideosBtn').addEventListener('click', () => IR.downloadAllVideos());
    document.getElementById('newSessionBtn').addEventListener('click', () => IR.promptNewSession());

    window.addEventListener('beforeunload', e => {
      if (!IR.sessionHasData()) return;
      e.preventDefault();
      e.returnValue = '';
    });
  };

  IR.navigateTo = function (screen) {
    document.querySelectorAll('.ir-screen').forEach(s => s.classList.remove('active'));
    const el = document.getElementById(`screen-${screen}`);
    if (el) el.classList.add('active');
    IR.state.screen = screen;
    if (screen === 'home') {
      IR.media.stopAll();
      IR.ui.setStatus('idle', 'READY');
    }
    if (screen === 'resources' && IR.ui.renderResources) IR.ui.renderResources();
    if (screen !== 'review') {
      IR.revokeReviewBlobUrls();
    }
  };

  IR.selectSchool = async function (id) {
    IR.state.selectedSchool = id;
    IR.state.permState = 'idle';
    IR.navigateTo('techcheck');
    IR.ui.renderFormatInfo(id);
    IR.ui.renderAlerts();
    document.getElementById('placeholderText').style.display = '';
    document.getElementById('permBlock').classList.remove('active');
    await IR.media.requestAccess();
  };

  IR.retryPermissions = async function () {
    const b = document.getElementById('retryPermBtn');
    b.textContent = 'Requesting access...';
    b.disabled = true;
    await IR.media.requestAccess();
  };

  IR.buildSessionQuestions = function (id) {
    if (id === 'haas-mba' && IR.haasQuestionSets && IR.haasQuestionSets.length > 0) {
      const sets = IR.haasQuestionSets;
      const setIndex = Math.floor(Math.random() * sets.length);
      return sets[setIndex].map(q => ({ id: q.id, text: q.text, slot: null }));
    }
    const conf = IR.config[id];
    const bank = IR.questions[id];
    const qs = new Array(conf.totalQuestions).fill(null);
    bank.fixed.forEach(f => { qs[f.slot] = f; });
    const pool = [...bank.pool];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    let pi = 0;
    for (let i = 0; i < qs.length; i++) {
      if (!qs[i] && pi < pool.length) qs[i] = pool[pi++];
    }
    return qs;
  };

  IR.startSession = function () {
    const id = IR.state.selectedSchool;
    IR.state.sessionId = Date.now().toString();
    IR.state.sessionQuestions = this.buildSessionQuestions(id);
    IR.state.recordings = new Array(IR.state.sessionQuestions.length).fill(null);
    IR.state.transcripts = new Array(IR.state.sessionQuestions.length).fill('');
    IR.state.answerDurations = new Array(IR.state.sessionQuestions.length).fill(0);
    IR.state.currentQuestion = 0;
    IR.state.questionStatuses = new Array(IR.state.sessionQuestions.length).fill('pending');
    IR.state.transcriptionStatus = new Array(IR.state.sessionQuestions.length).fill(IR.TRANSCRIPTION_STATUS.IDLE);
    IR.state.transcriptionError = new Array(IR.state.sessionQuestions.length).fill(null);
    IR.state.aiReviews = new Array(IR.state.sessionQuestions.length).fill(null);
    IR.state.reviewStatus = new Array(IR.state.sessionQuestions.length).fill('idle');
    IR.state.reviewError = new Array(IR.state.sessionQuestions.length).fill(null);
    IR.state.transcriptQuality = new Array(IR.state.sessionQuestions.length).fill(null);
    IR.state.ramblingMeta = new Array(IR.state.sessionQuestions.length).fill(null);
    IR.state.sessionSummary = null;
    IR.state.sessionSummaryStatus = 'idle';
    IR.state.sessionSummaryError = null;
    IR.state.aiEngineStatus = 'idle';
    IR.state.aiAvailability = 'unknown';
    IR.state.aiModelName = null;
    if (IR.transcription && IR.transcription.reset) {
      IR.transcription.reset();
    }
    // Start loading the transcription model in the background so it's ready by first answer.
    if (IR.ai && IR.ai.ensureWhisperLoaded) {
      IR.ai.ensureWhisperLoaded().catch(() => {});
    }
    IR.state.sessionActive = false;
    document.getElementById('sessionCamVideo').srcObject = IR.media.stream;
    IR.ui.setStatus('live', 'IN SESSION');
    this.showWaitingRoom();
  };

  IR.showWaitingRoom = function () {
    IR.state.screen = 'waiting';
    this.navigateTo('waiting');
    IR.ui.renderWaitingRoom();
  };

  IR.startQuestionFromWaiting = function (index) {
    if (!IR.state.sessionQuestions[index]) return;
    if (IR.state.questionStatuses[index] === 'done') return; // locked
    IR.state.currentQuestion = index;
    IR.state.sessionActive = true;
    IR.state.questionStatuses[index] = 'active';
    IR.navigateTo('session');
    IR.startPrep();
  };

  IR.startPrep = function () {
    const c = IR.config[IR.state.selectedSchool];
    IR.state.phase = 'prep';
    // reset live transcript view for new question
    IR.speech.finalTranscript = '';
    IR.speech.interimTranscript = '';
    IR.ui.updateLiveTranscript();
    IR.ui.updateSessionUI();
    IR.timer.start(c.prepTime, t => IR.ui.updateTimerDisplay(t), () => IR.startAnswer());
  };

  IR.startAnswer = function () {
    IR.state.phase = 'answer';
    IR.state._as = Date.now();
    IR.speech.finalTranscript = '';
    IR.speech.interimTranscript = '';
    IR.ui.updateLiveTranscript();
    IR.ui.updateSessionUI();
    IR.media.startRecording();
    IR.speech.start();
    const c = IR.config[IR.state.selectedSchool];
    IR.timer.start(c.answerTime, t => IR.ui.updateTimerDisplay(t), () => IR.finishAnswer());
  };

  IR.finishAnswer = async function () {
    if (IR.state.finalizingAnswer) return;
    IR.state.finalizingAnswer = true;
    IR.ui.setSessionControlsEnabled(false);
    IR.timer.clear();
    IR.speech.stop();
    let blob = null;
    try {
      blob = await IR.media.stopRecording();
    } finally {
      IR.ui.setSessionControlsEnabled(true);
      IR.state.finalizingAnswer = false;
    }
    const idx = IR.state.currentQuestion;
    IR.state.recordings[idx] = blob;
    // Canonical transcript is Whisper only; queue handles transcription.
    IR.state.transcripts[idx] = '';
    if (IR.transcription && blob) {
      IR.transcription.enqueue(idx, blob);
    }
    IR.state.answerDurations[idx] = Math.round((Date.now() - (IR.state._as || Date.now())) / 1000);
    if (IR.state.questionStatuses && IR.state.questionStatuses.length) {
      IR.state.questionStatuses[idx] = 'done';
    }
    const allDone = (IR.state.questionStatuses || []).length &&
      IR.state.questionStatuses.every(s => s === 'done');
    if (allDone) {
      IR.ui.toast('All questions complete.', 'success');
      this.requestReview();
      return;
    }
    IR.state.sessionActive = false;
    IR.state.phase = null;
    IR.ui.toast('Answer saved. Pick another question or finish.', 'success');
    IR.showWaitingRoom();
  };

  IR.skipPhase = function () {
    if (IR.state.finalizingAnswer) return;
    if (IR.state.phase === 'prep') {
      IR.timer.clear();
      IR.startAnswer();
    } else if (IR.state.phase === 'answer') {
      IR.finishAnswer();
    }
  };

  IR.endSession = function () {
    IR.state.sessionActive = false;
    IR.state.phase = null;
    IR.timer.clear();
    IR.media.stopAll();
    IR.ui.setStatus('complete', 'COMPLETE');
    IR.navigateTo('review');
    IR.ui.renderReview();
  };

  IR.leaveWaitingRoom = function () {
    if (!IR.sessionHasData()) {
      IR.media.stopAll();
      IR.newSession();
      return;
    }
    IR.ui.showModal(
      'Leave session?',
      'Please save or download your recordings/transcripts first. Once you start a new session or leave this page, you may not be able to access this session again.',
      [
        { label: 'Stay', class: 'ir-btn-ghost' },
        {
          label: 'Leave anyway',
          class: 'ir-btn-danger',
          action: () => {
            IR.media.stopAll();
            IR.revokeReviewBlobUrls();
            IR.newSession();
          }
        }
      ]
    );
  };

  IR.confirmEndSession = function () {
    if (IR.state.finalizingAnswer) return;
    IR.ui.showModal('End session?', 'Recorded answers will be saved and you will go to the review screen.', [
      { label: 'Continue', class: 'ir-btn-ghost' },
      {
        label: 'End session',
        class: 'ir-btn-danger',
        action: async () => {
          if (IR.state.phase === 'answer') {
            IR.state.finalizingAnswer = true;
            IR.ui.setSessionControlsEnabled(false);
            IR.speech.stop();
            let b = null;
            try {
              b = await IR.media.stopRecording();
            } finally {
              IR.ui.setSessionControlsEnabled(true);
              IR.state.finalizingAnswer = false;
            }
            const i = IR.state.currentQuestion;
            IR.state.recordings[i] = b;
            IR.state.transcripts[i] = '';
            if (IR.transcription && b) {
              IR.transcription.enqueue(i, b);
            }
            IR.state.answerDurations[i] = Math.round((Date.now() - (IR.state._as || Date.now())) / 1000);
            if (IR.state.questionStatuses && IR.state.questionStatuses[i] !== undefined) IR.state.questionStatuses[i] = 'done';
          }
          IR.requestReview();
        }
      }
    ]);
  };

  IR.newSession = function () {
    IR.revokeReviewBlobUrls();
    IR.state.recordings = [];
    IR.state.transcripts = [];
    IR.state.answerDurations = [];
    IR.state.sessionQuestions = [];
    IR.state.currentQuestion = 0;
    IR.state.questionStatuses = [];
    IR.state.reviewBlobUrls = {};
    IR.state.transcriptEnhanced = {};
    IR.state.transcriptionStatus = [];
    IR.state.transcriptionError = [];
    IR.state.sessionId = null;
  IR.state.aiReviews = [];
  IR.state.reviewStatus = [];
  IR.state.reviewError = [];
  IR.state.transcriptQuality = [];
  IR.state.ramblingMeta = [];
  IR.state.sessionSummary = null;
  IR.state.sessionSummaryStatus = 'idle';
  IR.state.sessionSummaryError = null;
  IR.state.aiEngineStatus = 'idle';
  IR.state.aiAvailability = 'unknown';
  IR.state.aiModelName = null;
    IR.navigateTo('home');
    IR.media.stopAll();
  };

  IR.sessionHasData = function () {
    const rec = IR.state.recordings || [];
    const tr = IR.state.transcripts || [];
    const anyRec = rec.some(b => !!b);
    const anyTr = tr.some(t => t && String(t).trim().length > 0);
    return anyRec || anyTr;
  };

  IR.promptNewSession = function () {
    if (!IR.sessionHasData()) {
      IR.newSession();
      return;
    }
    IR.ui.showModal(
      'Start new session?',
      'Please save or download your recordings/transcripts first. Once you start a new session or leave this page, you may not be able to access this session again.',
      [
        { label: 'Cancel', class: 'ir-btn-ghost' },
        {
          label: 'Start new session',
          class: 'ir-btn-danger',
          action: () => IR.newSession()
        }
      ]
    );
  };

  IR.revokeReviewBlobUrls = function () {
    Object.keys(IR.state.reviewBlobUrls || {}).forEach(k => {
      try { URL.revokeObjectURL(IR.state.reviewBlobUrls[k]); } catch (e) {}
    });
    IR.state.reviewBlobUrls = {};
  };

  IR.getReviewBlobUrl = function (index, blob) {
    if (!blob) return null;
    if (IR.state.reviewBlobUrls[index]) return IR.state.reviewBlobUrls[index];
    const u = URL.createObjectURL(blob);
    IR.state.reviewBlobUrls[index] = u;
    return u;
  };

  IR.requestReview = function () {
    if (IR.transcription && IR.transcription.hasPendingJobs && IR.transcription.hasPendingJobs()) {
      IR.ui.setAiOverlay({ label: 'Preparing final transcripts…', indeterminate: true, longRunning: true });
      const check = () => {
        if (!IR.transcription.hasPendingJobs()) {
          IR.ui.setAiOverlay({ visible: false });
          IR.endSession();
        } else {
          setTimeout(check, 800);
        }
      };
      check();
    } else {
      IR.endSession();
    }
  };

  IR.downloadVideo = function (i) {
    const b = IR.state.recordings[i];
    if (!b) return;
    const u = URL.createObjectURL(b);
    const a = document.createElement('a');
    a.href = u;
    a.download = `interview-room-q${i + 1}-${Date.now()}.webm`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(u), 1000);
    IR.ui.toast('Recording downloaded', 'success');
  };

  IR.downloadRecording = function (i) {
    const b = IR.state.recordings[i];
    if (!b) return;
    const u = URL.createObjectURL(b);
    const a = document.createElement('a');
    a.href = u;
    a.download = `interview-room-q${i + 1}-${Date.now()}.webm`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(u), 1000);
    IR.ui.toast('Recording downloaded', 'success');
  };

  IR.downloadAllVideos = function () {
    IR.state.recordings.forEach((b, i) => {
      if (b) setTimeout(() => IR.downloadVideo(i), i * 500);
    });
    IR.ui.toast('Downloading recordings…', 'info');
  };

  IR.copyTranscript = function (i) {
    IR.ui.copyToClipboard(IR.state.transcripts[i] || '', () => IR.ui.toast('Transcript copied', 'success'), () => IR.ui.toast('Copy failed. Try selecting and copying manually.', 'error'));
  };

  IR.exportTranscripts = function () {
    let o = `INTERVIEW ROOM — SESSION TRANSCRIPT\nSchool: ${IR.config[IR.state.selectedSchool]?.school || ''}\nDate: ${new Date().toLocaleDateString()}\n${'='.repeat(50)}\n\n`;
    IR.state.sessionQuestions.forEach((q, i) => {
      const status = IR.state.questionStatuses?.[i] || 'pending';
      const skipped = status !== 'done' && !IR.state.recordings[i];
      const base = `Q${i + 1}: ${q.text}\n`;
      if (skipped) {
        o += base + 'Status: Skipped\n\n';
      } else {
        o +=
          base +
          `Duration: ${IR.ui.fmt(IR.state.answerDurations[i] || 0)}\n` +
          `Answer: ${IR.state.transcripts[i] || '(No transcript)'}\n\n`;
      }
    });
    IR.ui.copyToClipboard(o, () => IR.ui.toast('All transcripts copied', 'success'), () => IR.ui.toast('Copy failed. Try selecting and copying manually.', 'error'));
  };

  IR.setTranscriptTab = function () { /* Single transcript view; no tabs */ };

  IR.toggleGuide = function () {
    IR.state.guideOpen = !IR.state.guideOpen;
    document.getElementById('guidePanel').classList.toggle('open', IR.state.guideOpen);
    document.getElementById('guideBackdrop').classList.toggle('open', IR.state.guideOpen);
  };

  document.addEventListener('DOMContentLoaded', () => {
    IR.init();
    if (window.location.hash === '#resources') {
      IR.navigateTo('resources');
    }
  });
})(typeof window !== 'undefined' ? window : this);
