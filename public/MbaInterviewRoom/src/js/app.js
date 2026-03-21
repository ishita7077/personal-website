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

  IR.version = '1.1.0';

  IR.shuffleArray = function (arr) {
    const a = (arr || []).slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  IR.inferTagsFromQuestionType = function (qt) {
    const t = String(qt || '').toLowerCase();
    if (t.includes('goal')) return ['goals'];
    if (t.includes('video') || t.includes('kira')) return ['communication'];
    if (t.includes('values') || t.includes('reflection')) return ['values'];
    if (t.includes('team') || t.includes('tbd')) return ['collaboration'];
    return ['leadership'];
  };

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
    // Legacy/local AI review state (kept for compatibility)
    aiReviews: [],
    sessionSummary: null,
    // Custom interview configuration
    customQuestions: null,
    customPrepTime: null,
    customAnswerTime: null,
    customMode: false,
    // Per-answer AI review state (Phase 2+)
    reviewStatus: [],
    reviewError: [],
    transcriptQuality: [],
    ramblingMeta: [],
    // Session-level AI state (Phase 2+)
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
      const origin = window.location.origin;
      const sid = IR.state && IR.state.selectedSchool;
      const p = IR.MBA_IR_PREFIX || '/mba-interview-room';
      const url =
        sid && !IR.state.customMode
          ? origin + p + '/' + encodeURIComponent(sid) + '/resources'
          : origin + p + '/resources';
      window.open(url, '_blank', 'noopener,noreferrer');
    };
    if (!inSession) {
      const sid = IR.state.selectedSchool;
      if (sid && !IR.state.customMode) {
        const p = IR.openResourcesWithPath && IR.openResourcesWithPath(sid, 'push');
        if (p && typeof p.catch === 'function') p.catch(function () {});
      } else {
        if (IR.pushMbaIrPath) IR.pushMbaIrPath('resources', 'push');
        IR.navigateTo('resources');
      }
      return;
    }
    if (isRecording) {
      IR.ui.showModal(
        'Open resources?',
        'You are in the middle of a recorded answer. Finish or end this answer before leaving. You can open prep links in another window.',
        [
          { label: 'Stay here', class: 'ir-btn-ghost' },
          { label: 'Open prep links', class: 'ir-btn-primary', action: openInNewTab }
        ]
      );
      return;
    }
    IR.ui.showModal(
      'Open resources?',
      'This session stays in this tab. Save anything you need before you leave. Open prep links in another window to keep this session as-is.',
      [
        { label: 'Cancel', class: 'ir-btn-ghost' },
        { label: 'Open prep links', class: 'ir-btn-primary', action: openInNewTab }
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
      const tag = (e.target && e.target.tagName) || '';
      if (tag === 'TEXTAREA' || (tag === 'INPUT' && e.target.type !== 'button' && e.target.type !== 'submit')) {
        if (e.code === 'Escape') {
          e.preventDefault();
          IR.confirmEndSession();
        }
        return;
      }
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

    document.getElementById('navLogo').addEventListener('click', () => {
      if (IR.pushMbaIrPath) IR.pushMbaIrPath('', 'replace');
      IR.navigateTo('home');
    });
    document.getElementById('navLogo').addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        if (IR.pushMbaIrPath) IR.pushMbaIrPath('', 'replace');
        IR.navigateTo('home');
      }
    });
    const resourcesBtn = document.getElementById('resourcesBtn');
    if (resourcesBtn) {
      resourcesBtn.addEventListener('click', (e) => { e.preventDefault(); IR.handleResourcesClick(); });
    }
    const resourcesBackBtn = document.getElementById('resourcesBackBtn');
    if (resourcesBackBtn) {
      resourcesBackBtn.addEventListener('click', () => {
        if (window.opener && !window.opener.closed) {
          window.close();
          return;
        }
        if (window.history.length > 1) {
          window.history.back();
        } else {
          if (IR.pushMbaIrPath) IR.pushMbaIrPath('', 'replace');
          IR.navigateTo('home');
        }
      });
    }
    const customCard = document.getElementById('schoolCardCustom');
    if (customCard) {
      customCard.addEventListener('click', () => {
        if (IR.pushMbaIrPath) IR.pushMbaIrPath('custom', 'push');
        IR.navigateTo('custom');
        IR.updateConfigFromDom();
      });
      customCard.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
          if (IR.pushMbaIrPath) IR.pushMbaIrPath('custom', 'push');
          IR.navigateTo('custom');
          IR.updateConfigFromDom();
        }
      });
    }
    document.getElementById('guideBtn').addEventListener('click', () => IR.toggleGuide());
    document.getElementById('guideBackdrop').addEventListener('click', () => IR.toggleGuide());
    document.getElementById('guideCloseBtn').addEventListener('click', () => IR.toggleGuide());
    document.getElementById('retryPermBtn').addEventListener('click', () => IR.retryPermissions());
    document.getElementById('techcheckBackBtn').addEventListener('click', () => {
      if (IR.pushMbaIrPath) IR.pushMbaIrPath('', 'replace');
      IR.navigateTo('home');
    });
    document.getElementById('beginBtn').addEventListener('click', () => IR.startSession());
    document.getElementById('waitingExitBtn').addEventListener('click', () => IR.leaveWaitingRoom());
    document.getElementById('waitingReviewBtn').addEventListener('click', () => IR.requestReview());
    document.getElementById('skipBtn').addEventListener('click', () => IR.skipPhase());
    document.getElementById('endSessionBtn').addEventListener('click', () => IR.confirmEndSession());
    document.getElementById('exportTranscriptsBtn').addEventListener('click', () => IR.exportTranscripts());
    document.getElementById('downloadAllVideosBtn').addEventListener('click', () => IR.downloadAllVideos());
    document.getElementById('newSessionBtn').addEventListener('click', () => IR.promptNewSession());

    const qInput = document.getElementById('questionsInput');
    if (qInput) {
      qInput.addEventListener('input', () => IR.updateConfigFromDom());
    }
    const questionsList = document.getElementById('questionsList');
    const addQuestionBtn = document.getElementById('addQuestionBtn');
    const questionsPaste = document.getElementById('questionsPaste');
    if (addQuestionBtn) {
      addQuestionBtn.addEventListener('click', () => IR.addCustomQuestionRow());
    }
    if (questionsList) {
      questionsList.addEventListener('input', () => IR.updateConfigFromDom());
      questionsList.addEventListener('click', (e) => {
        const removeBtn = e.target.closest('.ir-question-remove');
        if (removeBtn) {
          const row = removeBtn.closest('.ir-question-row');
          if (row && questionsList.querySelectorAll('.ir-question-row').length > 1) {
            row.remove();
            IR.updateQuestionIndices();
            IR.updateConfigFromDom();
          }
        }
      });
    }
    if (questionsPaste) {
      questionsPaste.addEventListener('input', () => IR.syncPasteToQuestionRows());
    }
    const addPastedBtn = document.getElementById('addPastedQuestionsBtn');
    if (addPastedBtn) {
      addPastedBtn.addEventListener('click', () => IR.addPastedQuestions());
    }
    const prepInput = document.getElementById('prepTimeInput');
    if (prepInput) {
      prepInput.addEventListener('input', () => IR.updateConfigFromDom());
    }
    const answerInput = document.getElementById('answerTimeInput');
    if (answerInput) {
      answerInput.addEventListener('input', () => IR.updateConfigFromDom());
    }
    const startPracticeBtn = document.getElementById('startPracticeBtn');
    if (startPracticeBtn) {
      startPracticeBtn.addEventListener('click', () => IR.startConfiguredFlow());
    }

    IR.updateTopNav();
    IR.updateConfigFromDom();

    if (IR.initSchoolCards) {
      IR.initSchoolCards();
    }

    window.addEventListener('beforeunload', e => {
      if (!IR.sessionHasData()) return;
      e.preventDefault();
      e.returnValue = '';
    });

    window.addEventListener('popstate', function () {
      if (IR.syncRouteFromLocation) {
        IR.syncRouteFromLocation().catch(function () {});
      }
    });
  };

  IR.openResourcesWithPath = function (id, mode) {
    if (!id || !IR.pushMbaIrPath || !IR.loadResourcesProgram) return Promise.resolve();
    IR.pushMbaIrPath(encodeURIComponent(id) + '/resources', mode === 'replace' ? 'replace' : 'push');
    return IR.loadResourcesProgram(id, { skipPathUpdate: true });
  };

  IR.loadResourcesProgram = async function (id, opts) {
    opts = opts || {};
    if (!id || !IR.fetchSchoolBundle) return;
    try {
      await IR.fetchSchoolBundle(id);
      IR.state.selectedSchool = id;
      IR.state.customMode = false;
      IR.navigateTo('resources');
      if (!opts.skipPathUpdate && IR.pushMbaIrPath) {
        let needPush = true;
        if (IR.parseMbaIrPath) {
          const cur = IR.parseMbaIrPath();
          if (cur.view === 'resources' && cur.schoolId === id) needPush = false;
        }
        if (needPush) {
          IR.pushMbaIrPath(encodeURIComponent(id) + '/resources', 'push');
        }
      }
    } catch (e) {
      if (IR.ui && IR.ui.toast) {
        IR.ui.toast('Could not load resources for this programme.', 'error');
      }
    }
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
    if (screen === 'resources' && IR.ui.renderResources) {
      const pr = IR.ui.renderResources();
      if (pr && typeof pr.then === 'function') pr.catch(function () {});
    }
    if (screen !== 'review') {
      IR.revokeReviewBlobUrls();
    }
    IR.updateTopNav();
  };

  IR.selectSchool = async function (id) {
    if (IR.fetchSchoolBundle) {
      try {
        await IR.fetchSchoolBundle(id);
      } catch (e) {
        if (IR.ui && IR.ui.toast) {
          IR.ui.toast('Could not load programme data. Check your connection and use the site URL (not a local file).', 'error');
        }
        return;
      }
    }
    IR.state.selectedSchool = id;
    IR.state.customMode = false;
    IR.state.permState = 'idle';
    if (IR.pushMbaIrPath) IR.pushMbaIrPath(encodeURIComponent(id), 'push');
    IR.navigateTo('techcheck');
    IR.ui.renderFormatInfo(id);
    IR.ui.renderAlerts();
    document.getElementById('placeholderText').style.display = '';
    document.getElementById('permBlock').classList.remove('active');
    IR.updateTopNav();
    await IR.media.requestAccess();
  };

  IR.retryPermissions = async function () {
    const b = document.getElementById('retryPermBtn');
    b.textContent = 'Requesting access...';
    b.disabled = true;
    await IR.media.requestAccess();
  };

  IR.isWrittenResponseQuestion = function (q) {
    if (!q) return false;
    const qt = String(q.question_type || '');
    const ph = String(q.interview_phase || '');
    if (qt === 'written_reflection' || qt === 'written_timed') return true;
    if (qt === 'data_task') return true;
    if (ph === 'kira_written' || ph === 'post_interview_reflection' || ph === 'pre_interview_written') return true;
    return false;
  };

  IR.mapPoolQuestionToSession = function (q) {
    const o = {
      id: q.id,
      text: q.text,
      expected_answer_map: q.expected_answer_map,
      question_type: q.question_type,
      interview_phase: q.interview_phase,
      tags: q.tags || IR.inferTagsFromQuestionType(q.question_type),
      prep_time_seconds: q.prep_time_seconds,
      answer_time_seconds: q.answer_time_seconds,
      responseMode: IR.isWrittenResponseQuestion(q) ? 'written' : 'video',
      slot: null
    };
    return o;
  };

  IR.pickOrderedQuestionPool = function (schoolId, ir, pool) {
    const n = Math.min(ir.totalQuestions || 6, pool.length);
    if (schoolId === 'yale_som') {
      const videos = IR.shuffleArray(pool.filter((q) => q.interview_phase === 'video'));
      const lives = IR.shuffleArray(pool.filter((q) => q.interview_phase === 'live_behavioral'));
      const wantV = Math.min(2, videos.length);
      const picked = videos.slice(0, wantV);
      const used = new Set(picked.map((p) => p.id));
      const need = n - picked.length;
      const livePick = lives.filter((q) => !used.has(q.id)).slice(0, Math.min(need, lives.length));
      picked.push(...livePick);
      if (picked.length < n) {
        const rest = IR.shuffleArray(pool.filter((q) => !picked.some((p) => p.id === q.id)));
        picked.push(...rest.slice(0, n - picked.length));
      }
      return picked.slice(0, n);
    }
    if (schoolId === 'insead') {
      const picked = [];
      const used = new Set();
      const take = (pred) => {
        const arr = IR.shuffleArray(pool.filter((q) => pred(q) && !used.has(q.id)));
        const q = arr[0];
        if (q) {
          used.add(q.id);
          picked.push(q);
        }
      };
      take((q) => q.interview_phase === 'kira_video');
      take((q) => q.interview_phase === 'kira_written');
      take((q) => q.interview_phase === 'alumni_live');
      const rest = IR.shuffleArray(pool.filter((q) => !used.has(q.id)));
      while (picked.length < n && rest.length) {
        picked.push(rest.shift());
      }
      return picked.slice(0, n);
    }
    if (schoolId === 'london_business_school') {
      const picked = [];
      const used = new Set();
      const kiraFirst = IR.shuffleArray(pool.filter((q) => q.interview_phase === 'kira_video')).slice(0, 1);
      kiraFirst.forEach((q) => {
        used.add(q.id);
        picked.push(q);
      });
      const rest = IR.shuffleArray(pool.filter((q) => !used.has(q.id)));
      while (picked.length < n && rest.length) {
        picked.push(rest.shift());
      }
      return picked.slice(0, n);
    }
    if (schoolId === 'wharton') {
      const picked = [];
      const used = new Set();
      const tbd = IR.shuffleArray(pool.filter((q) => q.interview_phase === 'tbd_debrief'));
      const oneOnOne = IR.shuffleArray(pool.filter((q) => q.interview_phase === 'one_on_one'));
      tbd.slice(0, 1).forEach((q) => {
        used.add(q.id);
        picked.push(q);
      });
      oneOnOne.slice(0, 1).forEach((q) => {
        if (!used.has(q.id)) {
          used.add(q.id);
          picked.push(q);
        }
      });
      const rest = pool.filter((q) => !used.has(q.id));
      const high = IR.shuffleArray(rest.filter((q) => q.high_probability));
      const low = IR.shuffleArray(rest.filter((q) => !q.high_probability));
      for (const q of high.concat(low)) {
        if (picked.length >= n) break;
        picked.push(q);
      }
      return picked.slice(0, n);
    }
    if (schoolId === 'mit_sloan') {
      const picked = [];
      const used = new Set();
      const pre = IR.shuffleArray(pool.filter((q) => q.interview_phase === 'pre_interview_written'));
      pre.slice(0, 1).forEach((q) => {
        used.add(q.id);
        picked.push(q);
      });
      const rest = pool.filter((q) => !used.has(q.id));
      const high = IR.shuffleArray(rest.filter((q) => q.high_probability));
      const low = IR.shuffleArray(rest.filter((q) => !q.high_probability));
      for (const q of high.concat(low)) {
        if (picked.length >= n) break;
        picked.push(q);
      }
      return picked.slice(0, n);
    }
    if (schoolId === 'hbs') {
      const reflections = pool.filter(
        (q) => q.interview_phase === 'post_interview_reflection' || q.question_type === 'written_reflection'
      );
      const ref = IR.shuffleArray(reflections)[0];
      const restPool = pool.filter((q) => !reflections.some((r) => r.id === q.id));
      const high = IR.shuffleArray(restPool.filter((q) => q.high_probability));
      const low = IR.shuffleArray(restPool.filter((q) => !q.high_probability));
      const orderedRest = high.concat(low);
      const maxMain = ref ? Math.max(0, n - 1) : n;
      const main = orderedRest.slice(0, Math.min(orderedRest.length, maxMain));
      if (ref && main.length < n) return main.concat([ref]).slice(0, n);
      return main.slice(0, n);
    }
    const high = IR.shuffleArray(pool.filter((q) => q.high_probability));
    const low = IR.shuffleArray(pool.filter((q) => !q.high_probability));
    return high.concat(low).slice(0, n);
  };

  IR.buildSessionQuestions = function (id) {
    if (IR.state.customQuestions && IR.state.customQuestions.length) {
      return IR.state.customQuestions.map((text, idx) => ({
        id: 'custom-' + (idx + 1),
        text,
        responseMode: 'video',
        slot: null
      }));
    }
    const bundle = IR.state.schoolBundle;
    if (bundle && bundle.schoolId === id && bundle.interviewRoom) {
      const ir = bundle.interviewRoom;
      if (ir.pickMode === 'random_set' && ir.sets && ir.sets.length) {
        const set = ir.sets[Math.floor(Math.random() * ir.sets.length)];
        return set.map((q) => IR.mapPoolQuestionToSession(q));
      }
      const pool = bundle.questionPool || [];
      const ordered = IR.pickOrderedQuestionPool(id, ir, pool);
      return ordered.map((q) => IR.mapPoolQuestionToSession(q));
    }
    return [];
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
    const base = IR.config[IR.state.selectedSchool];
    const q = IR.state.sessionQuestions && IR.state.sessionQuestions[IR.state.currentQuestion];
    const prepTime =
      IR.state.customPrepTime != null
        ? IR.state.customPrepTime
        : (q && q.prep_time_seconds != null
            ? q.prep_time_seconds
            : (base && base.prepTime) || 0);
    IR.state.phase = 'prep';
    IR.speech.finalTranscript = '';
    IR.speech.interimTranscript = '';
    IR.ui.updateLiveTranscript();
    IR.ui.updateSessionUI();
    if (prepTime <= 0) {
      IR.startAnswer();
      return;
    }
    IR.timer.start(prepTime, t => IR.ui.updateTimerDisplay(t), () => IR.startAnswer());
  };

  IR.startAnswer = function () {
    const q = IR.state.sessionQuestions && IR.state.sessionQuestions[IR.state.currentQuestion];
    if (q && q.responseMode === 'written') {
      IR.startWrittenAnswerPhase();
      return;
    }
    IR.state.phase = 'answer';
    IR.state._as = Date.now();
    IR.speech.finalTranscript = '';
    IR.speech.interimTranscript = '';
    IR.ui.updateLiveTranscript();
    IR.ui.updateSessionUI();
    IR.media.startRecording();
    IR.speech.start();
    const base = IR.config[IR.state.selectedSchool];
    const answerTime =
      IR.state.customAnswerTime != null
        ? IR.state.customAnswerTime
        : (q && q.answer_time_seconds != null
            ? q.answer_time_seconds
            : (base && base.answerTime) || 0);
    IR.timer.start(answerTime, t => IR.ui.updateTimerDisplay(t), () => IR.finishAnswer());
  };

  IR.startWrittenAnswerPhase = function () {
    IR.state.phase = 'answer';
    IR.state._as = Date.now();
    const ta = document.getElementById('sessionWrittenInput');
    if (ta) ta.value = '';
    IR.ui.updateSessionUI();
    const base = IR.config[IR.state.selectedSchool];
    const q = IR.state.sessionQuestions && IR.state.sessionQuestions[IR.state.currentQuestion];
    const answerTime =
      IR.state.customAnswerTime != null
        ? IR.state.customAnswerTime
        : (q && q.answer_time_seconds != null
            ? q.answer_time_seconds
            : (base && base.answerTime) || 0);
    IR.timer.start(answerTime, t => IR.ui.updateTimerDisplay(t), () => IR.finishWrittenAnswer(null));
  };

  IR.finishWrittenAnswer = function (opt) {
    if (IR.state.finalizingAnswer) return;
    IR.state.finalizingAnswer = true;
    IR.ui.setSessionControlsEnabled(false);
    IR.timer.clear();
    const idx = IR.state.currentQuestion;
    const ta = document.getElementById('sessionWrittenInput');
    const text = ((ta && ta.value) || '').trim();
    IR.state.recordings[idx] = null;
    IR.state.transcripts[idx] = text;
    if (IR.state.transcriptionStatus && IR.state.transcriptionStatus[idx] !== undefined) {
      IR.state.transcriptionStatus[idx] = IR.TRANSCRIPTION_STATUS.READY;
    }
    if (IR.state.transcriptionError && IR.state.transcriptionError[idx] !== undefined) {
      IR.state.transcriptionError[idx] = null;
    }
    IR.state.answerDurations[idx] = Math.round((Date.now() - (IR.state._as || Date.now())) / 1000);
    IR.state.finalizingAnswer = false;
    IR.ui.setSessionControlsEnabled(true);
    if (IR.state.questionStatuses && IR.state.questionStatuses.length) {
      IR.state.questionStatuses[idx] = 'done';
    }
    if (opt && opt.endSession) {
      IR.requestReview();
      return;
    }
    const allDone = (IR.state.questionStatuses || []).length &&
      IR.state.questionStatuses.every(s => s === 'done');
    if (allDone) {
      IR.ui.toast('All questions complete.', 'success');
      IR.requestReview();
      return;
    }
    IR.state.sessionActive = false;
    IR.state.phase = null;
    IR.ui.toast('Answer saved. Pick another question or finish.', 'success');
    IR.showWaitingRoom();
  };

  IR.finishAnswer = async function () {
    const q = IR.state.sessionQuestions && IR.state.sessionQuestions[IR.state.currentQuestion];
    if (q && q.responseMode === 'written') {
      IR.finishWrittenAnswer(null);
      return;
    }
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

  IR.updateConfigFromDom = function () {
    const questions = IR.getCustomQuestionsFromDom();
    const qCount = questions.length;

    const prepInput = document.getElementById('prepTimeInput');
    const answerInput = document.getElementById('answerTimeInput');
    const countLabel = document.getElementById('questionCountLabel');
    const estLabel = document.getElementById('estimatedDurationLabel');
    const prevQs = document.getElementById('previewQuestions');
    const prevPrep = document.getElementById('previewPrep');
    const prevAnswer = document.getElementById('previewAnswer');
    const prevTotal = document.getElementById('previewTotal');
    const footer = document.getElementById('configFooter');
    const startNudge = document.getElementById('startNudge');
    const startPracticeBtn = document.getElementById('startPracticeBtn');

    const prepRaw = prepInput && prepInput.value.trim() !== '' ? Number(prepInput.value) : NaN;
    const answerRaw = answerInput && answerInput.value.trim() !== '' ? Number(answerInput.value) : NaN;
    const timersValid = prepRaw >= 5 && answerRaw >= 1;
    const prepSeconds = Number.isFinite(prepRaw) ? Math.max(prepRaw, 0) : 0;
    const answerMinutes = Number.isFinite(answerRaw) ? Math.max(answerRaw, 0) : 0;
    const answerSeconds = answerMinutes * 60;

    if (countLabel) {
      const n = qCount;
      countLabel.textContent = (n === 1 ? '1 question added' : `${n} questions added`);
    }

    const effectiveQuestions = qCount;
    const effPrep = prepSeconds || 0;
    const effAnswer = answerSeconds || 0;
    const totalSeconds = effectiveQuestions * (effPrep + effAnswer);
    const totalMinutes = totalSeconds ? Math.ceil(totalSeconds / 60) : 0;

    if (estLabel) {
      estLabel.textContent = totalMinutes ? `~${totalMinutes} minutes` : '~0 minutes';
    }
    if (prevQs) prevQs.textContent = String(effectiveQuestions || 0);
    if (prevPrep) prevPrep.textContent = `${effPrep || 0} sec`;
    if (prevAnswer) prevAnswer.textContent = `${Math.round((effAnswer || 0) / 60) || 0} min`;
    if (prevTotal) prevTotal.textContent = totalMinutes ? `~${totalMinutes} minutes` : '~0 minutes';

    const hasQuestions = qCount > 0;
    const ready = hasQuestions && timersValid;
    if (footer) {
      footer.classList.toggle('ir-config-footer-ready', ready);
    }
    if (startPracticeBtn) {
      startPracticeBtn.disabled = !hasQuestions;
    }
    if (startNudge) {
      if (!hasQuestions) {
        startNudge.textContent = 'Add at least one question to start your practice interview.';
        startNudge.classList.remove('ir-nudge-ready');
      } else if (!timersValid) {
        startNudge.textContent = 'Set prep time (at least 5 sec) and answer time (at least 1 min).';
        startNudge.classList.remove('ir-nudge-ready');
      } else if (qCount === 1) {
        startNudge.textContent = 'You’ve added 1 question. Add more for a fuller practice, or start when ready.';
        startNudge.classList.add('ir-nudge-ready');
      } else if (qCount === 2) {
        startNudge.textContent = 'You’ve added 2 questions. Consider adding more, or start when ready.';
        startNudge.classList.add('ir-nudge-ready');
      } else {
        startNudge.textContent = 'You are ready — start your practice interview.';
        startNudge.classList.add('ir-nudge-ready');
      }
    }
    IR.updateQuestionRemoveVisibility();
  };

  IR.getCustomQuestionsFromDom = function () {
    const list = document.getElementById('questionsList');
    if (!list) return [];
    const inputs = list.querySelectorAll('.ir-question-input');
    const raw = Array.from(inputs).map(inp => (inp.value || '').trim()).filter(Boolean);
    return raw;
  };

  IR.addCustomQuestionRow = function () {
    const list = document.getElementById('questionsList');
    if (!list) return;
    const count = list.querySelectorAll('.ir-question-row').length;
    const row = document.createElement('div');
    row.className = 'ir-question-row';
    row.setAttribute('role', 'listitem');
    row.setAttribute('data-question-index', String(count));
    row.innerHTML =
      '<input type="text" class="ir-question-input" placeholder="e.g. Why this school?" aria-label="Question ' + (count + 1) + '" />' +
      '<button type="button" class="ir-question-remove" aria-label="Remove question" title="Remove question">×</button>';
    list.appendChild(row);
    IR.updateQuestionIndices();
    IR.updateQuestionRemoveVisibility();
    IR.updateConfigFromDom();
    row.querySelector('.ir-question-input').focus();
  };

  IR.updateQuestionIndices = function () {
    const list = document.getElementById('questionsList');
    if (!list) return;
    list.querySelectorAll('.ir-question-row').forEach((r, i) => {
      r.setAttribute('data-question-index', String(i));
      const inp = r.querySelector('.ir-question-input');
      if (inp) inp.setAttribute('aria-label', 'Question ' + (i + 1));
    });
  };

  IR.updateQuestionRemoveVisibility = function () {
    const list = document.getElementById('questionsList');
    if (!list) return;
    const rows = list.querySelectorAll('.ir-question-row');
    rows.forEach((row, i) => {
      const removeBtn = row.querySelector('.ir-question-remove');
      if (removeBtn) {
        removeBtn.style.display = rows.length > 1 ? '' : 'none';
      }
    });
  };

  IR.syncPasteToQuestionRows = function () { /* no-op: paste applied via Add these questions button */ };

  IR.addPastedQuestions = function () {
    const pasteEl = document.getElementById('questionsPaste');
    const list = document.getElementById('questionsList');
    if (!pasteEl || !list) return;
    const text = (pasteEl.value || '').trim();
    if (!text) {
      IR.ui.toast('Paste one or more questions (one per line), then click Add these questions.', 'info');
      return;
    }
    const lines = text.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
    if (lines.length === 0) {
      IR.ui.toast('No non-empty lines found. Add one question per line.', 'info');
      return;
    }
    const existingRows = list.querySelectorAll('.ir-question-row');
    let linesToAdd = lines;
    if (existingRows.length === 1 && lines.length > 0) {
      const firstInput = existingRows[0].querySelector('.ir-question-input');
      if (firstInput && !firstInput.value.trim()) {
        firstInput.value = lines[0];
        linesToAdd = lines.slice(1);
      }
    }
    linesToAdd.forEach((line) => {
      IR.addCustomQuestionRow();
      const rows = list.querySelectorAll('.ir-question-row');
      const lastRow = rows[rows.length - 1];
      const inp = lastRow.querySelector('.ir-question-input');
      if (inp) inp.value = line;
    });
    pasteEl.value = '';
    IR.updateConfigFromDom();
    IR.ui.toast(lines.length === 1 ? '1 question added.' : lines.length + ' questions added.', 'success');
  };

  IR.startConfiguredFlow = async function () {
    const questions = IR.getCustomQuestionsFromDom();
    const prepInput = document.getElementById('prepTimeInput');
    const answerInput = document.getElementById('answerTimeInput');

    const prepRaw = prepInput && prepInput.value.trim() !== '' ? Number(prepInput.value) : NaN;
    const answerRaw = answerInput && answerInput.value.trim() !== '' ? Number(answerInput.value) : NaN;
    const timersValid = prepRaw >= 5 && answerRaw >= 1;

    if (questions.length === 0) {
      IR.ui.showModal(
        'Add questions to continue',
        'Add at least one question to start your practice interview. Use the field above or paste multiple questions (one per line) and click "Add these questions".',
        [{ label: 'OK', class: 'ir-btn-primary' }]
      );
      return;
    }

    if (!timersValid) {
      IR.ui.showModal(
        'Set prep and answer time',
        'Set a prep time of at least 5 seconds and an answer time of at least 1 minute before starting your practice interview.',
        [{ label: 'OK', class: 'ir-btn-primary' }]
      );
      return;
    }

    if (questions.length <= 2) {
      IR.ui.showModal(
        questions.length === 1 ? 'Only 1 question added' : 'Only 2 questions added',
        'For a fuller practice we recommend adding more questions. You can add more now or start with what you have.',
        [
          { label: 'Add more questions', class: 'ir-btn-ghost' },
          {
            label: 'Start anyway',
            class: 'ir-btn-primary',
            action: () => IR._continueStartConfiguredFlow(prepInput, answerInput)
          }
        ]
      );
      return;
    }

    IR._continueStartConfiguredFlow(prepInput, answerInput);
  };

  IR._continueStartConfiguredFlow = async function (prepInput, answerInput) {
    const questions = IR.getCustomQuestionsFromDom();
    if (questions.length === 0) return;

    IR.state.customQuestions = questions;
    IR.state.schoolBundle = null;
    IR.state.schoolDisplayName = '';
    IR.state.schoolInterviewSummary = '';
    IR.state.schoolResourceSections = [];
    IR.state.answerFrameworkMd = '';

    const prepEl = prepInput != null ? prepInput : document.getElementById('prepTimeInput');
    const answerEl = answerInput != null ? answerInput : document.getElementById('answerTimeInput');
    let prepSeconds = prepEl ? Number(prepEl.value) || 0 : 0;
    let answerMinutes = answerEl ? Number(answerEl.value) || 0 : 0;
    if (prepSeconds >= 5) {
      IR.state.customPrepTime = prepSeconds;
    } else {
      IR.state.customPrepTime = null;
    }
    if (answerMinutes >= 1) {
      IR.state.customAnswerTime = answerMinutes * 60;
    } else {
      IR.state.customAnswerTime = null;
    }

    IR.state.selectedSchool = 'custom-practice';
    IR.state.customMode = true;
    IR.state.permState = 'idle';
    IR.navigateTo('techcheck');
    IR.updateTopNav();
    if (IR.ui && IR.ui.renderFormatInfo) {
      IR.ui.renderFormatInfo('custom-practice');
    }
    if (IR.ui && IR.ui.renderAlerts) {
      IR.ui.renderAlerts();
    }
    const pt = document.getElementById('placeholderText');
    const pb = document.getElementById('permBlock');
    if (pt) pt.style.display = '';
    if (pb) pb.classList.remove('active');
    if (IR.media && IR.media.requestAccess) {
      await IR.media.requestAccess();
    }
  };

  IR.skipPhase = function () {
    if (IR.state.finalizingAnswer) return;
    if (IR.state.phase === 'prep') {
      IR.timer.clear();
      IR.startAnswer();
    } else if (IR.state.phase === 'answer') {
      const q = IR.state.sessionQuestions && IR.state.sessionQuestions[IR.state.currentQuestion];
      if (q && q.responseMode === 'written') {
        IR.finishWrittenAnswer(null);
      } else {
        IR.finishAnswer();
      }
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
            const q = IR.state.sessionQuestions && IR.state.sessionQuestions[IR.state.currentQuestion];
            if (q && q.responseMode === 'written') {
              IR.finishWrittenAnswer({ endSession: true });
              return;
            }
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
    IR.state.customQuestions = null;
    IR.state.customPrepTime = null;
    IR.state.customAnswerTime = null;
    IR.state.customMode = false;
    const w = document.getElementById('sessionWrittenInput');
    if (w) w.value = '';
    if (IR.pushMbaIrPath) IR.pushMbaIrPath('', 'replace');
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

  IR.updateTopNav = function () {
    const resourcesBtn = document.getElementById('resourcesBtn');
    if (!resourcesBtn) return;
    // Hide Haas resources entry whenever a custom session is active
    const hide = !!IR.state.customMode;
    resourcesBtn.style.display = hide ? 'none' : '';
  };

  IR.requestReview = function () {
    if (IR.transcription && IR.transcription.hasPendingJobs && IR.transcription.hasPendingJobs()) {
      IR.ui.setAiOverlay({ label: 'Finishing text from your recordings…', indeterminate: true, longRunning: true });
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
    IR.ui.copyToClipboard(IR.state.transcripts[i] || '', () => IR.ui.toast('Text copied', 'success'), () => IR.ui.toast('Copy failed. Try selecting and copying manually.', 'error'));
  };

  IR.exportTranscripts = function () {
    const schoolLine =
      (IR.state.schoolDisplayName && !IR.state.customMode
        ? IR.state.schoolDisplayName
        : IR.config[IR.state.selectedSchool]?.school) || '';
    let o = `MBA INTERVIEW ROOM — SESSION TRANSCRIPT\nSchool: ${schoolLine}\nDate: ${new Date().toLocaleDateString()}\n${'='.repeat(50)}\n\n`;
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
    IR.ui.copyToClipboard(o, () => IR.ui.toast('All answer text copied', 'success'), () => IR.ui.toast('Copy failed. Try selecting and copying manually.', 'error'));
  };

  IR.setTranscriptTab = function () { /* Single transcript view; no tabs */ };

  IR.toggleGuide = function () {
    IR.state.guideOpen = !IR.state.guideOpen;
    document.getElementById('guidePanel').classList.toggle('open', IR.state.guideOpen);
    document.getElementById('guideBackdrop').classList.toggle('open', IR.state.guideOpen);
  };

  document.addEventListener('DOMContentLoaded', () => {
    if (IR.legacyHashRedirect) IR.legacyHashRedirect();
    IR.init();
    Promise.resolve()
      .then(function () {
        return IR.fetchSchoolsRegistry ? IR.fetchSchoolsRegistry() : null;
      })
      .catch(function () {})
      .then(function () {
        if (IR.syncRouteFromLocation) return IR.syncRouteFromLocation();
      })
      .catch(function () {});
  });
})(typeof window !== 'undefined' ? window : this);
