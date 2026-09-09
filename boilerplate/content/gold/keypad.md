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
- `4` maps to `g`, `h`, `i`
- `5` maps to `j`, `k`, `l`
- `6` maps to `m`, `n`, `o`
- `7` maps to `p`, `q`, `r`, `s`
- `8` maps to `t`, `u`, `v`
- `9` maps to `w`, `x`, `y`, `z`

For example, the input `23` should produce combinations such as `ad`, `ae`, `af`, `bd`, and so on.

## Input Contract

The Python implementation below accepts a string. For this version of the problem, an empty string returns `[]`: there are no phone digits to expand. Any character outside ASCII `2` through `9`, including `0`, `1`, spaces, or letters, raises `ValueError`. Confirm these choices with your interviewer instead of silently dropping unsupported characters.

Repeated digits are valid. For example, `22` produces nine combinations, including `aa`, `ab`, and `ba`; the two positions are independent choices. Results follow the digit mapping order and need no final sort.

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

## Runnable Python Implementation

```python
def letter_combinations(digits: str) -> list[str]:
    letters = {
        "2": "abc", "3": "def", "4": "ghi", "5": "jkl",
        "6": "mno", "7": "pqrs", "8": "tuv", "9": "wxyz",
    }
    if any(digit not in letters for digit in digits):
        raise ValueError("Use only digits 2 through 9")
    if not digits:
        return []

    result = []
    path = []

    def search(index):
        if index == len(digits):
            result.append("".join(path))
            return
        for letter in letters[digits[index]]:
            path.append(letter)
            search(index + 1)
            path.pop()

    search(0)
    return result


assert letter_combinations("23") == [
    "ad", "ae", "af", "bd", "be", "bf", "cd", "ce", "cf"
]
assert letter_combinations("") == []
assert letter_combinations("7") == ["p", "q", "r", "s"]
assert len(letter_combinations("79")) == 16
```

At the start of `search(index)`, `path` contains exactly one valid letter for each of the first `index` digits. Appending a letter extends that invariant by one position. Popping it after the recursive call restores the prefix for the next choice.

Each complete sequence of choices reaches one leaf, so every valid combination is emitted exactly once. Joining the path creates a separate string; storing the mutable path itself would let later backtracking change earlier results.

## Worked Example: Input 23

Start with an empty path. The first digit, `2`, creates three branches:

- Choose `a`, then try `d`, `e`, and `f` for digit `3`: emit `ad`, `ae`, `af`.
- Remove `a` and choose `b`: emit `bd`, `be`, `bf`.
- Remove `b` and choose `c`: emit `cd`, `ce`, `cf`.

Within the first branch, emitting `ad` returns to the call with prefix `a`. The final `d` is removed before trying `e`, so the next result is `ae`, not `ade`. Once all three second-digit choices finish, the outer call removes `a` and moves to `b`.

The complete result has `3 * 3 = 9` strings, each of length two, in the order shown in the assertion above.

## Edge Cases to Check

- Empty input: return `[]` before entering the search; otherwise the base case would emit an empty string.
- Four-letter digits: `7` and `9` each have four choices, so `79` produces 16 results.
- Repeated digits: `22` still produces nine distinct strings; do not deduplicate input digits.
- Unsupported characters: `10`, `2a`, and `2 3` raise `ValueError` before any combinations are generated.
- Long input: the output grows exponentially. Discuss feasible input sizes; a generator can avoid storing all results at once, but cannot avoid the work of enumerating them.

## Complexity

Let `N` be the number of input digits. In the worst case, every digit maps to four letters, so the number of combinations is `4^N`.

The time complexity is `O(4^N * N)` because each complete combination has length `N`.

The auxiliary space complexity is `O(N)` for the recursion stack and current path, excluding the output list.

More precisely, for nonempty input let `P` be the product of the number of letters for each digit. Materializing all results takes `O(N * P)` time and `O(N * P)` output space. For `23`, `P = 9`; for `79`, `P = 16`. Input validation adds `O(N)` time. The empty-input case takes constant time and returns an empty list.

## Related Guide

See [Backtracking vs Iterative Generation](/backtracking-vs-iterative-generation/) for a broader comparison of recursive search, iterative expansion, and bit-mask traversal.
