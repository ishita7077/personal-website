/**
 * Interview Room — UI updates, toasts, modals, DOM
 */
(function (global) {
  const IR = global.IR || (global.IR = {});

  function escapeHtml(s) {
    if (s == null || s === '') return '';
    const div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  IR.ui = {
    toast(msg, type = 'info') {
      const c = document.getElementById('toastContainer');
      const el = document.createElement('div');
      el.className = `ir-toast ir-toast-${type}`;
      el.textContent = msg;
      c.appendChild(el);
      setTimeout(() => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(8px)';
        setTimeout(() => el.remove(), 300);
      }, 4000);
    },

    copyToClipboard(text, onSuccess, onFail) {
      if (!text) { if (onFail) onFail(); return; }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(onSuccess, () => {
          this._copyFallback(text, onSuccess, onFail);
        });
      } else {
        this._copyFallback(text, onSuccess, onFail);
      }
    },

    _copyFallback(text, onSuccess, onFail) {
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand('copy');
        document.body.removeChild(ta);
        if (ok && onSuccess) onSuccess();
        else if (!ok && onFail) onFail();
      } catch (e) {
        if (onFail) onFail();
      }
    },

    showModal(title, body, actions) {
      document.getElementById('modalTitle').textContent = title;
      document.getElementById('modalBody').innerHTML = body;
      const el = document.getElementById('modalActions');
      el.innerHTML = '';
      actions.forEach(a => {
        const b = document.createElement('button');
        b.className = `ir-btn ${a.class || 'ir-btn-ghost'}`;
        b.textContent = a.label;
        b.onclick = () => {
          this.hideModal();
          if (a.action) a.action();
        };
        el.appendChild(b);
      });
      document.getElementById('modalOverlay').classList.add('active');
    },

    hideModal() {
      document.getElementById('modalOverlay').classList.remove('active');
    },

    setStatus(s, t) {
      const el = document.getElementById('navStatus');
      el.dataset.status = s;
      el.textContent = t;
    },

    setSessionControlsEnabled(enabled) {
      const skip = document.getElementById('skipBtn');
      const end = document.getElementById('endSessionBtn');
      if (skip) skip.disabled = !enabled;
      if (end) end.disabled = !enabled;
    },

    setAiOverlay(opts) {
      const overlay = document.getElementById('aiOverlay');
      if (!overlay) return;
      const labelEl = document.getElementById('aiOverlayLabel');
      const fill = document.getElementById('aiOverlayFill');

      const clearLongRunning = () => {
        if (this._longRunningTimeoutId) {
          clearTimeout(this._longRunningTimeoutId);
          this._longRunningTimeoutId = null;
        }
        if (this._longRunningIntervalId) {
          clearInterval(this._longRunningIntervalId);
          this._longRunningIntervalId = null;
        }
      };

      if (opts && opts.visible === false) {
        clearLongRunning();
        overlay.style.display = 'none';
        overlay.classList.remove('indeterminate');
        if (fill) fill.style.width = '0%';
        return;
      }

      overlay.style.display = 'block';
      if (opts && opts.label && labelEl) {
        labelEl.textContent = opts.label;
      }
      if (!fill) return;

      if (opts && opts.indeterminate) {
        overlay.classList.add('indeterminate');
        fill.style.width = '30%';
      } else {
        overlay.classList.remove('indeterminate');
        const pct = opts && typeof opts.progress === 'number' ? Math.max(0, Math.min(100, opts.progress)) : 0;
        fill.style.width = pct + '%';
      }

      if (opts && opts.longRunning && labelEl) {
        clearLongRunning();
        const longMessages = [
          'This can take a few seconds…',
          'Take a breath while you wait.',
          'Still working on it…',
          'Almost there…'
        ];
        this._longRunningTimeoutId = setTimeout(() => {
          this._longRunningTimeoutId = null;
          let idx = 0;
          labelEl.textContent = longMessages[idx];
          this._longRunningIntervalId = setInterval(() => {
            idx = (idx + 1) % longMessages.length;
            labelEl.textContent = longMessages[idx];
          }, 4000);
        }, 5000);
      } else {
        clearLongRunning();
      }
    },

    fmt(s) {
      return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
    },

    updatePermUI(err) {
      const ph = document.getElementById('previewPlaceholder');
      const pb = document.getElementById('permBlock');
      const vid = document.getElementById('previewVideo');
      const ds = document.getElementById('deviceSelect');
      const bb = document.getElementById('beginBtn');
      const pt = document.getElementById('placeholderText');
      switch (IR.state.permState) {
        case 'requesting':
          ph.style.display = 'flex';
          pb.classList.remove('active');
          pt.style.display = '';
          pt.textContent = 'Requesting camera and microphone…';
          vid.classList.remove('ir-visible');
          ds.classList.remove('ir-visible');
          bb.disabled = true;
          break;
        case 'granted':
          ph.style.display = 'none';
          pb.classList.remove('active');
          vid.classList.add('ir-visible');
          vid.srcObject = IR.media.stream;
          ds.classList.add('ir-visible');
          this.populateDevSelects();
          this.updateChecks(true, true);
          bb.disabled = false;
          break;
        case 'denied':
          ph.style.display = 'flex';
          if (pt) pt.style.display = 'none';
          pb.classList.add('active');
          vid.classList.remove('ir-visible');
          ds.classList.remove('ir-visible');
          this._setPermIcon('denied');
          document.getElementById('permTitle').textContent = 'Camera and microphone access was denied';
          document.getElementById('permDesc').textContent = 'Interview Room needs access to record your practice session. All recordings stay on your device.';
          const stepsEl = document.getElementById('permSteps');
          if (stepsEl) {
            stepsEl.innerHTML = IR.isMobile && IR.isMobile()
              ? '<strong>To allow access:</strong><br>Open your browser or device Settings, find this site (or Camera/Microphone permissions), and turn on Camera and Microphone for Interview Room.'
              : 'To allow access: click the lock or camera icon in your browser\'s address bar, then set Camera and Microphone to "Allow".';
          }
          document.getElementById('retryPermBtn').textContent = 'Retry camera & microphone';
          document.getElementById('retryPermBtn').disabled = false;
          this.updateChecks(false, false);
          bb.disabled = true;
          break;
        case 'error':
          ph.style.display = 'flex';
          if (pt) pt.style.display = 'none';
          pb.classList.add('active');
          vid.classList.remove('ir-visible');
          ds.classList.remove('ir-visible');
          this._setPermIcon('warning');
          document.getElementById('permTitle').textContent = 'Camera or microphone not found';
          document.getElementById('permDesc').textContent = err && err.message ? err.message : 'No camera or microphone was detected. Connect a device and try again.';
          document.getElementById('permSteps').innerHTML = 'Check that a camera and microphone are connected and not in use by another app.';
          document.getElementById('retryPermBtn').textContent = 'Try again';
          document.getElementById('retryPermBtn').disabled = false;
          this.updateChecks(false, false);
          bb.disabled = true;
          break;
      }
    },

    _setPermIcon(type) {
      const permIcon = document.getElementById('permIcon');
      if (!permIcon) return;
      permIcon.className = 'ir-perm-icon ' + type;
      permIcon.innerHTML = type === 'denied'
        ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>'
        : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>';
    },

    updateChecks(cam, mic) {
      const ce = document.getElementById('checkCamera');
      const me = document.getElementById('checkMic');
      const be = document.getElementById('checkBrowser');
      ce.textContent = cam ? 'Connected' : 'Not connected';
      ce.className = `ir-check-status ${cam ? 'ok' : 'fail'}`;
      me.textContent = mic ? 'Connected' : 'Not connected';
      me.className = `ir-check-status ${mic ? 'ok' : 'fail'}`;
      const hr = typeof MediaRecorder !== 'undefined';
      be.textContent = hr ? (IR.speech.supported ? 'Full support' : 'No speech-to-text') : 'Not supported';
      be.className = `ir-check-status ${hr ? (IR.speech.supported ? 'ok' : 'warn') : 'fail'}`;
    },

    populateDevSelects() {
      const cs = document.getElementById('cameraSelect');
      const ms = document.getElementById('micSelect');
      cs.innerHTML = '';
      ms.innerHTML = '';
      IR.media.devices.cameras.forEach((d, i) => {
        const o = document.createElement('option');
        o.value = d.deviceId;
        o.textContent = d.label || `Camera ${i + 1}`;
        cs.appendChild(o);
      });
      IR.media.devices.mics.forEach((d, i) => {
        const o = document.createElement('option');
        o.value = d.deviceId;
        o.textContent = d.label || `Microphone ${i + 1}`;
        ms.appendChild(o);
      });
    },

    updateVideoEls() {
      const p = document.getElementById('previewVideo');
      const s = document.getElementById('sessionCamVideo');
      if (p && IR.media.stream) p.srcObject = IR.media.stream;
      if (s && IR.media.stream) s.srcObject = IR.media.stream;
    },

    renderFormatInfo(id) {
      const base = IR.config[id];
      if (!base) return;
      const customCount = IR.state.customQuestions && IR.state.customQuestions.length
        ? IR.state.customQuestions.length
        : null;
      const totalQuestions = customCount || base.totalQuestions;
      const prepTime = IR.state.customPrepTime || base.prepTime;
      const answerTime = IR.state.customAnswerTime || base.answerTime;
      const totalMin = Math.ceil(totalQuestions * (prepTime + answerTime) / 60);
      document.getElementById('formatInfo').innerHTML =
        `<div class="ir-format-item"><div class="ir-format-value">${totalQuestions}</div><div class="ir-format-label">Questions</div></div>` +
        `<div class="ir-format-item"><div class="ir-format-value">${prepTime}s</div><div class="ir-format-label">Prep Time</div></div>` +
        `<div class="ir-format-item"><div class="ir-format-value">${Math.floor(answerTime / 60)}m</div><div class="ir-format-label">Answer Time</div></div>` +
        `<div class="ir-format-item"><div class="ir-format-value">~${totalMin}m</div><div class="ir-format-label">Total Duration</div></div>`;
    },

    renderAlerts() {
      const c = document.getElementById('tcAlerts');
      c.innerHTML = '';
      if (!IR.speech.supported) {
        const alert = document.createElement('div');
        alert.className = 'ir-alert ir-alert-warning';
        alert.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>';
        const span = document.createElement('span');
        span.textContent = 'Speech recognition is not supported in this browser. Recording will still work.';
        alert.appendChild(span);
        c.appendChild(alert);
      }
      if (IR.isMobile && IR.isMobile()) {
        const alert = document.createElement('div');
        alert.className = 'ir-alert ir-alert-info';
        alert.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>';
        const span = document.createElement('span');
        span.textContent = 'Recording and review work on this device. For live transcription and faster offline notes, use Chrome or Edge on a desktop.';
        alert.appendChild(span);
        c.appendChild(alert);
      }
    },

    updateProgress() {
      const el = document.getElementById('sessionProgress');
      const statuses = IR.state.questionStatuses || [];
      el.innerHTML = '';
      statuses.forEach((status, i) => {
        const seg = document.createElement('div');
        seg.className = 'ir-progress-seg';
        if (status === 'done') seg.classList.add('done');
        else if (status === 'active') seg.classList.add(IR.state.phase === 'answer' ? 'active' : 'current');
        else if (status === 'skipped') seg.classList.add('skipped');
        else seg.classList.add('pending');
        el.appendChild(seg);
      });
    },

    updateSessionUI() {
      const q = IR.state.sessionQuestions[IR.state.currentQuestion];
      const t = IR.state.sessionQuestions.length;
      document.getElementById('sessionQLabel').textContent = `Q${IR.state.currentQuestion + 1} / ${t}`;
      document.getElementById('questionText').textContent = q ? q.text : '';
      document.getElementById('questionCard').dataset.phase = IR.state.phase;
      const pl = document.getElementById('phaseLabel');
      const sessionMedia = document.getElementById('sessionMedia');
      const liveTranscript = document.getElementById('liveTranscript');
      const recIndicator = document.getElementById('recIndicator');
      const camPreview = document.getElementById('camPreviewSmall');
      const skipBtn = document.getElementById('skipBtn');
      if (IR.state.phase === 'prep') {
        pl.textContent = 'PREPARATION';
        pl.className = 'ir-phase-label prep';
        sessionMedia.classList.remove('ir-visible');
        liveTranscript.classList.remove('ir-visible');
        recIndicator.classList.remove('ir-visible');
        camPreview.classList.remove('recording');
        skipBtn.textContent = 'Skip to answer →';
      } else {
        pl.textContent = 'ANSWER — SPEAK NOW';
        pl.className = 'ir-phase-label answer';
        sessionMedia.classList.add('ir-visible');
        liveTranscript.classList.add('ir-visible');
        recIndicator.classList.add('ir-visible');
        camPreview.classList.add('recording');
        skipBtn.textContent = 'Submit answer →';
      }
      this.updateProgress();
    },

    updateTimerDisplay(s) {
      const el = document.getElementById('sessionTimer');
      el.textContent = this.fmt(s);
      el.className = 'ir-timer';
      if (IR.state.phase === 'prep') el.classList.add(s <= 5 ? 'ir-timer-warning' : 'ir-timer-prep');
      else el.classList.add(s <= 30 ? 'ir-timer-warning' : 'ir-timer-answer');
    },

    updateLiveTranscript() {
      const el = document.getElementById('liveTranscript');
      if (!el) return;
      el.textContent = '';
      const msg = document.createElement('span');
      msg.className = 'ir-transcript-placeholder';
      if (IR.state.phase === 'prep') {
        msg.textContent = 'Recording has not started yet.';
      } else if (IR.state.phase === 'answer') {
        msg.textContent = 'Recording on this device. Notes will be prepared after you submit.';
      } else {
        msg.textContent = 'Notes are prepared after each answer is submitted.';
      }
      el.appendChild(msg);
    },

    renderWaitingRoom() {
      const list = document.getElementById('waitingList');
      const btn = document.getElementById('waitingReviewBtn');
      const nudge = document.getElementById('waitingNudge');
      if (!list) return;
      const qs = IR.state.sessionQuestions || [];
      const statuses = IR.state.questionStatuses || [];
      list.innerHTML = '';
      let anyDone = false;
      const doneCount = (statuses || []).filter(s => s === 'done').length;
      qs.forEach((q, i) => {
        const status = statuses[i] || 'pending';
        if (status === 'done') anyDone = true;
        const item = document.createElement('div');
        item.className = 'ir-waiting-item' + (status === 'done' ? ' ir-waiting-item-done' : '');
        item.title = status === 'done' ? 'Submitted — answer locked' : 'Click to attempt this question';
        if (status !== 'done') {
          item.addEventListener('click', () => IR.startQuestionFromWaiting(i));
        }
        const left = document.createElement('div');
        left.className = 'ir-waiting-item-left';
        const qLabel = document.createElement('div');
        qLabel.className = 'ir-waiting-q-label';
        qLabel.textContent = `Question ${i + 1}`;
        left.appendChild(qLabel);
        const right = document.createElement('div');
        const icon = document.createElement('span');
        let cls = 'ir-waiting-icon';
        if (status === 'done') cls += ' ir-waiting-icon-done';
        icon.className = cls;
        icon.title = status === 'done' ? 'Locked' : 'Available';
        icon.innerHTML = status === 'done'
          ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>'
          : '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor"><circle cx="8" cy="8" r="7"/><path d="M4 8.2 6.5 11 12 5" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
        right.appendChild(icon);
        item.appendChild(left);
        item.appendChild(right);
        list.appendChild(item);
      });
      if (btn) {
        const allReady = IR.transcription ? IR.transcription.areAllReadyForCompletedQuestions() : true;
        btn.disabled = !anyDone || !allReady;
        if (!anyDone) {
          btn.title = 'Complete at least one question first';
        } else if (!allReady) {
          btn.title = 'Preparing final transcripts. This will open once notes are ready.';
        } else {
          btn.title = 'View all your responses';
        }
      }
      if (nudge) {
        const allReady = IR.transcription ? IR.transcription.areAllReadyForCompletedQuestions() : true;
        if (!anyDone) {
          nudge.textContent = 'Click a question to begin';
        } else if (!allReady) {
          nudge.textContent = 'Preparing final transcripts locally…';
        } else {
          nudge.textContent = doneCount === qs.length
            ? 'All done — you can finish and review.'
            : `${doneCount} of ${qs.length} complete — pick another or finish`;
        }
      }
    },

    buildTranscriptViews(text, index) {
      const emptyMsg = 'No transcript available.';
      const enhanced = IR.state.transcriptEnhanced && IR.state.transcriptEnhanced[index];

      const container = document.createElement('div');
      container.className = 'ir-review-transcript';

      if (!text || !text.trim()) {
        container.classList.add('empty');
        const msg = document.createElement('p');
        msg.className = 'ir-transcript-empty';
        msg.textContent = emptyMsg;
        container.appendChild(msg);
      } else {
        const sentences = text.match(/[^.!?]+[.!?]*/g) || [text];
        const trimmed = sentences.map(s => s.trim()).filter(Boolean);
        const body = document.createElement('div');
        body.className = 'ir-transcript-body';
        trimmed.forEach(s => {
          const p = document.createElement('p');
          p.textContent = s;
          body.appendChild(p);
        });
        container.appendChild(body);
      }

      if (enhanced) {
        const badge = document.createElement('span');
        badge.className = 'ir-transcript-enhanced-badge';
        badge.title = 'Improved from recording';
        badge.setAttribute('aria-label', 'Improved from recording');
        badge.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z"/></svg>';
        container.appendChild(badge);
      }
      return container;
    },

    buildHaasRecommendationView(questionText) {
      const wrap = document.createElement('div');
      wrap.className = 'ir-notes-panel ir-notes-haas';
      if (!IR.getHaasRecommendation || !questionText) return wrap;
      const rec = IR.getHaasRecommendation(questionText);
      if (!rec || !rec.guidance) return wrap;
      if (rec.bucket) {
        const cat = document.createElement('div');
        cat.className = 'ir-haas-bucket';
        cat.textContent = rec.bucket;
        wrap.appendChild(cat);
      }
      const points = String(rec.guidance || '')
        .split(/(?:\.\\s+|;\\s+)/)
        .map(s => s.trim())
        .filter(Boolean);
      const list = document.createElement('ul');
      list.className = 'ir-haas-guidance-list';
      (points.length ? points : [rec.guidance]).forEach(text => {
        const li = document.createElement('li');
        li.textContent = text;
        list.appendChild(li);
      });
      wrap.appendChild(list);
      if (rec.source) {
        const src = document.createElement('a');
        src.className = 'ir-haas-source';
        src.href = rec.source;
        src.target = '_blank';
        src.rel = 'noopener noreferrer';
        src.textContent = 'Source: Haas MBA';
        wrap.appendChild(src);
      }
      return wrap;
    },

    renderReview() {
      const c = document.getElementById('reviewCards');
      c.innerHTML = '';
      c.removeEventListener('click', this._reviewCardClickHandler);
      this._reviewCardClickHandler = (e) => {
        const header = e.target.closest('.ir-review-card-header');
        if (header) {
          header.parentElement.classList.toggle('open');
          return;
        }
        const dl = e.target.closest('[data-action="download-video"]');
        if (dl) { IR.downloadVideo(Number(dl.dataset.index)); return; }
        const cp = e.target.closest('[data-action="copy-transcript"]');
        if (cp) { IR.copyTranscript(Number(cp.dataset.index)); return; }
        const notesTab = e.target.closest('.ir-notes-tab');
        if (notesTab) {
          const tabRow = notesTab.closest('.ir-notes-tabs');
          if (!tabRow) return;
          const panel = notesTab.dataset.panel;
          tabRow.querySelectorAll('.ir-notes-tab').forEach(btn => btn.classList.toggle('active', btn.dataset.panel === panel));
          const panelsWrap = tabRow.nextElementSibling;
          if (panelsWrap && panelsWrap.classList.contains('ir-notes-panels')) {
            panelsWrap.querySelectorAll('.ir-notes-panel').forEach((p, idx) => {
              p.classList.toggle('active', (panel === 'transcript' && idx === 0) || (panel === 'haas' && idx === 1));
            });
          }
          return;
        }
      };
      c.addEventListener('click', this._reviewCardClickHandler);

      const statuses = IR.state.questionStatuses || [];

      IR.state.sessionQuestions.forEach((q, i) => {
        const status = statuses[i] || 'pending';
        const blob = IR.state.recordings[i];
        const hasRecording = !!blob;
        const tr = IR.state.transcripts[i] || '';
        const dur = IR.state.answerDurations[i] || 0;

        const url = blob ? IR.getReviewBlobUrl(i, blob) : null;
        const card = document.createElement('div');
        card.className = 'ir-review-card';
        card.dataset.cardIndex = String(i);

        const isDone = status === 'done' || hasRecording;
        const isSkipped = !hasRecording && status !== 'done';

        const meta = document.createElement('span');
        meta.className = 'ir-review-meta';
        if (isSkipped) {
          const span = document.createElement('span');
          span.className = 'ir-review-duration';
          span.textContent = 'Skipped';
          meta.appendChild(span);
        } else {
          const lock = document.createElement('span');
          lock.className = 'ir-review-lock';
          lock.title = 'Submitted — cannot re-record';
          lock.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>';
          meta.appendChild(lock);
          const durSpan = document.createElement('span');
          durSpan.className = 'ir-review-duration';
          durSpan.textContent = IR.ui.fmt(dur);
          meta.appendChild(durSpan);
        }

        const header = document.createElement('div');
        header.className = 'ir-review-card-header';
        header.title = 'Click to expand';
        const qNum = document.createElement('span');
        qNum.className = 'ir-review-q-num';
        qNum.textContent = `Q${i + 1}`;
        const qText = document.createElement('span');
        qText.className = 'ir-review-q-text';
        qText.textContent = q.text;
        const chevron = document.createElement('span');
        chevron.className = 'ir-review-chevron';
        chevron.textContent = '▼';
        header.appendChild(qNum);
        header.appendChild(qText);
        header.appendChild(meta);
        header.appendChild(chevron);
        card.appendChild(header);

        const body = document.createElement('div');
        body.className = 'ir-review-card-body';
        if (isSkipped) {
          const p = document.createElement('p');
          p.className = 'ir-review-skipped-msg';
          p.textContent = 'You skipped this question. No recording is available.';
          body.appendChild(p);
        } else {
          if (url) {
            const video = document.createElement('video');
            video.className = 'ir-review-video';
            video.controls = true;
            video.playsInline = true;
            video.src = url;
            body.appendChild(video);
          } else {
            const p = document.createElement('p');
            p.className = 'ir-review-skipped-msg';
            p.textContent = 'No recording.';
            body.appendChild(p);
          }
        }

        const transLabel = document.createElement('div');
        transLabel.className = 'ir-label ir-label-transcript';
        transLabel.textContent = 'NOTES';
        body.appendChild(transLabel);

        const questionForNotes = IR.state.sessionQuestions[i];
        const questionText = questionForNotes && questionForNotes.text ? questionForNotes.text : '';
        const hasHaas = IR.getHaasRecommendation && IR.getHaasRecommendation(questionText);
        if (hasHaas) {
          const notesWrap = document.createElement('div');
          notesWrap.className = 'ir-review-notes-wrap';
          const tabRow = document.createElement('div');
          tabRow.className = 'ir-notes-tabs';
          tabRow.dataset.index = String(i);
          const btnNotes = document.createElement('button');
          btnNotes.type = 'button';
          btnNotes.className = 'ir-notes-tab active';
          btnNotes.dataset.panel = 'transcript';
          btnNotes.textContent = 'Notes';
          const btnHaas = document.createElement('button');
          btnHaas.type = 'button';
          btnHaas.className = 'ir-notes-tab';
          btnHaas.dataset.panel = 'haas';
          btnHaas.textContent = 'Haas recommendations';
          tabRow.appendChild(btnNotes);
          tabRow.appendChild(btnHaas);
          notesWrap.appendChild(tabRow);
          const panelsWrap = document.createElement('div');
          panelsWrap.className = 'ir-notes-panels';
          const transcriptPanel = document.createElement('div');
          transcriptPanel.className = 'ir-notes-panel ir-notes-transcript active';
          transcriptPanel.appendChild(IR.ui.buildTranscriptViews(tr, i));
          const haasPanel = IR.ui.buildHaasRecommendationView(questionText);
          panelsWrap.appendChild(transcriptPanel);
          panelsWrap.appendChild(haasPanel);
          notesWrap.appendChild(panelsWrap);
          body.appendChild(notesWrap);
        } else {
          body.appendChild(IR.ui.buildTranscriptViews(tr, i));
        }

        const actions = document.createElement('div');
        actions.className = 'ir-review-actions-row';
        if (url) {
          const btnV = document.createElement('button');
          btnV.type = 'button';
          btnV.className = 'ir-btn ir-btn-ghost ir-btn-sm ir-btn-icon';
          btnV.dataset.action = 'download-video';
          btnV.dataset.index = String(i);
          btnV.title = 'Download this recording';
          btnV.innerHTML = '<span class="ir-icon" aria-hidden="true"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg></span> Download recording';
          actions.appendChild(btnV);
        }
        const btnC = document.createElement('button');
        btnC.type = 'button';
        btnC.className = 'ir-btn ir-btn-ghost ir-btn-sm ir-btn-icon';
        btnC.dataset.action = 'copy-transcript';
        btnC.dataset.index = String(i);
        btnC.title = 'Copy this transcript';
        btnC.innerHTML = '<span class="ir-icon" aria-hidden="true"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></span> Copy transcript';
        actions.appendChild(btnC);
        body.appendChild(actions);
        card.appendChild(body);
        c.appendChild(card);
      });

      // session summary is a static \"coming soon\" card in HTML now
    },

    refreshTranscriptForIndex(index) {
      if (IR.state.screen !== 'review') return;
      this.renderReview();
    },

    renderResources() {
      const list = document.getElementById('resourcesList');
      if (!list || !IR.haasResourceSections) return;
      list.innerHTML = '';
      IR.haasResourceSections.forEach((section) => {
        const sec = document.createElement('section');
        sec.className = 'ir-resource-section';
        const header = document.createElement('div');
        header.className = 'ir-resource-section-header';
        const title = document.createElement('h2');
        title.className = 'ir-h3';
        title.textContent = section.title;
        header.appendChild(title);
        if (section.blurb) {
          const blurb = document.createElement('p');
          blurb.className = 'ir-resource-blurb';
          blurb.textContent = section.blurb;
          header.appendChild(blurb);
        }
        sec.appendChild(header);
        const grid = document.createElement('div');
        grid.className = 'ir-resource-grid';
        (section.items || []).forEach((r) => {
          const item = document.createElement('article');
          item.className = 'ir-resource-item';
          const name = document.createElement('div');
          name.className = 'ir-resource-name';
          const link = document.createElement('a');
          link.href = r.url;
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          link.textContent = r.name;
          name.appendChild(link);
          const topic = document.createElement('p');
          topic.className = 'ir-resource-topic';
          topic.textContent = r.topic;
          item.appendChild(name);
          item.appendChild(topic);
          grid.appendChild(item);
        });
        sec.appendChild(grid);
        list.appendChild(sec);
      });
    }
  };
})(typeof window !== 'undefined' ? window : this);
