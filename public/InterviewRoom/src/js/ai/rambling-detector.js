(function (global) {
  const IR = global.IR || (global.IR = {});

  const CONNECTOR_PREFIXES = [
    'and then', 'so then', 'and so', 'so yeah', 'and yeah',
    'basically', 'actually', 'like', 'you know', 'i mean'
  ];

  function splitSentences(text) {
    if (!text) return [];
    const raw = String(text).replace(/\s+/g, ' ').trim();
    if (!raw) return [];
    const parts = raw.match(/[^.!?]+[.!?]*/g) || [raw];
    return parts.map(s => s.trim()).filter(Boolean);
  }

  function countPrefixMatches(sentences) {
    let count = 0;
    const lower = sentences.map(s => s.toLowerCase());
    for (const s of lower) {
      for (const p of CONNECTOR_PREFIXES) {
        if (s.startsWith(p + ' ')) {
          count++;
          break;
        }
      }
    }
    return count;
  }

  function estimateSpecificity(sentences) {
    const joined = sentences.join(' ');
    const tokens = joined.split(/\s+/).filter(Boolean);
    if (!tokens.length) return { specificityScore: 0, namedEntityDensity: 0 };
    const capitalizedInner = tokens.filter((t, idx) => {
      if (idx === 0) return false;
      return /^[A-Z][a-z]/.test(t);
    });
    const digits = tokens.filter(t => /\d/.test(t));
    const ne = capitalizedInner.length + digits.length;
    const density = ne / tokens.length;
    return {
      specificityScore: density,
      namedEntityDensity: density
    };
  }

  function detectLooping(text) {
    if (!text) return 0;
    const normalized = String(text).toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
    const words = normalized.split(/\s+/).filter(Boolean);
    if (words.length < 40) return 0;
    const windowSize = 8;
    const seen = new Set();
    let repeats = 0;
    for (let i = 0; i <= words.length - windowSize; i++) {
      const chunk = words.slice(i, i + windowSize).join(' ');
      if (seen.has(chunk)) {
        repeats++;
      } else {
        seen.add(chunk);
      }
    }
    return repeats;
  }

  function assessRambling(text) {
    const sentences = splitSentences(text);
    const sentenceCount = sentences.length;
    const length = (text || '').split(/\s+/).filter(Boolean).length;
    const connectorStarts = countPrefixMatches(sentences);
    const { specificityScore, namedEntityDensity } = estimateSpecificity(sentences);
    const loops = detectLooping(text);

    const weakClosure = sentenceCount > 0 && sentences[sentences.length - 1].length < 20;

    const flags = [];
    let score = 0;

    if (length > 160 && connectorStarts > Math.max(3, sentenceCount * 0.25)) {
      flags.push('repeated_transitions');
      score += 2;
    }

    if (loops > 0) {
      flags.push('looping_back');
      score += 2;
    }

    if (weakClosure && length > 100) {
      flags.push('weak_closure');
      score += 1;
    }

    if (namedEntityDensity < 0.03 && length > 120) {
      flags.push('low_specificity_density');
      score += 2;
    }

    if (sentenceCount > 12 && length > 220) {
      flags.push('long_answer');
      score += 1;
    }

    const isLikely = score >= 3 && flags.length > 0;

    return {
      isRamblingLikely: isLikely,
      ramblingScore: score,
      flags,
      metrics: {
        sentenceCount,
        wordCount: length,
        connectorStarts,
        specificityScore,
        namedEntityDensity,
        loops
      }
    };
  }

  IR.ramblingDetector = {
    assess: assessRambling
  };
})(typeof window !== 'undefined' ? window : this);

