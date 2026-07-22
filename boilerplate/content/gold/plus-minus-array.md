---
title: "Plus Minus Array: Reordering Positive and Negative Values"
description: "Rearrange positive and negative array values by grouping or alternating signs, with stable and in-place approaches plus their tradeoffs."
source_url: "http://www.interviewbits.com:80/blog/2014/12/01/plus-minus-array/"
source_path: "/blog/2014/12/01/plus-minus-array/"
wayback_snapshot: "https://web.archive.org/web/20141228212355/http://www.interviewbits.com:80/blog/2014/12/01/plus-minus-array/"
evidence_tier: "Gold"
topic: "algorithm-interview"
rewrite_status: "rewritten"
---

# Plus Minus Array: Reordering Positive and Negative Values

Array questions built around positive and negative numbers usually test whether you can transform an input in place without losing track of ordering rules. A common version asks you to rearrange values so that numbers with different signs are grouped or alternated in a predictable way.

## Problem

Given an array containing positive and negative integers, produce a new arrangement that satisfies a sign rule.

Typical interview variants include:

- move all negative values before positive values
- alternate negative and positive values as much as possible
- preserve relative order when the interviewer explicitly requires stability

Because the title alone does not define one exact variant, the most useful interview preparation is to know the two standard approaches: partition first, then optionally interleave.

## Variant 1: Partition By Sign

If the task is only to group negatives on one side and positives on the other, use a two-pointer scan.

- Start one pointer at the left and another at the right.
- Move the left pointer forward while it already points to a negative number.
- Move the right pointer backward while it already points to a positive number.
- When both pointers stop on misplaced values, swap them.

This finishes in `O(N)` time and uses `O(1)` extra space.

## Variant 2: Alternate Signs

If the task asks for an alternating pattern such as negative, positive, negative, positive, it helps to split the work into two phases.

1. Partition the array by sign.
2. Count how many negatives and positives you have.
3. Interleave the two groups until one side runs out.
4. Append any remaining values at the end.

For example:

```text
[-5, -2, -1, 4, 7, 9]
```

can become:

```text
[-5, 4, -2, 7, -1, 9]
```

There are multiple valid outputs unless the problem also requires stable ordering.

## Stability Matters

The main follow-up question is whether you must preserve the original left-to-right order within the negative group and within the positive group.

- If stability is not required, in-place swaps are enough.
- If stability is required, a simple extra-array solution is often clearer.

A stable solution usually collects negatives and positives separately, then writes them back in the required pattern. That approach is easy to reason about and still runs in linear time, although it uses `O(N)` extra space.

## Edge Cases

- Arrays containing only positive numbers
- Arrays containing only negative numbers
- Zero values, which should be classified explicitly based on the problem statement
- Unequal counts, where one sign must occupy the tail of the result

## Complexity

Simple partitioning runs in `O(N)` time with `O(1)` extra space.

Stable alternating output usually runs in `O(N)` time with `O(N)` extra space.
