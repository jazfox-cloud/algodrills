---
title: "Sort Words by Length and Frequency"
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

If the interviewer asks what happens when both length and frequency are equal, clarify the tie-break rule. A deterministic implementation can fall back to lexicographic order or first appearance, but that part is not required unless the prompt says so.

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

## Reference Approach

Pseudo-code:

```text
count = empty map
for word in words:
    count[word] += 1

distinct = keys(count)
sort distinct by:
    1. length descending
    2. count descending

return distinct
```

## Complexity

- Counting frequencies: `O(N)`
- Sorting distinct words: `O(K log K)`
- Extra space: `O(K)`

This is usually the intended solution because the expensive sort is applied only to the distinct words, not to the full input.

## Interview Follow-Up

Useful clarifications include:

- Should ties be broken alphabetically or by original appearance?
- Are comparisons case-sensitive?
- Can the input contain empty strings?
- Do we need the final list only, or also the frequencies?

The main skill here is recognizing that the problem is not about repeated pairwise comparison. It is about aggregating first, then sorting by a composite key.
