# Every Haiku

*A haiku slice of the infinite library.*

Every Haiku is a finite, fully enumerable library of 5-7-5 haikus. Each haiku
has exactly one integer address, and each address below the total opens
exactly one haiku. Nothing is stored and nothing is generated at random on a
server: the poem is computed from its address, and the address is computed
from the poem. The whole library is a single static page with no build step,
no dependencies, no accounts, and no cost to run.

**Live:** https://bshepp.github.io/every-haiku/

## What you can do

- **Wander.** Open a random shelf. Every grammatical shape is equally likely.
- **Walk.** Step to the previous or next address with the arrow keys.
  Neighbouring haikus differ by a single word.
- **Open an address.** Type any number from 1 to the total.
- **Search.** Paste a phrase and the library finds a haiku that contains it,
  then gives you its address. Paste a whole haiku on three lines and it tells
  you exactly where that poem is shelved. Search for a word the library does
  not know and it says so.
- **Share.** Every address is a permalink: `…/#1234567890`.

## How the library is built

The vocabulary is a few hundred words, each placed in a class by part of
speech and syllable count (`N1` is one-syllable nouns, `A3` is three-syllable
adjectives, and so on). Line templates mix fixed words with slots drawn from
those classes, and the test suite proves every five-line template sums to
five syllables and every seven-line template to seven.

A **hall** is one choice of template for each of the three lines. With 20
five-syllable templates and 22 seven-syllable templates there are
20 × 22 × 20 = 8,800 halls. Within a hall the slot words turn over like the
digits of an odometer, last slot fastest, which is a mixed-radix number
system. Lay the halls end to end and every haiku gets a unique address.

| | |
|---|---|
| Halls | 8,800 |
| Vocabulary | 419 words |
| Haikus | 34,985,525,500,137,095,382,456 (about 34.9 sextillion) |

Addresses are handled as `BigInt`, so the arithmetic is exact. Random draws
use `crypto.getRandomValues` with rejection sampling, so "strict random" is
uniform over all addresses. "Wander" picks a hall first, because a uniform
draw almost always lands in the handful of halls with the most slots.

The core lives in [`public/library.js`](public/library.js) and runs unchanged
in the browser and in Node. The page in [`public/index.html`](public/index.html)
is plain HTML, CSS and JavaScript.

## Run it

Open `public/index.html` in a browser. That is the whole deployment.

For a local server:

```bash
npm run serve
```

Then visit http://localhost:8000.

## Test it

```bash
npm test
```

The tests check the syllable arithmetic of every template, that halls tile the
address space with no gaps, that decoding an address and locating the result
returns the same address (including at hall boundaries and for the first and
last address), that article agreement (`a` / `an`) survives the round trip,
and that search behaves on phrases, whole haikus, unknown words and impossible
orderings. Node 20 or later, no packages.

## Deploy it

Pushes to `master` run the tests and deploy `public/` to GitHub Pages through
[`.github/workflows/pages.yml`](.github/workflows/pages.yml). In the repository
settings under **Pages**, set the source to **GitHub Actions** once. Any other
static host works too: upload the two files in `public/`.

## Extend the vocabulary

Add words to the right class in `public/library.js`, keeping the syllable count
honest. Add line templates to `LINES_5` or `LINES_7` using `{CLASS}` for slots
and words from `LITERALS` for fixed text. Run `npm test`. Note that any change
to the vocabulary or templates renumbers the library, so old permalinks point
at different poems. If that matters, treat the word lists as frozen and start a
new edition instead.

## History

Versions 1 and 2 of this repository were a Firebase social app with accounts,
likes and an AI generator. That code remains in the git history before
version 3. The pivot to a static enumerable library is what the project was
always reaching for.

## Credits

With apologies and thanks to Jorge Luis Borges, and to Jonathan Basile's
[Library of Babel](https://libraryofbabel.info).

MIT License.
