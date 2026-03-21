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
          document.getElementById('permDesc').textContent = 'MBA Interview Room needs access to record your practice session. All recordings stay on your device.';
          const stepsEl = document.getElementById('permSteps');
          if (stepsEl) {
            stepsEl.innerHTML = IR.isMobile && IR.isMobile()
              ? '<strong>To allow access:</strong><br>Open your browser or device Settings, find this site (or Camera/Microphone permissions), and turn on Camera and Microphone for this site.'
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

      const isCustom = !!(IR.state && IR.state.customMode);
      const questionCount = isCustom
        ? (IR.state.customQuestions && IR.state.customQuestions.length) || base.totalQuestions
        : base.totalQuestions;
      const prepTime = isCustom
        ? (IR.state.customPrepTime != null ? IR.state.customPrepTime : base.prepTime)
        : base.prepTime;
      const answerTime = isCustom
        ? (IR.state.customAnswerTime != null ? IR.state.customAnswerTime : base.answerTime)
        : base.answerTime;

      const totalMin = Math.ceil(questionCount * (prepTime + answerTime) / 60);
      document.getElementById('formatInfo').innerHTML =
        `<div class="ir-format-item"><div class="ir-format-value">${questionCount}</div><div class="ir-format-label">Questions</div></div>` +
        `<div class="ir-format-item"><div class="ir-format-value">${prepTime}s</div><div class="ir-format-label">Prep Time</div></div>` +
        `<div class="ir-format-item"><div class="ir-format-value">${Math.floor(answerTime / 60)}m</div><div class="ir-format-label">Answer Time</div></div>` +
        `<div class="ir-format-item"><div class="ir-format-value">~${totalMin}m</div><div class="ir-format-label">Total Duration</div></div>`;

      const brief = document.getElementById('programmeBrief');
      const lead = document.getElementById('programmeBriefLead');
      const body = document.getElementById('programmeBriefBody');
      const mech = document.getElementById('programmeBriefMechanics');
      const foot = document.getElementById('programmeBriefFoot');
      if (brief && lead && body && foot) {
        if (isCustom) {
          brief.classList.add('ir-hidden');
          if (mech) {
            mech.textContent = '';
            mech.classList.add('ir-hidden');
          }
        } else {
          const meta = IR.state && IR.state.schoolMeta;
          const sid = IR.state && IR.state.selectedSchool;
          const regSchool = (IR.SCHOOLS_LIST || []).find((s) => s.id === id);
          const listing = regSchool && regSchool.listing;
          if (meta && sid === id) {
            const leadText = (meta.validated_interview_format || (listing && listing.interview_style_summary) || '').trim();
            const bodyText = (meta.unique_elements || (listing && listing.unique_hook) || '').trim();
            if (leadText) {
              lead.textContent = leadText;
              lead.classList.remove('ir-hidden');
            } else {
              lead.textContent = '';
              lead.classList.add('ir-hidden');
            }
            if (bodyText) {
              body.textContent = bodyText;
              body.classList.remove('ir-hidden');
            } else {
              body.textContent = '';
              body.classList.add('ir-hidden');
            }
            const who =
              meta.interviewer_type ||
              (listing && listing.interviewer_profile ? listing.interviewer_profile : '');
            if (who) {
              foot.textContent = 'Who you might see: ' + who;
              foot.classList.remove('ir-hidden');
            } else {
              foot.textContent = '';
              foot.classList.add('ir-hidden');
            }
            if (mech && listing && listing.practice_mechanics) {
              mech.textContent = listing.practice_mechanics;
              mech.classList.remove('ir-hidden');
            } else if (mech) {
              mech.textContent = '';
              mech.classList.add('ir-hidden');
            }
            const showBrief =
              !lead.classList.contains('ir-hidden') ||
              !body.classList.contains('ir-hidden') ||
              (mech && !mech.classList.contains('ir-hidden')) ||
              !foot.classList.contains('ir-hidden');
            brief.classList.toggle('ir-hidden', !showBrief);
          } else {
            brief.classList.add('ir-hidden');
            if (mech) {
              mech.textContent = '';
              mech.classList.add('ir-hidden');
            }
          }
        }
      }
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

    humanizePromptKind(q) {
      if (!q || (IR.state && IR.state.customMode)) return '';
      const ph = String(q.interview_phase || '');
      const qt = String(q.question_type || '');
      const byPhase = {
        live_behavioral: 'Behavioural',
        video: 'Short video',
        kira_video: 'Timed video',
        kira_written: 'Written',
        alumni_live: 'Live interview',
        live_or_video: 'Prompt',
        post_interview_reflection: 'Written reflection',
        pre_interview_written: 'Written exercise',
        live_file_aware: 'Application-aware interview',
        tbd_debrief: 'Team discussion debrief',
        one_on_one: 'One-to-one'
      };
      const byType = {
        behavioral: 'Behavioural',
        timed_video: 'Timed video',
        written_timed: 'Written',
        written_reflection: 'Written',
        data_task: 'Written',
        team_exercise: 'Team-style',
        reflection: 'Reflection',
        goals: 'Goals'
      };
      const a = byPhase[ph] || (ph ? ph.replace(/_/g, ' ') : '');
      const b = byType[qt] || (qt ? qt.replace(/_/g, ' ') : '');
      if (a && b && a.toLowerCase() !== b.toLowerCase()) return `${a} · ${b}`;
      return a || b || '';
    },

    updateSessionUI() {
      const q = IR.state.sessionQuestions[IR.state.currentQuestion];
      const t = IR.state.sessionQuestions.length;
      const written = q && q.responseMode === 'written';
      document.getElementById('sessionQLabel').textContent = `Q${IR.state.currentQuestion + 1} / ${t}`;
      document.getElementById('questionText').textContent = q ? q.text : '';
      const phaseEl = document.getElementById('questionPhase');
      if (phaseEl) {
        const line = this.humanizePromptKind(q);
        if (line) {
          phaseEl.textContent = line;
          phaseEl.hidden = false;
        } else {
          phaseEl.textContent = '';
          phaseEl.hidden = true;
        }
      }
      document.getElementById('questionCard').dataset.phase = IR.state.phase;
      document.getElementById('questionCard').dataset.response = written ? 'written' : 'video';
      const pl = document.getElementById('phaseLabel');
      const sessionMedia = document.getElementById('sessionMedia');
      const liveTranscript = document.getElementById('liveTranscript');
      const recIndicator = document.getElementById('recIndicator');
      const camPreview = document.getElementById('camPreviewSmall');
      const skipBtn = document.getElementById('skipBtn');
      const writtenWrap = document.getElementById('sessionWrittenWrap');
      if (IR.state.phase === 'prep') {
        pl.textContent = written ? 'GET READY' : 'PREPARATION';
        pl.className = 'ir-phase-label prep';
        sessionMedia.classList.remove('ir-visible');
        liveTranscript.classList.remove('ir-visible');
        recIndicator.classList.remove('ir-visible');
        camPreview.classList.remove('recording');
        if (writtenWrap) writtenWrap.classList.add('ir-hidden');
        skipBtn.textContent = written ? 'Start writing →' : 'Skip to answer →';
      } else if (written) {
        pl.textContent = 'WRITE YOUR ANSWER';
        pl.className = 'ir-phase-label answer ir-phase-written';
        sessionMedia.classList.remove('ir-visible');
        liveTranscript.classList.remove('ir-visible');
        recIndicator.classList.remove('ir-visible');
        camPreview.classList.remove('recording');
        if (writtenWrap) writtenWrap.classList.remove('ir-hidden');
        skipBtn.textContent = 'Submit →';
      } else {
        pl.textContent = 'ANSWER — SPEAK NOW';
        pl.className = 'ir-phase-label answer';
        sessionMedia.classList.add('ir-visible');
        liveTranscript.classList.add('ir-visible');
        recIndicator.classList.add('ir-visible');
        camPreview.classList.add('recording');
        if (writtenWrap) writtenWrap.classList.add('ir-hidden');
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
      const progBrief = document.getElementById('waitingProgrammeBrief');
      if (progBrief) {
        if (
          IR.state &&
          !IR.state.customMode &&
          IR.state.schoolMeta &&
          IR.state.schoolDisplayName
        ) {
          const m = IR.state.schoolMeta;
          progBrief.classList.remove('ir-hidden');
          progBrief.textContent = '';
          const wrap = document.createElement('div');
          wrap.className = 'ir-waiting-programme-inner';
          const lab = document.createElement('span');
          lab.className = 'ir-label';
          lab.textContent = IR.state.schoolDisplayName.toUpperCase();
          const p = document.createElement('p');
          p.className = 'ir-waiting-programme-text';
          p.textContent = m.validated_interview_format || '';
          wrap.appendChild(lab);
          wrap.appendChild(p);
          progBrief.appendChild(wrap);
        } else {
          progBrief.classList.add('ir-hidden');
          progBrief.innerHTML = '';
        }
      }
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
          btn.title = 'Finishing text from your recordings. Review opens when it’s ready.';
        } else {
          btn.title = 'View all your responses';
        }
      }
      if (nudge) {
        const allReady = IR.transcription ? IR.transcription.areAllReadyForCompletedQuestions() : true;
        if (!anyDone) {
          nudge.textContent = 'Click a question to begin';
        } else if (!allReady) {
          nudge.textContent = 'Finishing text from your recordings…';
        } else {
          nudge.textContent = doneCount === qs.length
            ? 'All done — you can finish and review.'
            : `${doneCount} of ${qs.length} complete — pick another or finish`;
        }
      }
    },

    buildTranscriptViews(text, index) {
      const status = (IR.state.transcriptionStatus || [])[index];
      const sq = IR.state.sessionQuestions && IR.state.sessionQuestions[index];
      const isWritten = sq && sq.responseMode === 'written';
      const isFailed = status === (IR.TRANSCRIPTION_STATUS && IR.TRANSCRIPTION_STATUS.FAILED);
      const isPending = status === (IR.TRANSCRIPTION_STATUS && IR.TRANSCRIPTION_STATUS.PENDING) ||
        status === (IR.TRANSCRIPTION_STATUS && IR.TRANSCRIPTION_STATUS.TRANSCRIBING);
      const emptyMsg = isFailed
        ? ((IR.state.transcriptionError && IR.state.transcriptionError[index]) ||
          'Transcription could not be generated. Your recording was saved — you can download it. For best results use Chrome or Edge on a desktop.')
        : isPending
          ? 'Preparing text…'
          : isWritten
            ? 'No text submitted.'
            : 'No text yet.';
      const enhanced = IR.state.transcriptEnhanced && IR.state.transcriptEnhanced[index];

      const container = document.createElement('div');
      container.className = 'ir-review-transcript';
      if (isFailed) container.classList.add('ir-transcript-failed');

      if (!text || !text.trim()) {
        container.classList.add('empty');
        const msg = document.createElement('p');
        msg.className = isFailed ? 'ir-transcript-empty ir-transcript-error' : 'ir-transcript-empty';
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

    buildAIReviewBlock(index) {
      const i = index;
      const tq = IR.state.transcriptQuality && IR.state.transcriptQuality[i];
      const transcript = (IR.state.transcripts || [])[i];
      const enhStatus = (IR.state.enhancedAnswerStatus || {})[i];
      const enhReview = (IR.state.enhancedAnswerReviews || {})[i];

      const aiSection = document.createElement('div');
      aiSection.className = 'ir-ai-review-block';

      const titleEl = document.createElement('div');
      titleEl.className = 'ir-ai-review-title';
      titleEl.textContent = 'Answer insights';
      aiSection.appendChild(titleEl);

      if (tq && tq.quality) {
        const qualityStr = typeof tq.quality === 'string' ? tq.quality : String(tq.quality);
        const tqLine = document.createElement('p');
        tqLine.className = 'ir-ai-review-meta';
        tqLine.textContent = 'Answer text quality: ' + qualityStr;
        aiSection.appendChild(tqLine);
      }

      const note = document.createElement('p');
      note.className = 'ir-ai-review-meta';
      note.textContent = 'Optional suggestions use only your written answer text—not video or audio.';
      aiSection.appendChild(note);

      // If we have no transcript, just explain why there is no AI feedback.
      if (typeof transcript !== 'string' || !transcript.trim()) {
        const p = document.createElement('p');
        p.className = 'ir-ai-review-status';
        p.textContent = 'There’s no text for this answer yet, so suggestions aren’t available.';
        aiSection.appendChild(p);
        return aiSection;
      }

      const enhWrap = document.createElement('div');
      enhWrap.className = 'ir-ai-review-subsection ir-enhanced-feedback-wrap';

      if (enhStatus === 'loading') {
        const p = document.createElement('p');
        p.className = 'ir-ai-review-status';
        p.textContent = 'Generating suggestions…';
        enhWrap.appendChild(p);
      } else if (enhStatus === 'failed') {
        const p = document.createElement('p');
        p.className = 'ir-ai-review-status';
        p.textContent = 'Suggestions couldn’t be generated. You can try again.';
        enhWrap.appendChild(p);
        const retryBtn = document.createElement('button');
        retryBtn.type = 'button';
        retryBtn.className = 'ir-btn ir-btn-ghost ir-btn-sm';
        retryBtn.dataset.action = 'enhanced-feedback-retry';
        retryBtn.dataset.index = String(i);
        retryBtn.textContent = 'Try again';
        enhWrap.appendChild(retryBtn);
      } else if (enhStatus === 'ready' && enhReview) {
        if (enhReview.summary && enhReview.summary.trim()) {
          const summaryP = document.createElement('p');
          summaryP.className = 'ir-ai-review-summary';
          summaryP.textContent = enhReview.summary;
          enhWrap.appendChild(summaryP);
        }

        const bullets = function (label, items, cls) {
          if (!items || !items.length) return;
          const sub = document.createElement('div');
          sub.className = 'ir-ai-review-subsection' + (cls ? ' ' + cls : '');
          const t = document.createElement('div');
          t.className = 'ir-ai-review-subtitle';
          t.textContent = label;
          sub.appendChild(t);
          const ul = document.createElement('ul');
          items.forEach(function (x) {
            const li = document.createElement('li');
            li.textContent = x;
            ul.appendChild(li);
          });
          sub.appendChild(ul);
          enhWrap.appendChild(sub);
        };

        bullets('Strengths', enhReview.strengths || [], '');
        bullets('Suggestions', enhReview.suggestions || enhReview.gaps || [], 'ir-ai-review-improve');

        if (enhReview.coaching && enhReview.coaching.note) {
          const coach = document.createElement('div');
          coach.className = 'ir-ai-review-subsection ir-ai-review-coaching';
          const ct = document.createElement('div');
          ct.className = 'ir-ai-review-subtitle';
          ct.textContent = 'Coaching';
          coach.appendChild(ct);
          const p = document.createElement('p');
          p.textContent = enhReview.coaching.note;
          coach.appendChild(p);
          enhWrap.appendChild(coach);
        } else if (enhReview.feedback && typeof enhReview.feedback === 'object') {
          const f = enhReview.feedback;
          const coach = document.createElement('div');
          coach.className = 'ir-ai-review-subsection ir-ai-review-coaching';
          const ct = document.createElement('div');
          ct.className = 'ir-ai-review-subtitle';
          ct.textContent = 'Coaching';
          coach.appendChild(ct);
          const pairs = [
            ['Biggest issue', f.biggest_issue],
            ['Keep', f.what_to_keep],
            ['Add', f.what_to_add],
            ['Remove', f.what_to_remove],
            ['Next attempt', f.next_attempt_advice]
          ];
          pairs.forEach(function (pair) {
            if (!pair[1]) return;
            const p = document.createElement('p');
            p.className = 'ir-ai-review-coach-line';
            p.innerHTML = '<strong>' + pair[0] + ':</strong> ' + pair[1];
            coach.appendChild(p);
          });
          if (coach.childNodes.length > 1) enhWrap.appendChild(coach);
        }
      } else {
        const p = document.createElement('p');
        p.className = 'ir-ai-review-status';
        p.textContent = 'No suggestions yet for this answer.';
        enhWrap.appendChild(p);
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'ir-btn ir-btn-ghost ir-btn-sm';
        btn.dataset.action = 'enhanced-feedback';
        btn.dataset.index = String(i);
        btn.textContent = 'Get suggestions';
        btn.title = 'Send this answer’s text for optional strengths and improvements';
        enhWrap.appendChild(btn);
      }

      aiSection.appendChild(enhWrap);
      return aiSection;
    },

    buildExpectedMapGuidanceView(map) {
      const wrap = document.createElement('div');
      wrap.className = 'ir-notes-panel ir-notes-haas';
      if (!map || !Array.isArray(map.corePoints) || !map.corePoints.length) return wrap;
      if (map.questionGoal) {
        const cat = document.createElement('div');
        cat.className = 'ir-haas-bucket';
        cat.textContent = map.questionGoal;
        wrap.appendChild(cat);
      }
      const list = document.createElement('ul');
      list.className = 'ir-haas-guidance-list';
      map.corePoints.forEach(function (text) {
        const li = document.createElement('li');
        li.textContent = text;
        list.appendChild(li);
      });
      wrap.appendChild(list);
      if (map.niceToHave && map.niceToHave.length) {
        const sub = document.createElement('div');
        sub.className = 'ir-haas-bucket';
        sub.style.marginTop = '0.75rem';
        sub.textContent = 'Also consider';
        wrap.appendChild(sub);
        const list2 = document.createElement('ul');
        list2.className = 'ir-haas-guidance-list';
        map.niceToHave.forEach(function (text) {
          const li = document.createElement('li');
          li.textContent = text;
          list2.appendChild(li);
        });
        wrap.appendChild(list2);
      }
      return wrap;
    },

    buildCombinedGuidanceView(questionText, qObj) {
      const map = qObj && qObj.expected_answer_map;
      if (map && Array.isArray(map.corePoints) && map.corePoints.length) {
        return this.buildExpectedMapGuidanceView(map);
      }
      return this.buildHaasRecommendationView(questionText);
    },

    hasGuidanceForQuestion(questionText, qObj) {
      const map = qObj && qObj.expected_answer_map;
      if (map && Array.isArray(map.corePoints) && map.corePoints.length) return true;
      return !!(IR.getHaasRecommendation && IR.getHaasRecommendation(questionText));
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
      c.parentElement.removeEventListener('click', this._reviewCardClickHandler);
      this._reviewCardClickHandler = (e) => {
        const enhSessionBtn = e.target.closest('[data-action="enhanced-session-summary"]');
        if (enhSessionBtn && IR.aiFeedback && IR.aiFeedback.requestEnhancedSessionSummary) {
          IR.aiFeedback.requestEnhancedSessionSummary();
          return;
        }
        const header = e.target.closest('.ir-review-card-header');
        if (header) {
          header.parentElement.classList.toggle('open');
          return;
        }
        const dl = e.target.closest('[data-action="download-video"]');
        if (dl) { IR.downloadVideo(Number(dl.dataset.index)); return; }
        const cp = e.target.closest('[data-action="copy-transcript"]');
        if (cp) { IR.copyTranscript(Number(cp.dataset.index)); return; }
        const enhBtn = e.target.closest('[data-action="enhanced-feedback"]');
        if (enhBtn && IR.aiFeedback && IR.aiFeedback.requestEnhancedAnswerFeedback) {
          IR.aiFeedback.requestEnhancedAnswerFeedback(Number(enhBtn.dataset.index));
          return;
        }
        const enhRetry = e.target.closest('[data-action="enhanced-feedback-retry"]');
        if (enhRetry && IR.aiFeedback && IR.aiFeedback.requestEnhancedAnswerFeedback) {
          IR.aiFeedback.requestEnhancedAnswerFeedback(Number(enhRetry.dataset.index));
          return;
        }
        const notesTab = e.target.closest('.ir-notes-tab');
        if (notesTab) {
          const tabRow = notesTab.closest('.ir-notes-tabs');
          if (!tabRow) return;
          const panel = notesTab.dataset.panel;
          tabRow.querySelectorAll('.ir-notes-tab').forEach(btn => btn.classList.toggle('active', btn.dataset.panel === panel));
          const panelsWrap = tabRow.nextElementSibling;
          if (panelsWrap && panelsWrap.classList.contains('ir-notes-panels')) {
            panelsWrap.querySelectorAll('.ir-notes-panel').forEach((p, idx) => {
              p.classList.toggle('active', (panel === 'transcript' && idx === 0) || (panel === 'guidance' && idx === 1));
            });
          }
          return;
        }
      };
      c.parentElement.addEventListener('click', this._reviewCardClickHandler);

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
          } else if (q && q.responseMode === 'written') {
            /* Answer text lives under NOTES only — avoids duplicate empty states */
          } else {
            const pend = (IR.state.transcriptionStatus || [])[i];
            const pending =
              pend === IR.TRANSCRIPTION_STATUS.PENDING || pend === IR.TRANSCRIPTION_STATUS.TRANSCRIBING;
            const p = document.createElement('p');
            p.className = 'ir-review-skipped-msg';
            p.textContent = pending ? 'Preparing text from recording…' : 'No recording.';
            body.appendChild(p);
          }
        }

        const transLabel = document.createElement('div');
        transLabel.className = 'ir-label ir-label-transcript';
        transLabel.textContent = 'NOTES';
        body.appendChild(transLabel);

        const questionForNotes = IR.state.sessionQuestions[i];
        const questionText = questionForNotes && questionForNotes.text ? questionForNotes.text : '';
        const hasGuidance = IR.ui.hasGuidanceForQuestion(questionText, questionForNotes);
        if (hasGuidance) {
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
          const btnGuidance = document.createElement('button');
          btnGuidance.type = 'button';
          btnGuidance.className = 'ir-notes-tab';
          btnGuidance.dataset.panel = 'guidance';
          btnGuidance.textContent = 'School guidance';
          tabRow.appendChild(btnNotes);
          tabRow.appendChild(btnGuidance);
          notesWrap.appendChild(tabRow);
          const panelsWrap = document.createElement('div');
          panelsWrap.className = 'ir-notes-panels';
          const transcriptPanel = document.createElement('div');
          transcriptPanel.className = 'ir-notes-panel ir-notes-transcript active';
          transcriptPanel.appendChild(IR.ui.buildTranscriptViews(tr, i));
          const guidancePanel = IR.ui.buildCombinedGuidanceView(questionText, questionForNotes);
          panelsWrap.appendChild(transcriptPanel);
          panelsWrap.appendChild(guidancePanel);
          notesWrap.appendChild(panelsWrap);
          body.appendChild(notesWrap);
        } else {
          body.appendChild(IR.ui.buildTranscriptViews(tr, i));
        }

        // AI review section: one block under NOTES, same visual language as transcript/Haas.
        const aiSection = this.buildAIReviewBlock(i);
        body.appendChild(aiSection);

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
        btnC.title = 'Copy this answer as text';
        btnC.innerHTML = '<span class="ir-icon" aria-hidden="true"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></span> Copy text';
        actions.appendChild(btnC);
        body.appendChild(actions);
        card.appendChild(body);
        c.appendChild(card);
      });

      // Session summary: render if a local summary is available.
      const summary = IR.state.sessionSummary;
      const summaryStatus = IR.state.sessionSummaryStatus;
      if (summary || summaryStatus === 'running' || summaryStatus === 'failed' || summaryStatus === 'unavailable') {
        const wrap = document.createElement('div');
        wrap.className = 'ir-session-summary-card';
        wrap.id = 'irSessionSummaryCard';

        const header = document.createElement('div');
        header.className = 'ir-session-summary-header';
        const h = document.createElement('h2');
        h.className = 'ir-h2';
        h.textContent = 'Session summary';
        header.appendChild(h);
        const status = document.createElement('span');
        status.className = 'ir-session-summary-status';
        let statusText = '';
        if (summaryStatus === 'running') statusText = 'Generating locally…';
        else if (summaryStatus === 'ready') statusText = 'Ready';
        else if (summaryStatus === 'unavailable') statusText = 'On-device summary off — text notes only';
        else if (summaryStatus === 'failed') statusText = 'Summary failed — see per-answer reviews';
        else if (summaryStatus === 'skipped') statusText = 'Skipped (no valid reviews)';
        status.textContent = statusText;
        header.appendChild(status);
        wrap.appendChild(header);

        if (summaryStatus === 'ready' && summary) {
          const body = document.createElement('div');
          body.className = 'ir-session-summary-body';

          const overall = document.createElement('p');
          overall.className = 'ir-session-summary-overall';
          overall.textContent = summary.overall_assessment || '';
          body.appendChild(overall);

          const listBlock = (label, items, cls) => {
            if (!items || !items.length) return;
            const sec = document.createElement('div');
            sec.className = cls;
            const t = document.createElement('div');
            t.className = 'ir-session-summary-subtitle';
            t.textContent = label;
            sec.appendChild(t);
            const ul = document.createElement('ul');
            items.forEach(x => {
              const li = document.createElement('li');
              li.textContent = x;
              ul.appendChild(li);
            });
            sec.appendChild(ul);
            body.appendChild(sec);
          };

          listBlock('Top strengths', summary.top_strengths, 'ir-session-summary-strengths');
          listBlock('Top issues', summary.top_issues, 'ir-session-summary-issues');
          listBlock('Recurring patterns', summary.recurring_patterns, 'ir-session-summary-patterns');

          if (summary.highest_priority_fix) {
            const hp = document.createElement('div');
            hp.className = 'ir-session-summary-priority';
            const t = document.createElement('div');
            t.className = 'ir-session-summary-subtitle';
            t.textContent = 'Highest-priority fix';
            hp.appendChild(t);
            const p1 = document.createElement('p');
            p1.textContent = summary.highest_priority_fix.issue || '';
            hp.appendChild(p1);
            if (summary.highest_priority_fix.why_it_matters) {
              const p2 = document.createElement('p');
              p2.textContent = 'Why it matters: ' + summary.highest_priority_fix.why_it_matters;
              hp.appendChild(p2);
            }
            if (summary.highest_priority_fix.practice_drill) {
              const p3 = document.createElement('p');
              p3.textContent = 'Practice drill: ' + summary.highest_priority_fix.practice_drill;
              hp.appendChild(p3);
            }
            body.appendChild(hp);
          }

          if (Array.isArray(summary.next_session_plan) && summary.next_session_plan.length) {
            const plan = document.createElement('div');
            plan.className = 'ir-session-summary-plan';
            const t = document.createElement('div');
            t.className = 'ir-session-summary-subtitle';
            t.textContent = 'Next session plan';
            plan.appendChild(t);
            const ul = document.createElement('ul');
            summary.next_session_plan.forEach(step => {
              const li = document.createElement('li');
              const parts = [];
              if (step.focus) parts.push('Focus: ' + step.focus);
              if (step.exercise) parts.push('Exercise: ' + step.exercise);
              if (step.goal) parts.push('Goal: ' + step.goal);
              li.textContent = parts.join(' · ');
              ul.appendChild(li);
            });
            plan.appendChild(ul);
            body.appendChild(plan);
          }

          wrap.appendChild(body);
        }

        c.parentElement.insertBefore(wrap, c);
      }

      this.updateSessionSummaryCard();
    },

    refreshTranscriptForIndex(index) {
      if (IR.state.screen !== 'review') return;
      this.renderReview();
    },

    /** Update only the AI block for one card (keeps card open/closed and scroll). */
    updateReviewCardAI(index) {
      if (IR.state.screen !== 'review') return;
      const c = document.getElementById('reviewCards');
      if (!c) return;
      const card = c.querySelector('.ir-review-card[data-card-index="' + index + '"]');
      if (!card) return;
      const body = card.querySelector('.ir-review-card-body');
      if (!body) return;
      const oldBlock = body.querySelector('.ir-ai-review-block');
      const newBlock = this.buildAIReviewBlock(index);
      if (oldBlock && oldBlock.parentNode) {
        oldBlock.parentNode.replaceChild(newBlock, oldBlock);
      } else {
        body.appendChild(newBlock);
      }
    },

    updateEnhancedBlock(index) {
      this.updateReviewCardAI(index);
    },

    updateEnhancedSessionCard() {
      this.updateSessionSummaryCard();
    },

    /** Session summary card — optional cloud summary when enabled. */
    updateSessionSummaryCard() {
      if (IR.state.screen !== 'review') return;
      const c = document.getElementById('reviewCards');
      if (!c || !c.parentElement) return;

      const transcripts = IR.state.transcripts || [];
      const hasAnyTranscript = transcripts.some(function (t) { return typeof t === 'string' && t.trim(); });
      let wrap = document.getElementById('irSessionSummaryCard');
      if (hasAnyTranscript && IR.aiFeedback) {
        if (!wrap) {
          wrap = document.createElement('div');
          wrap.className = 'ir-session-summary-card';
          wrap.id = 'irSessionSummaryCard';
          c.parentElement.insertBefore(wrap, c);
        }

        wrap.innerHTML = '';
        const enhStatus = IR.state.enhancedSessionSummaryStatus || 'idle';
        const enhSummary = IR.state.enhancedSessionSummary;
        const enhError = IR.state.enhancedSessionSummaryError;

        const header = document.createElement('div');
        header.className = 'ir-session-summary-header';
        const h = document.createElement('h2');
        h.className = 'ir-h2';
        h.textContent = 'Session summary';
        header.appendChild(h);
        const status = document.createElement('span');
        status.className = 'ir-session-summary-status';
        if (enhStatus === 'loading') status.textContent = 'Generating…';
        else if (enhStatus === 'ready') status.textContent = 'Ready';
        else if (enhStatus === 'failed') status.textContent = 'Failed';
        else status.textContent = '';
        header.appendChild(status);
        wrap.appendChild(header);

        if (enhStatus === 'loading') {
          const p = document.createElement('p');
          p.className = 'ir-ai-review-status';
          p.textContent = 'Building a full-session summary from your answers…';
          wrap.appendChild(p);
        } else if (enhStatus === 'failed') {
          const p = document.createElement('p');
          p.className = 'ir-ai-review-status';
          p.textContent = enhError || 'Session summary failed.';
          wrap.appendChild(p);
          const retryBtn = document.createElement('button');
          retryBtn.type = 'button';
          retryBtn.className = 'ir-btn ir-btn-ghost ir-btn-sm';
          retryBtn.dataset.action = 'enhanced-session-summary';
          retryBtn.textContent = 'Try again';
          wrap.appendChild(retryBtn);
        } else if (enhStatus === 'ready' && enhSummary) {
          const body = document.createElement('div');
          body.className = 'ir-session-summary-body';
          const overall = document.createElement('p');
          overall.className = 'ir-session-summary-overall';
          overall.textContent = enhSummary.overall_assessment || '';
          body.appendChild(overall);
          const listBlock = function (label, items, cls) {
            if (!items || !items.length) return;
            const sec = document.createElement('div');
            sec.className = cls || '';
            const t = document.createElement('div');
            t.className = 'ir-session-summary-subtitle';
            t.textContent = label;
            sec.appendChild(t);
            const ul = document.createElement('ul');
            items.forEach(function (x) { const li = document.createElement('li'); li.textContent = x; ul.appendChild(li); });
            sec.appendChild(ul);
            body.appendChild(sec);
          };
          listBlock('Top strengths', enhSummary.top_strengths, 'ir-session-summary-strengths');
          listBlock(
            'Top gaps',
            enhSummary.top_gaps || enhSummary.top_issues,
            'ir-session-summary-issues'
          );
          listBlock(
            'Recurring themes',
            enhSummary.repeated_missing_themes || enhSummary.recurring_patterns,
            'ir-session-summary-patterns'
          );
          listBlock('Next steps', enhSummary.top_next_steps, 'ir-session-summary-plan');
          listBlock('Warning flags', enhSummary.warning_flags, 'ir-session-summary-issues');
          if (
            Array.isArray(enhSummary.questions_most_in_need_of_revision) &&
            enhSummary.questions_most_in_need_of_revision.length
          ) {
            const rev = document.createElement('div');
            rev.className = 'ir-session-summary-plan';
            const rt = document.createElement('div');
            rt.className = 'ir-session-summary-subtitle';
            rt.textContent = 'Questions to revise first';
            rev.appendChild(rt);
            const ul = document.createElement('ul');
            enhSummary.questions_most_in_need_of_revision.forEach(function (row) {
              const li = document.createElement('li');
              li.textContent =
                (row && row.question_id ? row.question_id + ': ' : '') +
                (row && row.reason ? row.reason : '');
              ul.appendChild(li);
            });
            rev.appendChild(ul);
            body.appendChild(rev);
          }
          if (enhSummary.highest_priority_fix && (enhSummary.highest_priority_fix.issue || enhSummary.highest_priority_fix.why_it_matters || enhSummary.highest_priority_fix.practice_drill)) {
            const hp = document.createElement('div');
            hp.className = 'ir-session-summary-priority';
            const t = document.createElement('div');
            t.className = 'ir-session-summary-subtitle';
            t.textContent = 'Highest-priority fix';
            hp.appendChild(t);
            if (enhSummary.highest_priority_fix.issue) { const p1 = document.createElement('p'); p1.textContent = enhSummary.highest_priority_fix.issue; hp.appendChild(p1); }
            if (enhSummary.highest_priority_fix.why_it_matters) { const p2 = document.createElement('p'); p2.textContent = 'Why it matters: ' + enhSummary.highest_priority_fix.why_it_matters; hp.appendChild(p2); }
            if (enhSummary.highest_priority_fix.practice_drill) { const p3 = document.createElement('p'); p3.textContent = 'Practice drill: ' + enhSummary.highest_priority_fix.practice_drill; hp.appendChild(p3); }
            body.appendChild(hp);
          }
          if (Array.isArray(enhSummary.next_session_plan) && enhSummary.next_session_plan.length) {
            const plan = document.createElement('div');
            plan.className = 'ir-session-summary-plan';
            const pt = document.createElement('div');
            pt.className = 'ir-session-summary-subtitle';
            pt.textContent = 'Next session plan';
            plan.appendChild(pt);
            const ul = document.createElement('ul');
            enhSummary.next_session_plan.forEach(function (step) {
              const li = document.createElement('li');
              const parts = [];
              if (step.focus) parts.push('Focus: ' + step.focus);
              if (step.exercise) parts.push('Exercise: ' + step.exercise);
              if (step.goal) parts.push('Goal: ' + step.goal);
              li.textContent = parts.join(' · ');
              ul.appendChild(li);
            });
            plan.appendChild(ul);
            body.appendChild(plan);
          }
          wrap.appendChild(body);
        } else {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'ir-btn ir-btn-ghost ir-btn-sm';
          btn.dataset.action = 'enhanced-session-summary';
          btn.textContent = 'Generate summary';
          btn.title = 'Send your answer text for an optional full-session summary';
          wrap.appendChild(btn);
        }
      } else {
        if (wrap) wrap.remove();
      }
    },

    async renderResources() {
      const list = document.getElementById('resourcesList');
      if (!list) return;
      try {
        if (IR.fetchSchoolsRegistry) await IR.fetchSchoolsRegistry();
      } catch (e) {
        /* picker may stay empty */
      }

      const titleEl = document.getElementById('resourcesTitle');
      const subEl = document.getElementById('resourcesSub');
      const dname = (IR.state && IR.state.schoolDisplayName) || '';
      const meta = IR.state && IR.state.schoolMeta;
      const fwMd = IR.state && IR.state.answerFrameworkMd;
      let sections = [];
      if (IR.state && IR.state.schoolResourceSections && IR.state.schoolResourceSections.length) {
        sections = IR.state.schoolResourceSections;
      }

      function resourceDomain(url) {
        try {
          return new URL(url).hostname.replace(/^www\./i, '');
        } catch (e) {
          return '';
        }
      }

      if (titleEl) {
        titleEl.textContent = dname ? `${dname} — prep resources` : 'Interview prep resources';
      }
      if (subEl) {
        if (dname) {
          subEl.textContent =
            'Official pages, trusted third-party notes, and a short planning guide for this programme. After you practice, use Review to see school-specific guidance for each question.';
        } else {
          subEl.textContent =
            'Pick an MBA programme below to load its links and planning guide. You can open this page anytime from the top bar—no need to start a recording first.';
        }
      }

      list.innerHTML = '';

      const schools = IR.SCHOOLS_LIST || [];
      if (schools.length) {
        const toolbar = document.createElement('div');
        toolbar.className = 'ir-resources-toolbar';
        const lab = document.createElement('span');
        lab.className = 'ir-label';
        lab.textContent = 'Programme';
        toolbar.appendChild(lab);
        const wrapSel = document.createElement('div');
        wrapSel.className = 'ir-resources-select-wrap';
        const sel = document.createElement('select');
        sel.className = 'ir-resources-program-select';
        sel.setAttribute('aria-label', 'Choose MBA programme for resources');
        const opt0 = document.createElement('option');
        opt0.value = '';
        opt0.textContent = dname ? 'Switch to another programme…' : 'Choose a programme…';
        sel.appendChild(opt0);
        let picked = false;
        const curId = IR.state && IR.state.selectedSchool;
        schools.forEach((s) => {
          const o = document.createElement('option');
          o.value = s.id;
          o.textContent = s.display_name;
          if (curId && curId === s.id) {
            o.selected = true;
            picked = true;
          }
          sel.appendChild(o);
        });
        if (!picked) {
          opt0.selected = true;
        }
        sel.addEventListener('change', () => {
          const v = sel.value;
          if (!v || !IR.loadResourcesProgram) return;
          IR.loadResourcesProgram(v);
        });
        wrapSel.appendChild(sel);
        toolbar.appendChild(wrapSel);
        list.appendChild(toolbar);
      }

      if (!dname && schools.length) {
        const pickIntro = document.createElement('p');
        pickIntro.className = 'ir-resources-picker-intro ir-body';
        pickIntro.textContent =
          'Or jump straight in—tap a school to load its resource pack:';
        list.appendChild(pickIntro);
        const picker = document.createElement('div');
        picker.className = 'ir-resources-picker-grid';
        schools.forEach((s) => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'ir-resources-picker-btn';
          btn.textContent = s.display_name;
          btn.addEventListener('click', () => {
            if (IR.loadResourcesProgram) IR.loadResourcesProgram(s.id);
          });
          picker.appendChild(btn);
        });
        list.appendChild(picker);
      }

      if (dname && meta) {
        const snap = document.createElement('section');
        snap.className = 'ir-resources-snapshot';
        const snapTitle = document.createElement('h2');
        snapTitle.className = 'ir-h3';
        snapTitle.textContent = 'Interview format snapshot';
        snap.appendChild(snapTitle);
        if (meta.validated_interview_format) {
          const p = document.createElement('p');
          p.className = 'ir-resources-snapshot-lead';
          p.textContent = meta.validated_interview_format;
          snap.appendChild(p);
        }
        if (meta.unique_elements) {
          const sub = document.createElement('p');
          sub.className = 'ir-resources-snapshot-sub';
          const strong = document.createElement('strong');
          strong.textContent = 'What makes it distinctive: ';
          sub.appendChild(strong);
          sub.appendChild(document.createTextNode(meta.unique_elements));
          snap.appendChild(sub);
        }
        const curId = IR.state && IR.state.selectedSchool;
        const reg = schools.find((s) => s.id === curId);
        const whoLine =
          meta.interviewer_type ||
          (reg && reg.listing && reg.listing.interviewer_profile) ||
          '';
        if (whoLine) {
          const who = document.createElement('p');
          who.className = 'ir-resources-snapshot-who';
          who.textContent = 'Who you might meet: ' + whoLine;
          snap.appendChild(who);
        }
        if (reg && reg.listing && reg.listing.practice_mechanics) {
          const pm = document.createElement('p');
          pm.className = 'ir-resources-snapshot-mechanics';
          pm.textContent = reg.listing.practice_mechanics;
          snap.appendChild(pm);
        }
        list.appendChild(snap);
      }

      sections.forEach((section) => {
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
          const item = document.createElement('a');
          item.className = 'ir-resource-item ir-resource-item-card';
          item.href = r.url;
          item.target = '_blank';
          item.rel = 'noopener noreferrer';
          const row = document.createElement('div');
          row.className = 'ir-resource-item-top';
          const linkTitle = document.createElement('span');
          linkTitle.className = 'ir-resource-link-title';
          linkTitle.textContent = r.name;
          row.appendChild(linkTitle);
          const chev = document.createElement('span');
          chev.className = 'ir-resource-link-chev';
          chev.setAttribute('aria-hidden', 'true');
          chev.textContent = '↗';
          row.appendChild(chev);
          item.appendChild(row);
          if (r.topic) {
            const desc = document.createElement('p');
            desc.className = 'ir-resource-item-desc';
            desc.textContent = r.topic;
            item.appendChild(desc);
          }
          const a11y = document.createElement('span');
          a11y.className = 'sr-only';
          a11y.textContent = ' Opens in a new tab.';
          item.appendChild(a11y);
          const foot = document.createElement('div');
          foot.className = 'ir-resource-item-foot';
          const dom = document.createElement('span');
          dom.className = 'ir-resource-domain';
          dom.textContent = resourceDomain(r.url);
          foot.appendChild(dom);
          item.appendChild(foot);
          grid.appendChild(item);
        });
        sec.appendChild(grid);
        list.appendChild(sec);
      });

      if (fwMd && IR.frameworkMdToHtml) {
        const html = IR.frameworkMdToHtml(fwMd);
        if (html) {
          const fwSec = document.createElement('section');
          fwSec.className = 'ir-resource-section ir-resource-framework-section';
          const fwHead = document.createElement('div');
          fwHead.className = 'ir-resource-section-header';
          const fwTitle = document.createElement('h2');
          fwTitle.className = 'ir-h3';
          fwTitle.textContent = 'Planning your answers';
          fwHead.appendChild(fwTitle);
          const fwBlurb = document.createElement('p');
          fwBlurb.className = 'ir-resource-blurb';
          fwBlurb.textContent =
            'Which kinds of examples to have ready, plus simple habits that work in any interview. For your prep—not wording to repeat verbatim.';
          fwHead.appendChild(fwBlurb);
          fwSec.appendChild(fwHead);
          const article = document.createElement('div');
          article.className = 'ir-framework-article';
          article.innerHTML = html;
          fwSec.appendChild(article);
          list.appendChild(fwSec);
        }
      }

      if (!dname && !sections.length && !fwMd) {
        const empty = document.createElement('p');
        empty.className = 'ir-body ir-resources-empty';
        empty.textContent =
          schools.length === 0
            ? 'Programme list could not be loaded. Refresh the page or open this app from /mba-interview-room on the live site.'
            : 'Select a programme above to load links and the planning guide.';
        list.appendChild(empty);
      }
    }
  };
})(typeof window !== 'undefined' ? window : this);
