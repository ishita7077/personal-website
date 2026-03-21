/**
 * Interview Room — AI feedback (OpenAI) flow.
 * Consent-driven, optional. API key stays on server; only transcript text is sent.
 */
(function (global) {
  const IR = global.IR || (global.IR = {});

  const CONSENT_KEY = 'ir_ai_feedback_consent';
  const API_PATH = '/api/mba-interview/enhanced-feedback';

  function inferQuestionType(tags, text) {
    const lower = String(text || '').toLowerCase();
    const set = new Set((tags || []).map(String));
    if (set.has('goals') || /goal/.test(lower)) return 'goals';
    if (set.has('communication')) return 'other';
    if (set.has('collaboration')) return 'leadership';
    if (set.has('leadership') || /leader/.test(lower)) return 'leadership';
    if (set.has('values') || set.has('dei') || /value|principle/.test(lower)) return 'values';
    if (set.has('closing') || /anything else|else you would like to add/i.test(lower)) return 'closing';
    return 'behavioral';
  }

  function buildExpectedAnswerMap(rec) {
    if (!rec || !rec.guidance) return { corePoints: [] };
    const text = String(rec.guidance);
    const parts = text
      .split(/[\.\n•\-]+/g)
      .map(s => s.trim())
      .filter(Boolean);
    return {
      questionGoal: rec.bucket || '',
      corePoints: parts,
      niceToHave: [],
      redFlags: [],
      examplesOfGoodDirection: []
    };
  }

  function getConsent() {
    try {
      return localStorage.getItem(CONSENT_KEY) === '1';
    } catch (e) {
      return false;
    }
  }

  function setConsent() {
    try {
      localStorage.setItem(CONSENT_KEY, '1');
    } catch (e) {}
  }

  /**
   * Show one-time consent modal. Calls onAgreed() when user checks the box and confirms.
   * Does not set consent or call onAgreed if user cancels or closes without confirming.
   */
  function showConsentModal(onAgreed) {
    if (!IR.ui || !IR.ui.showModal) {
      onAgreed();
      return;
    }

    const link = 'https://openai.com/policies/api-data-usage-policies';
    const body = document.createElement('div');
    body.className = 'ir-enhanced-consent-body';

    const p1 = document.createElement('p');
    p1.textContent =
      'Optional written feedback reads what you said and suggests improvements. You only need to confirm this once in this browser.';
    body.appendChild(p1);

    const p2 = document.createElement('p');
    p2.textContent =
      'Only the text of your answers is sent over the network to produce suggestions. Video and audio stay on your device. Nothing is saved in this app after the response returns.';
    body.appendChild(p2);
    const a = document.createElement('a');
    a.href = link;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.textContent = 'Provider data policy (OpenAI)';
    body.appendChild(a);
    const p3 = document.createElement('p');
    p3.style.marginTop = '1em';
    p3.textContent = 'By continuing, you agree to send your answer text under that policy.';
    body.appendChild(p3);

    const checkboxWrap = document.createElement('label');
    checkboxWrap.style.display = 'flex';
    checkboxWrap.style.alignItems = 'flex-start';
    checkboxWrap.style.gap = '0.5rem';
    checkboxWrap.style.marginTop = '1rem';
    checkboxWrap.style.cursor = 'pointer';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = 'ir-enhanced-consent-check';
    const span = document.createElement('span');
    span.textContent = 'I understand and want to use optional written feedback.';
    checkboxWrap.appendChild(checkbox);
    checkboxWrap.appendChild(span);
    body.appendChild(checkboxWrap);

    const modalBody = document.getElementById('modalBody');
    const modalActions = document.getElementById('modalActions');
    const modalTitle = document.getElementById('modalTitle');
    if (!modalBody || !modalActions || !modalTitle) {
      onAgreed();
      return;
    }

    modalTitle.textContent = 'Optional written feedback';
    modalBody.innerHTML = '';
    modalBody.appendChild(body);

    const overlay = document.getElementById('modalOverlay');
    if (overlay) overlay.classList.add('active');

    const continueBtn = document.createElement('button');
    continueBtn.type = 'button';
    continueBtn.className = 'ir-btn ir-btn-primary';
    continueBtn.textContent = 'Continue';
    continueBtn.disabled = true;
    checkbox.addEventListener('change', function () {
      continueBtn.disabled = !checkbox.checked;
    });

    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.className = 'ir-btn ir-btn-ghost';
    cancelBtn.textContent = 'Cancel';

    modalActions.innerHTML = '';
    modalActions.appendChild(cancelBtn);
    modalActions.appendChild(continueBtn);

    const close = (IR.ui && IR.ui.hideModal) ? function () { IR.ui.hideModal(); } : function () {
      const overlay = document.getElementById('modalOverlay');
      if (overlay) overlay.classList.remove('active');
    };

    const done = function () {
      close();
      modalActions.innerHTML = '';
    };

    cancelBtn.addEventListener('click', function () {
      done();
    });

    continueBtn.addEventListener('click', function () {
      if (!checkbox.checked) return;
      setConsent();
      done();
      onAgreed();
    });
  }

  function getApiBase() {
    const base = typeof window !== 'undefined' && window.location && window.location.origin
      ? window.location.origin
      : '';
    return base + API_PATH;
  }

  /**
   * Request AI feedback for a single answer. Ensures consent first, then POSTs full payload.
   * On success, stores structured review in IR.state.enhancedAnswerReviews[index] and sets status.
   */
  function requestEnhancedAnswerFeedback(index, callback) {
    const questions = IR.state.sessionQuestions || [];
    const transcripts = IR.state.transcripts || [];
    const q = questions[index];
    const transcript = transcripts[index];
    if (!q || typeof transcript !== 'string' || !transcript.trim()) {
      if (callback) callback(new Error('No transcript for this answer'));
      return;
    }

    function doRequest() {
      if (!IR.state.enhancedAnswerStatus) IR.state.enhancedAnswerStatus = {};
      IR.state.enhancedAnswerStatus[index] = 'loading';
      if (IR.ui && IR.ui.updateReviewCardAI) IR.ui.updateReviewCardAI(index);
      if (IR.ui && IR.ui.updateEnhancedBlock) IR.ui.updateEnhancedBlock(index);

      const haas = (typeof IR.getHaasRecommendation === 'function' && q && q.text)
        ? IR.getHaasRecommendation(q.text)
        : null;
      const tq = (IR.state.transcriptQuality && IR.state.transcriptQuality[index]) || null;
      const durations = IR.state.answerDurations || [];
      const durationSec = typeof durations[index] === 'number' ? durations[index] : null;

      const qId = q.id || ('Q' + (index + 1));
      const qType = inferQuestionType(q.tags || [], q.text || '');
      const hasDatasetMap = q.expected_answer_map && Array.isArray(q.expected_answer_map.corePoints) && q.expected_answer_map.corePoints.length;
      const expectedAnswerMap = hasDatasetMap ? q.expected_answer_map : buildExpectedAnswerMap(haas);

      const payloadBody = {
        questionId: qId,
        questionText: q.text || '',
        questionType: qType,
        transcript: transcript.trim(),
        questionIndex: index,
        expectedAnswerMap: expectedAnswerMap
      };
      if (IR.state && IR.state.schoolDisplayName && IR.state.schoolInterviewSummary) {
        payloadBody.schoolDisplayName = IR.state.schoolDisplayName;
        payloadBody.schoolInterviewSummary = IR.state.schoolInterviewSummary;
      }

      const payload = {
        type: 'per_answer',
        payload: payloadBody
      };

      fetch(getApiBase(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(function (res) {
          return res.json().then(function (data) {
            if (!res.ok) {
              const err = new Error(data.error || data.details || 'Request failed');
              err.status = res.status;
              throw err;
            }
            return data;
          });
        })
        .then(function (raw) {
          IR.state.enhancedAnswerReviews = IR.state.enhancedAnswerReviews || {};
          IR.state.enhancedAnswerReviews[index] = raw;
          IR.state.enhancedAnswerStatus[index] = 'ready';
          if (IR.ui && IR.ui.updateReviewCardAI) IR.ui.updateReviewCardAI(index);
          if (IR.ui && IR.ui.updateEnhancedBlock) IR.ui.updateEnhancedBlock(index);
          if (callback) callback(null, IR.state.enhancedAnswerReviews[index]);
        })
        .catch(function (err) {
          IR.state.enhancedAnswerStatus[index] = 'failed';
          if (IR.ui && IR.ui.updateReviewCardAI) IR.ui.updateReviewCardAI(index);
          if (IR.ui && IR.ui.updateEnhancedBlock) IR.ui.updateEnhancedBlock(index);
          if (IR.ui && IR.ui.toast) {
            IR.ui.toast((err && err.message) || 'Could not generate suggestions', 'error');
          }
          if (callback) callback(err);
        });
    }

    if (getConsent()) {
      doRequest();
    } else {
      showConsentModal(doRequest);
    }
  }

  /**
   * Request session summary. Ensures consent, then POSTs all answers plus any answer-level reviews.
   */
  function requestEnhancedSessionSummary(callback) {
    const questions = IR.state.sessionQuestions || [];
    const transcripts = IR.state.transcripts || [];
    const answers = [];
    for (let i = 0; i < (questions.length || 0); i++) {
      const q = questions[i];
      const t = transcripts[i];
      if (q && typeof t === 'string') {
        const review = IR.state.enhancedAnswerReviews && IR.state.enhancedAnswerReviews[i];
        const haas = (typeof IR.getHaasRecommendation === 'function' && q.text)
          ? IR.getHaasRecommendation(q.text)
          : null;
        const hasDatasetMap = q.expected_answer_map && Array.isArray(q.expected_answer_map.corePoints) && q.expected_answer_map.corePoints.length;
        const expectedAnswerMap = hasDatasetMap ? q.expected_answer_map : (haas ? buildExpectedAnswerMap(haas) : undefined);
        answers.push({
          questionId: q.id || ('Q' + (i + 1)),
          questionText: (q.text || '').trim(),
          questionType: inferQuestionType(q.tags || [], q.text || ''),
          transcript: t.trim(),
          expectedAnswerMap,
          answerReview: review || null
        });
      }
    }
    if (answers.length === 0) {
      if (callback) callback(new Error('No transcripts to summarize'));
      if (IR.ui && IR.ui.toast) IR.ui.toast('Add text for at least one answer to run a full-session summary.', 'warning');
      return;
    }

    function doRequest() {
      IR.state.enhancedSessionSummaryStatus = 'loading';
      IR.state.enhancedSessionSummaryError = null;
      if (IR.ui && IR.ui.updateSessionSummaryCard) IR.ui.updateSessionSummaryCard();
      if (IR.ui && IR.ui.updateEnhancedSessionCard) IR.ui.updateEnhancedSessionCard();

      const sessionPayload = { answers };
      if (IR.state && IR.state.schoolDisplayName && IR.state.schoolInterviewSummary) {
        sessionPayload.schoolDisplayName = IR.state.schoolDisplayName;
        sessionPayload.schoolInterviewSummary = IR.state.schoolInterviewSummary;
      }

      fetch(getApiBase(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'session',
          payload: sessionPayload
        })
      })
        .then(function (res) {
          return res.json().then(function (data) {
            if (!res.ok) {
              const err = new Error(data.error || data.details || 'Request failed');
              err.status = res.status;
              throw err;
            }
            return data;
          });
        })
        .then(function (raw) {
          IR.state.enhancedSessionSummary = raw;
          IR.state.enhancedSessionSummaryStatus = 'ready';
          if (IR.ui && IR.ui.updateSessionSummaryCard) IR.ui.updateSessionSummaryCard();
          if (IR.ui && IR.ui.updateEnhancedSessionCard) IR.ui.updateEnhancedSessionCard();
          if (callback) callback(null, IR.state.enhancedSessionSummary);
        })
        .catch(function (err) {
          IR.state.enhancedSessionSummaryStatus = 'failed';
          IR.state.enhancedSessionSummaryError = (err && err.message) || String(err);
          if (IR.ui && IR.ui.updateSessionSummaryCard) IR.ui.updateSessionSummaryCard();
          if (IR.ui && IR.ui.updateEnhancedSessionCard) IR.ui.updateEnhancedSessionCard();
          if (IR.ui && IR.ui.toast) {
            IR.ui.toast((err && err.message) || 'Session summary failed', 'error');
          }
          if (callback) callback(err);
        });
    }

    if (getConsent()) {
      doRequest();
    } else {
      showConsentModal(doRequest);
    }
  }

  IR.aiFeedback = {
    getConsent,
    setConsent,
    showConsentModal,
    requestEnhancedAnswerFeedback,
    requestEnhancedSessionSummary,
    getApiBase: getApiBase
  };
})(typeof window !== 'undefined' ? window : this);
