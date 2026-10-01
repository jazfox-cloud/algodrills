---
title: "Sort Words by Length and Frequency"
description: "Count distinct words, then sort them by length and frequency with explicit tie-breakers for deterministic output and predictable complexity."
source_url: "http://www.interviewbits.com:80/blog/2014/12/03/sort-by-length-then-frequency/"
source_path: "/blog/2014/12/03/sort-by-length-then-frequency/"
wayback_snapshot: "https://web.archive.org/web/20141228193235/http://www.interviewbits.com:80/blog/2014/12/03/sort-by-length-then-frequency/"
evidence_tier: "Gold"
topic: "algorithm-interview"
rewrite_status: "rewritten"
---

# Sort Words by Length and Frequency

This interview problem combines counting with custom sorting. You are given a list of words that may contain duplicates, and you need to return each distinct word exactly once, ordered by two rules.

## Problem

Given an unordered list of words, return the distinct words sorted:

- first by word length in descending order
- then by occurrence count in descending order

For example:

```text
[ABC, ABC, ABB, ABCDE, A, B, B, B]
```

should become:

```text
[ABCDE, ABC, ABB, B, A]
```

The longest word comes first. Among words of the same length, the one that appears more often comes first.

## Core Idea

Treat the task as two separate steps:

1. count how many times each word appears
2. sort the distinct words with the required comparator

That separation keeps the implementation straightforward and makes the ordering rule explicit.

## Step 1: Count Occurrences

Use a hash map from word to frequency.

After scanning the input once, you know:

- which words are distinct
- how often each one appears

If the input has `N` words and `K` distinct words, this pass is `O(N)`.

## Step 2: Sort Distinct Words

Now sort only the `K` distinct words. The comparator should:

- prefer longer words
- if lengths are equal, prefer larger frequencies

If the interviewer asks what happens when both length and frequency are equal, make the contract explicit. This version uses ascending lexicographic order as the final tie-breaker, so the same input always produces the same output.

## Example Walkthrough

Input:

```text
[ABC, ABC, ABB, ABCDE, A, B, B, B]
```

Frequencies:

```text
ABCDE -> 1
ABC   -> 2
ABB   -> 1
B     -> 3
A     -> 1
```

Sort by length descending:

- `ABCDE` has length `5`
- `ABC` and `ABB` have length `3`
- `B` and `A` have length `1`

Then break ties by frequency:

- `ABC` comes before `ABB`
- `B` comes before `A`

Final answer:

```text
[ABCDE, ABC, ABB, B, A]
```

## Runnable Python Implementation

The function accepts an iterable of strings. An empty input returns an empty list; a non-string word raises `TypeError` rather than relying on an undefined comparison.

```python
def sort_words(words):
    counts = {}
    for word in words:
        if not isinstance(word, str):
            raise TypeError("words must contain only strings")
        counts[word] = counts.get(word, 0) + 1

    return sorted(
        counts,
        key=lambda word: (-len(word), -counts[word], word),
    )
```

The tuple key expresses the complete rule: negative length and count put larger values first, while `word` puts otherwise tied strings in ascending lexicographic order.

## Deterministic Tie-Break Example

For `["bb", "aa", "bb", "aa"]`, both words have length `2` and frequency `2`. The final lexicographic rule returns:

```text
[aa, bb]
```

This final rule matters in an interview implementation: without it, two valid-looking runs may return different orderings for equal primary keys.

## Why It Works

The counting loop records the exact occurrence count for every distinct word. `sorted` then compares every distinct word using the required ordering tuple: length first, frequency second, and the explicit lexical rule last. Therefore every returned word is distinct and the full output order follows the stated contract.

## Complexity

- Counting frequencies: `O(N)`
- Sorting distinct words: `O(K log K)`
- Extra space: `O(K)`

This is usually the intended solution because the expensive sort is applied only to the distinct words, not to the full input.

## Interview Follow-Up

Useful clarifications include:

- Should the final tie-break be alphabetical or original appearance? This version uses alphabetical order.
- Are comparisons case-sensitive? This version is case-sensitive because Python string comparison is case-sensitive.
- Can the input contain empty strings? Yes: an empty string is a valid string and is sorted by the same rules.
- Do we need the final list only, or also the frequencies?

The main skill here is recognizing that the problem is not about repeated pairwise comparison. It is about aggregating first, then sorting by a composite key.
