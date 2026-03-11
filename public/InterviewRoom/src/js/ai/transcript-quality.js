(function (global) {
  const IR = global.IR || (global.IR = {});

  const QUALITY = {
    HIGH: 'high',
    MEDIUM: 'medium',
    LOW: 'low'
  };

  const FILLERS = [
    'uh', 'um', 'like', 'you know', 'i mean', 'sort of', 'kind of',
    'basically', 'actually', 'literally', 'so yeah'
  ];

  function tokenize(text) {
    if (!text) return [];
    return String(text)
      .toLowerCase()
      .replace(/[\r\n]+/g, ' ')
      .split(/\s+/)
      .filter(Boolean);
  }

  function countFillers(words) {
    if (!words || !words.length) return 0;
    const joined = words.join(' ');
    let count = 0;
    for (const f of FILLERS) {
      const re = new RegExp('\\b' + f.replace(/\s+/, '\\s+') + '\\b', 'gi');
      const m = joined.match(re);
      if (m) count += m.length;
    }
    return count;
  }

  function assessTranscriptQuality(text) {
    const raw = (text || '').trim();
    if (!raw) {
      return {
        quality: QUALITY.LOW,
        isUsableForReview: false,
        reason: 'empty',
        message: 'Transcript is empty.',
        stats: { wordCount: 0 }
      };
    }

    const words = tokenize(raw);
    const wordCount = words.length;
    const uniqueWordCount = new Set(words).size;
    const uniqueRatio = wordCount ? uniqueWordCount / wordCount : 0;
    const fillerCount = countFillers(words);
    const fillerRatio = wordCount ? fillerCount / wordCount : 0;
    const ellipsisCount = (raw.match(/\.{3,}/g) || []).length;
    const repeatedChunks = (raw.match(/(.{10,})\1{1,}/g) || []).length;

    // Heuristic guardrails
    if (wordCount < 20) {
      return {
        quality: QUALITY.LOW,
        isUsableForReview: false,
        reason: 'too_short',
        message: 'Transcript is too short for reliable AI feedback.',
        stats: { wordCount, uniqueRatio, fillerRatio, ellipsisCount, repeatedChunks }
      };
    }

    if (repeatedChunks > 0) {
      return {
        quality: QUALITY.LOW,
        isUsableForReview: false,
        reason: 'repeated_garbage',
        message: 'Transcript appears corrupted or highly repetitive.',
        stats: { wordCount, uniqueRatio, fillerRatio, ellipsisCount, repeatedChunks }
      };
    }

    let quality = QUALITY.MEDIUM;
    const reasons = [];

    if (wordCount > 60 && uniqueRatio > 0.6 && fillerRatio < 0.08 && ellipsisCount === 0) {
      quality = QUALITY.HIGH;
      reasons.push('sufficient_length', 'good_variety', 'low_fillers');
    } else if (wordCount >= 40 && uniqueRatio > 0.4) {
      quality = QUALITY.MEDIUM;
      reasons.push('adequate_length', 'ok_variety');
    } else {
      quality = QUALITY.LOW;
      reasons.push('low_variety_or_length');
    }

    if (fillerRatio > 0.15) {
      quality = QUALITY.LOW;
      reasons.push('high_fillers');
    }

    const isUsableForReview = quality !== QUALITY.LOW;

    return {
      quality,
      isUsableForReview,
      reason: reasons[0] || null,
      message: !isUsableForReview
        ? 'Transcript quality too low for reliable AI feedback.'
        : null,
      stats: {
        wordCount,
        uniqueRatio,
        fillerRatio,
        ellipsisCount,
        repeatedChunks
      }
    };
  }

  IR.transcriptQuality = {
    QUALITY,
    assess: assessTranscriptQuality
  };
})(typeof window !== 'undefined' ? window : this);

