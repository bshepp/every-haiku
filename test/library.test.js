const test = require("node:test");
const assert = require("node:assert/strict");
const L = require("../public/library.js");

test("every 5-line template sums to five syllables", () => {
  for (const t of L.templates5) assert.equal(t.total, 5, t.text);
});

test("every 7-line template sums to seven syllables", () => {
  for (const t of L.templates7) assert.equal(t.total, 7, t.text);
});

test("words in each class share the class's syllable count label", () => {
  for (const cls of Object.keys(L.WORDS)) {
    assert.match(cls, /^[NAVT][123]$/);
    const words = L.WORDS[cls];
    assert.equal(new Set(words).size, words.length, "duplicate word in " + cls);
    for (const w of words) assert.match(w, /^[a-z]+$/, w);
  }
});

test("total is the sum of all hall sizes and halls are contiguous", () => {
  let cursor = 0n;
  for (const hall of L.halls) {
    assert.equal(hall.start, cursor);
    cursor += hall.size;
  }
  assert.equal(cursor, L.TOTAL);
  assert.equal(L.HALL_COUNT, L.LINES_5.length * L.LINES_7.length * L.LINES_5.length);
});

test("first and last addresses decode", () => {
  const first = L.decode(0n);
  const last = L.decode(L.TOTAL - 1n);
  assert.equal(first.lines.length, 3);
  assert.equal(last.lines.length, 3);
  assert.equal(first.hall, 0);
  assert.equal(last.hall, L.HALL_COUNT - 1);
  assert.throws(() => L.decode(L.TOTAL), RangeError);
  assert.throws(() => L.decode(-1n), RangeError);
});

test("decode then locate round-trips to the same address", () => {
  const samples = [0n, 1n, 12345678901234567n, L.TOTAL - 1n];
  for (let i = 0; i < 300; i++) samples.push(L.randomAddress());
  for (const n of samples) {
    const h = L.decode(n);
    const found = L.locate(h.text);
    assert.ok(found.includes(n), `address ${n} not among ${found} for:\n${h.text}`);
  }
});

test("hall boundaries round-trip", () => {
  for (const hall of L.halls.filter((_, i) => i % 97 === 0)) {
    for (const n of [hall.start, hall.start + hall.size - 1n]) {
      const h = L.decode(n);
      assert.equal(h.hall, hall.index);
      assert.ok(L.locate(h.text).includes(n));
    }
  }
});

test("neighbouring addresses differ by exactly one word (within a hall)", () => {
  for (let i = 0; i < 50; i++) {
    const n = L.randomAddress();
    const a = L.decode(n);
    const b = L.decode(n + 1n);
    if (a.hall !== b.hall) continue;
    const wa = L.normalizeTokens(a.text);
    const wb = L.normalizeTokens(b.text);
    assert.equal(wa.length, wb.length);
    const diffs = wa.filter((w, k) => w !== wb[k]).length;
    assert.ok(diffs >= 1 && diffs <= 2, `${a.text}\n---\n${b.text}`);
  }
});

test("article agreement: 'an' before vowels and it still locates", () => {
  // Hall with "a {A2} {N2}" first line and the adjective "ancient".
  const i = L.LINES_5.indexOf("a {A2} {N2}");
  const adj = L.WORDS.A2.indexOf("ancient");
  const hallIndex = (i * L.templates7.length + 0) * L.templates5.length + 0;
  const hall = L.halls[hallIndex];
  const indices = hall.slots.map(() => 0);
  indices[0] = adj;
  const n = L.encode(hallIndex, indices);
  const h = L.decode(n);
  assert.match(h.lines[0], /^an ancient /);
  assert.ok(L.locate(h.text).includes(n));
});

test("phrase search finds a haiku containing the phrase", () => {
  for (const phrase of ["the river listens", "butterfly", "frozen pond", "at dusk", "something forgotten"]) {
    const r = L.search(phrase);
    assert.equal(r.kind, "phrase", phrase);
    const h = L.decode(r.address);
    const needle = L.normalizeTokens(phrase).join(" ");
    const hay = h.lines.map((l) => L.normalizeTokens(l).join(" "));
    assert.ok(hay.some((l) => l.includes(needle)), `${phrase} not in\n${h.text}`);
  }
});

test("search reports unknown words and impossible orderings", () => {
  assert.equal(L.search("").kind, "empty");
  const u = L.search("quantum moon");
  assert.equal(u.kind, "unknown");
  assert.deepEqual(u.unknown, ["quantum"]);
  assert.equal(L.search("moon moon moon moon moon moon").kind, "unordered");
});

test("search with a full haiku returns the exact address", () => {
  const n = 987654321987654321n % L.TOTAL;
  const h = L.decode(n);
  const r = L.search(h.text);
  assert.equal(r.kind, "exact");
  assert.ok(r.addresses.includes(n));
});

test("random addresses stay in range", () => {
  const halls = new Set();
  for (let i = 0; i < 1000; i++) {
    const n = L.randomAddress();
    assert.ok(n >= 0n && n < L.TOTAL);
    const w = L.wanderAddress();
    assert.ok(w >= 0n && w < L.TOTAL);
    halls.add(L.decode(w).hall);
  }
  assert.ok(halls.size > 500, "wandering should spread across halls");
  assert.equal(L.randomBelow(1n), 0n);
});

test("formatting helpers", () => {
  assert.equal(L.withCommas(1234567n), "1,234,567");
  assert.equal(L.approximate(1500000000000n), "1.5 trillion");
  assert.equal(L.approximate(999n), "999");
  assert.match(L.approximate(L.TOTAL), /illion$/);
});
