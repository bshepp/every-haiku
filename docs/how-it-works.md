# How Every Haiku works

This is the long version of the "How the library is built" section in the
README. The first half is the mathematics: why a finite set of words and line
shapes gives every haiku exactly one integer address. The second half walks
through the code that turns an address into a poem and a poem back into its
address, function by function, with a worked example you can open on the live
site as you read.

All code quoted here is from [`public/library.js`](../public/library.js). The
figures are for the current edition of the library and are checked by the
test suite; if the vocabulary ever changes they change with it.

---

## Part one: the mathematics

### Words, classes and shapes

The vocabulary is a few hundred words sorted into **classes**. A class name is
a letter for the part of speech and a digit for the syllable count, so `N1`
is one-syllable nouns (`moon`, `rain`, `snow`), `A2` is two-syllable
adjectives (`silent`, `gentle`, `frozen`) and `V3` is three-syllable verbs
(`remembers`, `vanishes`). The current class sizes are:

| Class | Meaning | Words |
|---|---|---|
| N1, N2, N3 | nouns of 1, 2, 3 syllables | 62, 68, 38 |
| A1, A2, A3 | adjectives of 1, 2, 3 syllables | 45, 51, 33 |
| V1, V2, V3 | verbs of 1, 2, 3 syllables | 42, 44, 25 |
| T1 | one-syllable words that follow "at" | 11 |

A **line shape** (the code calls it a template) is a short pattern mixing
fixed words with slots drawn from those classes:

```
{A2} {N1} {V2}          silent moon settles
the {A1} {N1} {V2}      the cold moon settles
{N3} at {T1}            butterfly at dusk
{N1} and {N1} and {N1}  moon and rain and snow
```

Because every word in a class has the same syllable count, and every fixed
word has a known count, the syllable total of a shape is fixed no matter which
words fill it. There are 20 shapes that total five syllables and 22 that total
seven. The test suite checks the arithmetic of every one of them.

### How many lines a shape can make

A shape with slots drawn from classes of sizes s₁, s₂, …, sₖ can make

> s₁ × s₂ × … × sₖ

distinct lines, one for each way of filling its slots. `{A2} {N1} {V2}` can
make 51 × 62 × 44 = 139,128 lines. `after the {N2}` can make only 68. A shape
with no slots at all would make exactly one line, which is why every shape
has at least one.

### Halls

A haiku is three lines, so a haiku's shape is a choice of one five-syllable
shape for the first line, one seven-syllable shape for the second, and one
five-syllable shape for the third. The library calls each such triple a
**hall**, and there are

> 20 × 22 × 20 = 8,800

of them. Every haiku in a hall has the same grammar; only the words differ.

A hall's size is the product of its three line sizes, which is the same as
the product of the class sizes of all its slots taken together. Hall 0, whose
shapes are `{A2} {N1} {V2}` / `the {A2} {N2} {V2}` / `{A2} {N1} {V2}`, has
nine slots and holds

> 51 × 62 × 44 × 51 × 68 × 44 × 51 × 62 × 44 = 2,953,662,365,795,328

haikus. Halls range from the smallest, `after the {N2}` / `the {N3} {V3}` /
`after the {N2}`, with 4,392,800 haikus, up to the largest, with thirteen
slots and about 23.7 sextillion.

### Laying the halls end to end

Now give every haiku a number. Put hall 0 first: its haikus take addresses 0
up to (size of hall 0) − 1. Hall 1 starts where hall 0 ends, and so on. Each
hall has a `start`, and the start of hall h is the sum of the sizes of all the
halls before it. The total size of the library is the start the 8,801st hall
would have had:

> 34,985,525,500,137,095,382,456 haikus, about 34.9 sextillion.

This is a partition of the integers from 0 to the total − 1 into 8,800
contiguous ranges with no gaps and no overlaps. The test
"total is the sum of all hall sizes and halls are contiguous" asserts exactly
that. On the page, addresses are shown starting from 1 rather than 0, so
`#5000` on the site is address 4,999 inside the code.

### Inside a hall: the odometer

Within a hall the slots are numbered left to right across all three lines.
Hall 0's nine slots are

```
A2 N1 V2 | A2 N2 V2 | A2 N1 V2
```

Think of each slot as one wheel of an odometer. The wheel for slot *s* has as
many positions as its class has words, and position *d* shows word number *d*
of that class. The rightmost wheel turns fastest. When it completes a full
turn it clicks the wheel to its left forward by one, and so on.

That is a **mixed-radix number system**: like ordinary decimal, except each
digit has its own base. The offset of a haiku within its hall is the number
the odometer shows, read left to right with the slot sizes as bases:

> offset = ((…((d₀ × s₁ + d₁) × s₂ + d₂) …) × sₖ₋₁ + dₖ₋₁

and the haiku's address is `hall.start + offset`.

Going the other way, to read the digits off an offset you divide by the
bases from the right: the last digit is `offset mod sₖ₋₁`, then divide by
sₖ₋₁ and repeat with the next base to the left. This is exactly how you would
convert a number to decimal by repeatedly taking `mod 10` and dividing by 10,
except the 10 changes at each step.

### Why neighbours differ by one word

Adding 1 to an address turns the last wheel one notch, which changes the last
slot's word and nothing else, unless that wheel was on its last position, in
which case it rolls over to 0 and the wheel to its left moves by one. So
stepping from an address to the next changes one word in the common case,
and two or more only at a rollover, where several wheels can roll at once.
The test "neighbouring addresses differ by exactly one word" checks the common
case and allows for the rollover.

Stepping across a hall boundary is different: the next address belongs to a
hall with a different grammar, so the whole haiku changes. The page shows the
hall number so you can see when that happens.

### Why the arithmetic has to be exact

The total is about 3.5 × 10²², a 75-bit number. JavaScript's ordinary numbers
are 64-bit floats that represent integers exactly only up to 2⁵³, about
9 × 10¹⁵. Beyond that, adding 1 to a number can leave it unchanged, and two
different addresses could collapse into the same float. That would break the
whole idea: an address that opens one poem, and a poem with one address.

So every address, offset, size and start in the library is a `BigInt`, the
JavaScript type for integers of any size. The `n` suffix in the code
(`1n`, `0n`) marks a BigInt literal. BigInt division truncates toward zero,
which is the division the odometer needs.

### Where the library's weight lies

Hall sizes are wildly unequal, because a hall's size is a product and a few
extra slots multiply it enormously. The largest hall,

```
{A2} {N1}, {A1} {N1}
{A1} {N1} {V1} and the {N1} {V1}
{A2} {N1}, {A1} {N1}
```

has thirteen slots and holds about 23.7 sextillion haikus, which is 67.9% of
the entire library in one hall. A handful of the biggest halls account for
nearly everything.

This is why the page has two kinds of random. **Strict random** draws an
address uniformly from 0 to the total − 1, which is the honest definition of
"a random haiku from the library", and it lands in that one hall two times in
three. **Wander** first picks one of the 8,800 halls uniformly, then an offset
uniformly inside that hall. Every grammatical shape then turns up equally
often, at the cost of no longer being uniform over addresses. Both produce
real addresses; they are just different questions.

Random draws use `crypto.getRandomValues` with rejection sampling: draw enough
random bits to cover the range, and if the value lands at or beyond the limit,
throw it away and draw again. That gives an exactly uniform result; taking a
remainder instead would slightly favour small values.

### From address to hall

Given an address, which hall is it in? The halls are sorted by `start`, so the
answer is the last hall whose start is at or below the address. The code finds
it by binary search over the 8,800 starts, which takes about 13 comparisons.

### From poem back to address

The reverse direction has to recover both the hall and the digits. For each
line, try every shape of the right syllable count and see whether the words
fit it token by token: a fixed word must match exactly, and a slot word must
be in the slot's class. Each successful fit yields the digit for each slot.
Combine one fit per line into a hall, feed the digits through the odometer
formula, add the hall's start, and the address comes back.

A line could in principle fit more than one shape, so the code collects every
combination and the page says "shelved at N addresses" when there is more than
one. The test "decode then locate round-trips to the same address" checks that
the original address is always among the results, for the first and last
address, every hall boundary sampled, and hundreds of random draws.

---

## Part two: the code, line by line

### Compiling a shape

```js
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
```

The shape text is split on spaces into tokens. A token that looks like `{A2}`
or `{N1},` is a slot: `SLOT_RE` captures the class name and any trailing
punctuation, and the syllable count is simply the digit in the class name.
Any other token is a fixed word; its punctuation is stripped and it must be in
`LITERALS`, which records its syllable count. Both kinds of error throw at
load time, so a typo in a shape breaks the library loudly rather than
silently.

`total` is the syllable sum the tests check against 5 or 7. `slots` is the
list of class names in order, which is the odometer's list of bases. `size`
multiplies the class sizes together as a BigInt, starting from `1n`; a shape
with no slots would have size 1.

### Building the halls

```js
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
```

Three nested loops visit every (five, seven, five) triple in a fixed order:
the first line's shape is the slowest to change, the third line's the
fastest. For each triple, `slots` concatenates the three lines' slot lists
into the hall's single list of wheels, and `size` multiplies the three line
sizes. `cursor` is the running sum of sizes: it is this hall's `start` and
then advances past it. When the loops finish, `cursor` has passed every hall,
so it is the total.

```js
function hallIndexFor(i, j, k) {
  return (i * T7.length + j) * T5.length + k;
}
```

The loops push halls in a predictable order, so a hall's index can be
computed from its three shape indices without searching. This is itself a
little mixed-radix number with bases 22 and 20, and `locate` uses it to find
the hall once it knows which shape each line fits.

### Finding a hall by address

```js
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
```

A binary search for the last hall whose `start` is at or below `n`. The
`+ 1` in the midpoint rounds up, which is what makes this variant converge
when searching for the last match rather than the first: if the midpoint's
start is at or below `n`, the answer is at `mid` or later, so `lo` moves up
to `mid`; otherwise it is strictly earlier, so `hi` moves to `mid - 1`. The
loop ends with `lo === hi` pointing at the hall. Indices are ordinary numbers
here because there are only 8,800 halls; only the starts are BigInts.

### Address to haiku

```js
function toAddress(n) {
  let v;
  if (typeof n === "bigint") v = n;
  else if (typeof n === "number" && Number.isSafeInteger(n)) v = BigInt(n);
  else if (typeof n === "string" && /^\s*-?\d+\s*$/.test(n)) v = BigInt(n.trim());
  else throw new RangeError("Not a library address: " + String(n));
  if (v < 0n || v >= TOTAL) throw new RangeError("Address out of range");
  return v;
}
```

`decode` accepts a BigInt, a safe integer, or a string of digits, and
rejects everything else with one kind of error so callers have one thing to
catch. The range check is the only place the library needs to know its own
size.

```js
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
```

This is the odometer read backwards. `base` is the position within the hall.
The loop runs over the slots from the **last** to the first, because the last
wheel is the fastest and its digit is the remainder on dividing by its base.
`offset % size` is that digit; indexing the class's word list with it picks
the word; `offset /= size` is BigInt division, which discards the remainder
and leaves the number the remaining wheels show. `Number(...)` is safe here
because a digit is always smaller than the class size.

```js
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
```

`choices` now holds one word per slot across the whole haiku. Each line takes
its share, as many words as it has slots, and `renderLine` lays them into the
shape. The result carries everything the page shows: the address, the hall,
the offset inside it, the three lines, and the shape with the classes spelled
out as `[adjective] [noun] [verb]`.

### Rendering a line, and "a" versus "an"

```js
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
```

Walk the shape's tokens. A slot takes the next word; a fixed word is copied.
The one piece of grammar the library does is the article: the shape says `a`,
but if the following word starts with a vowel it is written `an`. This is
display only. `normalizeTokens`, below, folds `an` back to `a` before
matching, so "an ancient river" and the shape `a {A2} {N2}` still agree, which
the article-agreement test checks.

### Haiku to address

```js
function encode(hallIndex, wordIndices) {
  const hall = HALLS[hallIndex];
  if (wordIndices.length !== hall.slots.length) throw new Error("Slot count mismatch");
  let offset = 0n;
  for (let s = 0; s < hall.slots.length; s++) {
    offset = offset * BigInt(WORDS[hall.slots[s]].length) + BigInt(wordIndices[s]);
  }
  return hall.start + offset;
}
```

The odometer read forwards: starting from 0, for each slot in order multiply
by that slot's base and add its digit. This is Horner's rule, the same way
you would compute the value of a decimal string digit by digit. Adding the
hall's start turns the offset into the library-wide address. `decode` and
`encode` are exact inverses because they walk the same slots with the same
bases, one from the right and one from the left.

### Reading a poem

```js
function normalizeTokens(text) {
  return text
    .toLowerCase()
    .replace(/[‘’']/g, "")
    .replace(/[^a-z\s-]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((t) => (t === "an" ? "a" : t));
}
```

Lower-case everything, drop apostrophes, turn any other punctuation into a
space, split on whitespace, and fold `an` to `a`. After this, a typed line and
a rendered line compare as plain word lists, so commas and capitals never
matter.

```js
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
```

Does this word list fit this shape? The lengths must match first. Then, token
by token: a slot requires the word to be in that class, and `WORD_INDEX` (a
map from word to its position in the class, built once at load) gives the
digit; a fixed word must match exactly. Any failure returns `null`; success
returns the digits for this line, in slot order.

```js
function matchesFor(templates, tokens) {
  const out = [];
  templates.forEach((t, i) => {
    const idx = matchLine(t, tokens);
    if (idx) out.push({ template: i, indices: idx });
  });
  return out;
}
```

Try one word list against every shape of a given length and keep each fit
with its shape index. Usually there is one fit or none.

```js
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
```

Split the text into lines (on newlines, or on ` / ` and ` | ` so a haiku can
be typed on one line). A haiku has three. Match the first and third against
the five-syllable shapes and the second against the seven-syllable shapes.
Every combination of one fit per line names a hall via `hallIndexFor`, and
concatenating the three lines' digits gives the full odometer reading for
`encode`. The result is every address at which this exact haiku is shelved.

### What the tests pin down

The suite in [`test/library.test.js`](../test/library.test.js) is short, but
each test guards one of the claims above: every shape sums to 5 or 7; halls
tile the address space with no gaps; the first and last address decode and
out-of-range addresses are rejected; `decode` then `locate` returns the
original address, including at hall boundaries; neighbours differ by one word
inside a hall; article agreement survives the round trip; and random draws
stay in range and spread across halls. If you change the vocabulary, run
`npm test`, and remember that the change renumbers the whole library.

---

## A worked example: No. 5,000

Open <https://bshepp.github.io/every-haiku/#5000>. The page shows address
5,000, which is `n = 4999n` in the code.

**Find the hall.** Hall 0 starts at 0 and holds 2,953,662,365,795,328 haikus,
so 4,999 is well inside it. `findHall(4999n)` returns hall 0, whose shapes are
`{A2} {N1} {V2}` / `the {A2} {N2} {V2}` / `{A2} {N1} {V2}` and whose nine slots
are `A2 N1 V2 A2 N2 V2 A2 N1 V2`. The offset within the hall is 4,999 − 0 =
4,999.

**Read the wheels, last to first.**

| Slot | Class | Base | Offset in | Digit (offset mod base) | Word | Offset out |
|---|---|---|---|---|---|---|
| 8 | V2 | 44 | 4,999 | 27 | awaits | 113 |
| 7 | N1 | 62 | 113 | 51 | storm | 1 |
| 6 | A2 | 51 | 1 | 1 | gentle | 0 |
| 5 | V2 | 44 | 0 | 0 | settles | 0 |
| 4 | N2 | 68 | 0 | 0 | river | 0 |
| 3 | A2 | 51 | 0 | 0 | silent | 0 |
| 2 | V2 | 44 | 0 | 0 | settles | 0 |
| 1 | N1 | 62 | 0 | 0 | moon | 0 |
| 0 | A2 | 51 | 0 | 0 | silent | 0 |

Only the last three wheels have turned; the first six are still on their
first word, because 4,999 is small compared with the hall.

**Lay the words into the shapes.** Slots 0 to 2 fill the first line, 3 to 5
the second, 6 to 8 the third:

```
silent moon settles
the silent river settles
gentle storm awaits
```

**And back again.** `normalizeTokens` turns each line into a word list;
`matchesFor` fits line one to shape 0 of the five-syllable shapes with digits
[0, 0, 0], line two to shape 0 of the seven-syllable shapes with [0, 0, 0],
and line three to shape 0 with [1, 51, 27]. `hallIndexFor(0, 0, 0)` is 0.
`encode(0, [0,0,0, 0,0,0, 1,51,27])` runs Horner's rule over the nine bases:

> ((((((((0·62 + 0)·44 + 0)·51 + 0)·68 + 0)·44 + 0)·51 + 1)·62 + 51)·44 + 27 = 4,999

Add hall 0's start of 0 and the address is 4,999: No. 5,000. Press → on the
page and you will see only the last word change, to the next verb in `V2`.
