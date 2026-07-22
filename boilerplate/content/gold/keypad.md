---
title: "Phone Keypad Letter Combinations: A Backtracking Interview Problem"
seo_title: "Phone Keypad Letter Combinations with Backtracking"
description: "Generate phone keypad letter combinations with backtracking, including the digit mapping, recursive state, complexity, and input edge cases."
source_url: "http://www.interviewbits.com:80/blog/2014/11/28/keypad"
source_path: "/blog/2014/11/28/keypad"
wayback_snapshot: "https://web.archive.org/web/20150212075129/http://www.interviewbits.com:80/blog/2014/11/28/keypad"
evidence_tier: "Gold"
topic: "algorithm-interview"
rewrite_status: "rewritten"
---

# Phone Keypad Letter Combinations: A Backtracking Interview Problem

Mapping digits to letters and generating every possible combination is a classic interview problem. It tests whether you can model a branching search space, maintain recursive state, and produce results without losing or duplicating paths.

## Problem

Given a string containing only digits from `2` to `9`, return all letter combinations that the number could represent. The mapping follows a traditional phone keypad:

- `2` maps to `a`, `b`, `c`
- `3` maps to `d`, `e`, `f`
- `7` maps to `p`, `q`, `r`, `s`
- `9` maps to `w`, `x`, `y`, `z`

For example, the input `23` should produce combinations such as `ad`, `ae`, `af`, `bd`, and so on.

## Core Idea: Backtracking

Each digit creates a set of choices. The final output is built by choosing one letter for each digit in order. That makes the problem a natural fit for depth-first search.

Track two pieces of state:

- The current index in the input string.
- The current partial combination.

When the index reaches the end of the input, the partial combination is complete and can be added to the result list.

## Algorithm Steps

- Build a lookup table from each digit to its possible letters.
- Start a recursive search at index `0`.
- For the current digit, iterate through each mapped letter.
- Append one letter to the current path.
- Recurse into the next digit.
- Remove the last letter after returning, so the next branch starts from the correct state.

## Complexity

Let `N` be the number of input digits. In the worst case, every digit maps to four letters, so the number of combinations is `4^N`.

The time complexity is `O(4^N * N)` because each complete combination has length `N`.

The auxiliary space complexity is `O(N)` for the recursion stack and current path, excluding the output list.

## Related Guide

See [Backtracking vs Iterative Generation](/backtracking-vs-iterative-generation/) for a broader comparison of recursive search, iterative expansion, and bit-mask traversal.
