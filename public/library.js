/*
 * Every Haiku — the library.
 *
 * A finite, fully enumerable space of 5-7-5 haikus. Every haiku in the
 * library has exactly one integer address, and every integer address below
 * the total opens exactly one haiku. Nothing is stored: the poem is computed
 * from its address, and the address is computed from the poem.
 *
 * Works as a plain browser script (window.EveryHaiku) and as a Node module.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.EveryHaiku = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  // ---------------------------------------------------------------------
  // Vocabulary. The digit in each class name is the syllable count of
  // every word in that class. Keep words singular; verbs are third-person
  // singular present and intransitive so they end a clause cleanly.
  // ---------------------------------------------------------------------
  const WORDS = {
    N1: [
      "moon", "rain", "snow", "wind", "frog", "pond", "stone", "leaf", "crow",
      "mist", "dusk", "dawn", "sea", "sky", "bell", "moth", "pine", "reed",
      "ice", "fog", "cloud", "star", "tide", "bird", "path", "cliff", "deer",
      "crane", "oak", "dew", "hawk", "wave", "root", "night", "hill", "lake",
      "grass", "thorn", "bone", "gate", "well", "smoke", "salt", "frost",
      "dust", "ash", "moss", "lamp", "door", "road", "field", "storm", "shore",
      "fern", "owl", "wren", "gull", "fawn", "hare", "fox", "wolf", "swan",
    ],
    N2: [
      "river", "mountain", "garden", "temple", "blossom", "shadow", "water",
      "petal", "thunder", "meadow", "lantern", "sparrow", "willow", "winter",
      "summer", "autumn", "morning", "silence", "heron", "cricket", "ember",
      "harbor", "canyon", "orchard", "cedar", "pebble", "ripple", "feather",
      "candle", "window", "teacup", "forest", "valley", "ocean", "island",
      "desert", "thistle", "lotus", "maple", "spider", "swallow", "raven",
      "eagle", "turtle", "salmon", "rabbit", "pillow", "blanket", "doorway",
      "stairway", "footprint", "moonlight", "sunlight", "starlight",
      "snowfall", "mirror", "letter", "kettle", "chapel", "steeple", "echo",
      "distance", "hunger", "sorrow", "stranger", "neighbor", "farmer",
      "pilgrim",
    ],
    N3: [
      "butterfly", "dragonfly", "waterfall", "cicada", "horizon", "lullaby",
      "memory", "solitude", "hummingbird", "afternoon", "wilderness",
      "nightingale", "umbrella", "persimmon", "cathedral", "traveler",
      "visitor", "grandmother", "fisherman", "photograph", "melody",
      "harmony", "tapestry", "mountainside", "riverbed", "sycamore",
      "juniper", "bicycle", "telephone", "evergreen", "overcoat",
      "chandelier", "avalanche", "hurricane", "honeybee", "ladybug",
      "violin", "piano",
    ],
    // Single-syllable words that follow "at": "at dusk", "at last", "at peace".
    T1: [
      "dawn", "dusk", "noon", "night", "home", "sea", "rest", "last", "once",
      "dark", "peace",
    ],
    A1: [
      "cold", "still", "bright", "pale", "old", "first", "last", "soft",
      "grey", "thin", "bare", "slow", "deep", "warm", "lone", "wet", "dark",
      "late", "lost", "small", "long", "wild", "worn", "calm", "white",
      "black", "red", "blue", "green", "gold", "dry", "young", "brief",
      "sharp", "kind", "strange", "plain", "faint", "torn", "hushed", "new",
      "far", "near", "low", "high",
    ],
    A2: [
      "silent", "gentle", "frozen", "fading", "distant", "empty", "golden",
      "silver", "ancient", "hollow", "drifting", "falling", "broken",
      "patient", "humble", "scattered", "shallow", "crimson", "quiet",
      "early", "nameless", "sleepless", "restless", "tender", "bitter",
      "sudden", "narrow", "crooked", "rusted", "faded", "hidden", "open",
      "sacred", "weary", "barren", "misty", "cloudy", "sunlit", "moonlit",
      "starlit", "sleeping", "waking", "burning", "melting", "waiting",
      "yellow", "purple", "hungry", "lonely", "thirsty", "heavy",
    ],
    A3: [
      "forgotten", "unbroken", "wandering", "glimmering", "unspoken",
      "hesitant", "luminous", "delicate", "listening", "whispering",
      "vanishing", "uncertain", "unfinished", "motionless", "beautiful",
      "difficult", "innocent", "radiant", "infinite", "elegant", "unhurried",
      "unnoticed", "familiar", "faraway", "overgrown", "abandoned",
      "untroubled", "unanswered", "gathering", "flickering", "shivering",
      "awakened", "enormous",
    ],
    V1: [
      "falls", "waits", "sleeps", "drifts", "breaks", "fades", "stirs",
      "sings", "bends", "turns", "melts", "calls", "rests", "hums", "cracks",
      "glows", "sways", "pours", "stays", "burns", "ends", "grows", "flows",
      "dreams", "leans", "kneels", "bows", "weeps", "wakes", "hides",
      "climbs", "fails", "floats", "spins", "drips", "cools", "aches",
      "thaws", "shines", "stands", "sighs", "rings",
    ],
    V2: [
      "settles", "trembles", "listens", "lingers", "scatters", "wanders",
      "gathers", "whispers", "shivers", "ripens", "softens", "flickers",
      "deepens", "wavers", "returns", "forgets", "dissolves", "quickens",
      "darkens", "brightens", "opens", "answers", "wonders", "arrives",
      "departs", "begins", "unfolds", "awaits", "endures", "remains",
      "reflects", "recedes", "descends", "resumes", "murmurs", "glistens",
      "loosens", "tumbles", "crumbles", "rumbles", "hovers", "shudders",
      "stumbles", "kindles",
    ],
    V3: [
      "remembers", "awakens", "vanishes", "surrenders", "disappears",
      "continues", "unravels", "hesitates", "overflows", "considers",
      "discovers", "abandons", "arises", "assembles", "dismantles",
      "unburdens", "unbuttons", "untangles", "recovers", "imagines",
      "overhears", "reappears", "meanders", "understands", "interrupts",
    ],
  };

  const CLASS_LABEL = { N: "noun", A: "adjective", V: "verb", T: "time" };

  // Fixed words that appear inside templates, with their syllable counts.
  const LITERALS = {
    the: 1, a: 1, in: 1, on: 1, at: 1, and: 1, through: 1, no: 1, all: 1,
    night: 1, even: 2, after: 2, alone: 2, again: 2, without: 2, under: 2,
    something: 2,
  };

  // ---------------------------------------------------------------------
  // Line templates. {X} is a slot filled from WORDS[X]. Everything else is
  // a literal. Each 5-line sums to five syllables, each 7-line to seven;
  // the test suite checks this.
  // ---------------------------------------------------------------------
  const LINES_5 = [
    "{A2} {N1} {V2}",
    "the {A1} {N1} {V2}",
    "{N2} in the {N1}",
    "{A1} {N2} {V2}",
    "{N3} at {T1}",
    "a {A2} {N2}",
    "{A3} {N2}",
    "{N1} on the {N2}",
    "the {N2} {V2}",
    "{N1} {V1} on the {N1}",
    "{A1} {N1} in {N2}",
    "{N2} {V3}",
    "the {N1} {V1} again",
    "{N1} and {N1} and {N1}",
    "{A2} {N1}, {A1} {N1}",
    "after the {N2}",
    "{N2} without {N1}",
    "even the {N1} {V1}",
    "the {N1} {V1} alone",
    "no {N1} in the {N1}",
  ];

  const LINES_7 = [
    "the {A2} {N2} {V2}",
    "{N2} {V2} through the {N1}",
    "{A3} {N2} {V2}",
    "the {A1} {N1} {V2} and {V1}",
    "{N1} {V1} on the {A2} {N1}",
    "{A1} {N2} and {A1} {N2}",
    "{N3} {V2} at {T1}",
    "the {N1} {V2} in the {N1}",
    "even the {N2} {V2}",
    "{N2} {V2}, {N2} {V1}",
    "{A2} {N1} {V2} in {N1}",
    "a {A1} {N1} {V1} in the {N1}",
    "the {N3} {V3}",
    "{A2} {N2} {V3}",
    "{N2} {V2} after {N1}",
    "under the {A1} {N1}, {N1} {V1}",
    "{A1} {N1} {V1} and the {N1} {V1}",
    "the {N2} {V1} {A3}",
    "{N1} after {N1} after {N1}",
    "all night the {N2} {V2}",
    "something {A3} {V2}",
    "{N1} and {N1} in the {N2}",
  ];

  // ---------------------------------------------------------------------
  // Compile templates.
  // ---------------------------------------------------------------------
  const WORD_INDEX = {};
  for (const cls of Object.keys(WORDS)) {
    const map = new Map();
    WORDS[cls].forEach((w, i) => map.set(w, i));
    WORD_INDEX[cls] = map;
  }

  const SLOT_RE = /^\{([A-Z]\d)\}([,;.!?]*)$/;
  const PUNCT_RE = /[,;.!?]+$/;

  function compileTemplate(text, syllables) {
    const tokens = text.split(" ").map((raw) => {
      const m = SLOT_RE.exec(raw);
      if (m) {
        const cls = m[1];
        if (!WORDS[cls]) throw new Error("Unknown class " + cls + " in " + text);
        return { slot: cls, syl: Number(cls[1]), suffix: m[2] };
      }
      const word = raw.replace(PUNCT_RE, "");
      if (!(word in LITERALS)) throw new Error("Unknown literal '" + word + "' in " + text);
      return { lit: word, syl: LITERALS[word], suffix: raw.slice(word.length) };
    });
    const total = tokens.reduce((s, t) => s + t.syl, 0);
    const slots = tokens.filter((t) => t.slot).map((t) => t.slot);
    const size = slots.reduce((p, cls) => p * BigInt(WORDS[cls].length), 1n);
    return { text, syllables, total, tokens, slots, size };
  }

  const T5 = LINES_5.map((t) => compileTemplate(t, 5));
  const T7 = LINES_7.map((t) => compileTemplate(t, 7));

  // A "hall" is one combination of (5-line, 7-line, 5-line) templates.
  // Every haiku in a hall has the same grammatical shape.
  const HALLS = [];
  let cursor = 0n;
  for (let i = 0; i < T5.length; i++) {
    for (let j = 0; j < T7.length; j++) {
      for (let k = 0; k < T5.length; k++) {
        const lines = [T5[i], T7[j], T5[k]];
        const slots = lines.flatMap((l) => l.slots);
        const size = lines.reduce((p, l) => p * l.size, 1n);
        HALLS.push({ index: HALLS.length, lines, slots, size, start: cursor });
        cursor += size;
      }
    }
  }
  const TOTAL = cursor;

  function hallIndexFor(i, j, k) {
    return (i * T7.length + j) * T5.length + k;
  }

  // ---------------------------------------------------------------------
  // Address -> haiku.
  // ---------------------------------------------------------------------
  function findHall(n) {
    let lo = 0;
    let hi = HALLS.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (HALLS[mid].start <= n) lo = mid;
      else hi = mid - 1;
    }
    return HALLS[lo];
  }

  function needsAn(word) {
    return /^[aeiou]/.test(word);
  }

  function renderLine(template, words) {
    let w = 0;
    const out = [];
    template.tokens.forEach((tok, i) => {
      if (tok.slot) {
        out.push(words[w++] + tok.suffix);
      } else if (tok.lit === "a") {
        const next = template.tokens[i + 1];
        const nextWord = next && next.slot ? words[w] : next ? next.lit : "";
        out.push((needsAn(nextWord) ? "an" : "a") + tok.suffix);
      } else {
        out.push(tok.lit + tok.suffix);
      }
    });
    return out.join(" ");
  }

  // Accept a BigInt, a safe integer, or a string of digits. Anything else is
  // not an address, and every failure is the same RangeError so callers can
  // catch one thing.
  function toAddress(n) {
    let v;
    if (typeof n === "bigint") v = n;
    else if (typeof n === "number" && Number.isSafeInteger(n)) v = BigInt(n);
    else if (typeof n === "string" && /^\s*-?\d+\s*$/.test(n)) v = BigInt(n.trim());
    else throw new RangeError("Not a library address: " + String(n));
    if (v < 0n || v >= TOTAL) throw new RangeError("Address out of range");
    return v;
  }

  function decode(n) {
    n = toAddress(n);
    const hall = findHall(n);
    const base = n - hall.start;
    let offset = base;
    const choices = new Array(hall.slots.length);
    for (let s = hall.slots.length - 1; s >= 0; s--) {
      const list = WORDS[hall.slots[s]];
      const size = BigInt(list.length);
      choices[s] = list[Number(offset % size)];
      offset /= size;
    }
    const lines = [];
    let w = 0;
    for (const line of hall.lines) {
      lines.push(renderLine(line, choices.slice(w, w + line.slots.length)));
      w += line.slots.length;
    }
    return {
      address: n,
      hall: hall.index,
      offset: base,
      lines,
      text: lines.join("\n"),
      shape: hall.lines.map((l) => shapeOf(l)),
    };
  }

  function shapeOf(template) {
    return template.tokens
      .map((t) => (t.slot ? "[" + CLASS_LABEL[t.slot[0]] + "]" : t.lit) + t.suffix)
      .join(" ");
  }

  // ---------------------------------------------------------------------
  // Haiku -> address.
  // ---------------------------------------------------------------------
  function encode(hallIndex, wordIndices) {
    const hall = HALLS[hallIndex];
    if (wordIndices.length !== hall.slots.length) throw new Error("Slot count mismatch");
    let offset = 0n;
    for (let s = 0; s < hall.slots.length; s++) {
      offset = offset * BigInt(WORDS[hall.slots[s]].length) + BigInt(wordIndices[s]);
    }
    return hall.start + offset;
  }

  function normalizeTokens(text) {
    return text
      .toLowerCase()
      .replace(/[‘’']/g, "")
      .replace(/[^a-z\s-]/g, " ")
      .split(/\s+/)
      .filter(Boolean)
      .map((t) => (t === "an" ? "a" : t));
  }

  // All ways a token list can be read as one template line.
  function matchLine(template, tokens) {
    if (tokens.length !== template.tokens.length) return null;
    const indices = [];
    for (let i = 0; i < tokens.length; i++) {
      const tok = template.tokens[i];
      if (tok.slot) {
        const idx = WORD_INDEX[tok.slot].get(tokens[i]);
        if (idx === undefined) return null;
        indices.push(idx);
      } else if (tok.lit !== tokens[i]) {
        return null;
      }
    }
    return indices;
  }

  function matchesFor(templates, tokens) {
    const out = [];
    templates.forEach((t, i) => {
      const idx = matchLine(t, tokens);
      if (idx) out.push({ template: i, indices: idx });
    });
    return out;
  }

  function splitLines(text) {
    return text
      .split(/\n|\s\/\s|\s\|\s/)
      .map((l) => l.trim())
      .filter(Boolean);
  }

  // Exact lookup: every address at which this three-line haiku appears.
  function locate(text) {
    const lines = splitLines(text);
    if (lines.length !== 3) return [];
    const m1 = matchesFor(T5, normalizeTokens(lines[0]));
    const m2 = matchesFor(T7, normalizeTokens(lines[1]));
    const m3 = matchesFor(T5, normalizeTokens(lines[2]));
    const found = [];
    for (const a of m1) {
      for (const b of m2) {
        for (const c of m3) {
          const hall = hallIndexFor(a.template, b.template, c.template);
          found.push(encode(hall, a.indices.concat(b.indices, c.indices)));
        }
      }
    }
    return found;
  }

  // ---------------------------------------------------------------------
  // Randomness over the whole library (uniform), with BigInt.
  // ---------------------------------------------------------------------
  function randomBytes(count) {
    const bytes = new Uint8Array(count);
    const c = typeof crypto !== "undefined" ? crypto : null;
    if (c && c.getRandomValues) {
      c.getRandomValues(bytes);
    } else {
      for (let i = 0; i < count; i++) bytes[i] = Math.floor(Math.random() * 256);
    }
    return bytes;
  }

  function randomBelow(max) {
    max = BigInt(max);
    if (max <= 0n) throw new RangeError("max must be positive");
    const bits = max.toString(2).length;
    const bytes = Math.ceil(bits / 8);
    for (;;) {
      let r = 0n;
      for (const b of randomBytes(bytes)) r = (r << 8n) | BigInt(b);
      r &= (1n << BigInt(bits)) - 1n;
      if (r < max) return r;
    }
  }

  function randomAddress() {
    return randomBelow(TOTAL);
  }

  function randomInt(n) {
    return Number(randomBelow(BigInt(n)));
  }

  // Uniform over the library, a random haiku almost always comes from the
  // few halls with the most slots. Wandering picks a hall first, so every
  // grammatical shape is equally likely. Not uniform over addresses.
  function wanderAddress() {
    const hall = HALLS[randomInt(HALLS.length)];
    return hall.start + randomBelow(hall.size);
  }

  // ---------------------------------------------------------------------
  // Phrase search: find some haiku in the library that contains the words,
  // in order, inside one line. Returns {address, text} or a diagnosis.
  // ---------------------------------------------------------------------
  function phraseMatches(templates, tokens) {
    const out = [];
    templates.forEach((t, ti) => {
      for (let start = 0; start + tokens.length <= t.tokens.length; start++) {
        const fixed = new Map();
        let ok = true;
        let slotPos = t.tokens.slice(0, start).filter((x) => x.slot).length;
        for (let q = 0; q < tokens.length && ok; q++) {
          const tok = t.tokens[start + q];
          if (tok.slot) {
            const idx = WORD_INDEX[tok.slot].get(tokens[q]);
            if (idx === undefined) ok = false;
            else fixed.set(slotPos, idx);
            slotPos++;
          } else if (tok.lit !== tokens[q]) {
            ok = false;
          }
        }
        if (ok) out.push({ template: ti, fixed });
      }
    });
    return out;
  }

  function fillTemplate(template, fixed) {
    return template.slots.map((cls, s) =>
      fixed && fixed.has(s) ? fixed.get(s) : randomInt(WORDS[cls].length)
    );
  }

  function knownWord(token) {
    if (token in LITERALS) return true;
    return Object.keys(WORDS).some((cls) => WORD_INDEX[cls].has(token));
  }

  function search(text) {
    const exact = locate(text);
    if (exact.length) {
      return { kind: "exact", addresses: exact, address: exact[0] };
    }
    const tokens = normalizeTokens(text);
    if (!tokens.length) return { kind: "empty" };
    const unknown = tokens.filter((t) => !knownWord(t));
    if (unknown.length) return { kind: "unknown", unknown: [...new Set(unknown)] };

    // Several lines means the user meant a whole haiku, not a phrase. Say
    // which lines fail instead of searching all the words as one phrase.
    const typed = splitLines(text);
    if (typed.length > 1) {
      if (typed.length !== 3) return { kind: "lines", count: typed.length };
      const sets = [T5, T7, T5];
      return {
        kind: "lines",
        count: 3,
        lines: typed.map((line, i) => ({
          text: line,
          ok: matchesFor(sets[i], normalizeTokens(line)).length > 0,
        })),
      };
    }

    const in5 = phraseMatches(T5, tokens).map((m) => ({ kind5: true, ...m }));
    const in7 = phraseMatches(T7, tokens).map((m) => ({ kind5: false, ...m }));
    const all = in5.concat(in7);
    if (!all.length) return { kind: "unordered" };
    // A phrase can sit at several offsets in one template; count shapes, not offsets.
    const shapes = new Set(in5.map((m) => m.template)).size + new Set(in7.map((m) => m.template)).size;

    const pick = all[randomInt(all.length)];
    let i;
    let j;
    let k;
    const fixed = [null, null, null];
    if (pick.kind5) {
      const onFirst = randomInt(2) === 0;
      i = onFirst ? pick.template : randomInt(T5.length);
      k = onFirst ? randomInt(T5.length) : pick.template;
      j = randomInt(T7.length);
      fixed[onFirst ? 0 : 2] = pick.fixed;
    } else {
      i = randomInt(T5.length);
      j = pick.template;
      k = randomInt(T5.length);
      fixed[1] = pick.fixed;
    }
    const lines = [T5[i], T7[j], T5[k]];
    const indices = lines.flatMap((l, idx) => fillTemplate(l, fixed[idx]));
    const address = encode(hallIndexFor(i, j, k), indices);
    return { kind: "phrase", address, matches: shapes };
  }

  // ---------------------------------------------------------------------
  // Formatting helpers.
  // ---------------------------------------------------------------------
  const SCALE = [
    [1000000000000000000000000n, "septillion"],
    [1000000000000000000000n, "sextillion"],
    [1000000000000000000n, "quintillion"],
    [1000000000000000n, "quadrillion"],
    [1000000000000n, "trillion"],
    [1000000000n, "billion"],
    [1000000n, "million"],
    [1000n, "thousand"],
  ];

  function withCommas(n) {
    return BigInt(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  function approximate(n) {
    n = BigInt(n);
    for (const [unit, name] of SCALE) {
      if (n >= unit) {
        const tenths = (n * 10n) / unit;
        const whole = tenths / 10n;
        const frac = tenths % 10n;
        return (frac === 0n ? whole.toString() : whole + "." + frac) + " " + name;
      }
    }
    return n.toString();
  }

  function vocabulary() {
    return Object.keys(WORDS).map((cls) => ({
      cls,
      label: CLASS_LABEL[cls[0]],
      syllables: Number(cls[1]),
      words: WORDS[cls].slice(),
    }));
  }

  return {
    TOTAL,
    HALL_COUNT: HALLS.length,
    WORDS,
    LITERALS,
    LINES_5,
    LINES_7,
    templates5: T5,
    templates7: T7,
    halls: HALLS,
    decode,
    encode,
    locate,
    search,
    normalizeTokens,
    randomAddress,
    wanderAddress,
    randomBelow,
    withCommas,
    approximate,
    vocabulary,
    shapeOf,
  };
});
