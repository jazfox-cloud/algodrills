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

Array questions built around positive and negative numbers usually test whether you can transform an input without losing track of ordering rules. A common version asks you to rearrange values so that negatives and positives are either grouped or alternated in a predictable way.

## Problem

Given an array containing positive and negative integers, produce a new arrangement that satisfies a sign rule.

Typical interview variants include:

- move all negative values before positive values
- alternate negative and positive values as much as possible
- preserve relative order when the interviewer explicitly requires stability

Because the title alone does not define one exact variant, the most useful interview preparation is to know the contract questions, the baseline partition strategy, and the follow-up for stable alternation.

## Clarify the Variant First

Before you start coding, pin down four details:

- Should negatives come first, or should the array alternate signs?
- If counts are uneven, should extra values stay at the end?
- Does `0` count as positive, negative, or a separate category?
- Must the original left-to-right order of negatives and positives be preserved?

Those questions matter because different answers lead to different implementations. A two-pointer swap is fine for an unstable partition, but it is the wrong tool if the interviewer asks for stable ordering.

## Variant 1: Partition By Sign

If the task is only to group negatives on one side and positives on the other, use a two-pointer scan.

- Start one pointer at the left and another at the right.
- Move the left pointer forward while it already points to a negative number.
- Move the right pointer backward while it already points to a positive number.
- When both pointers stop on misplaced values, swap them.

This finishes in `O(N)` time and uses `O(1)` extra space.

### Why This Works

The left pointer searches for a positive value that belongs on the right side. The right pointer searches for a negative value that belongs on the left side. Every swap fixes two misplaced positions at once.

This is the best answer when:

- the interviewer does not require stable order
- only the final sign partition matters
- in-place space usage is more important than preserving the original sequence

## Worked Partition Example

Suppose the input is:

```text
[4, -3, 2, -1, -7, 6]
```

One valid partition result is:

```text
[-7, -3, -1, 2, 4, 6]
```

Another valid result is:

```text
[-1, -3, -7, 2, 4, 6]
```

Both are correct if stability is not required. That is an important interview point: many array-reordering problems allow multiple valid outputs.

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

### A Clean Stable Construction

If the interviewer wants a stable alternating result, the easiest correct answer is:

1. scan the input once and store negatives in one list
2. store positives in another list
3. write values back by alternating from the two lists
4. append leftover values from the longer list

That keeps the original relative order inside each sign group.

Example:

```text
input      = [3, -2, -5, 6, -1, 4]
negatives  = [-2, -5, -1]
positives  = [3, 6, 4]
result     = [-2, 3, -5, 6, -1, 4]
```

This is usually the safest answer when correctness and clarity matter more than squeezing space to `O(1)`.

## Stability Matters

The main follow-up question is whether you must preserve the original left-to-right order within the negative group and within the positive group.

- If stability is not required, in-place swaps are enough.
- If stability is required, a simple extra-array solution is often clearer.

A stable solution usually collects negatives and positives separately, then writes them back in the required pattern. That approach is easy to reason about and still runs in linear time, although it uses `O(N)` extra space.

## Reference Pseudocode

### Unstable Partition

```text
partitionBySign(arr):
    left = 0
    right = arr.length - 1

    while left <= right:
        while left <= right and arr[left] < 0:
            left += 1

        while left <= right and arr[right] >= 0:
            right -= 1

        if left < right:
            swap(arr[left], arr[right])

    return arr
```

This example treats `0` as non-negative. That rule is not universal, so say it out loud.

### Stable Alternation

```text
alternateStable(arr):
    negatives = []
    positives = []

    for value in arr:
        if value < 0:
            negatives.append(value)
        else:
            positives.append(value)

    result = []
    i = 0
    j = 0

    while i < negatives.length and j < positives.length:
        result.append(negatives[i])
        result.append(positives[j])
        i += 1
        j += 1

    while i < negatives.length:
        result.append(negatives[i])
        i += 1

    while j < positives.length:
        result.append(positives[j])
        j += 1

    return result
```

If the interview requires the output to start with a positive number instead, only the merge order changes.

## Choosing Between In-Place and Stable

This problem is often less about one perfect algorithm and more about recognizing the tradeoff:

- use two pointers for `O(1)` extra space when order does not matter
- use separate lists for the clearest stable solution
- discuss harder in-place stable variants only if the interviewer explicitly pushes for them

Trying to force a stable alternating arrangement in place often leads to rotations, repeated shifts, or other logic that is harder to implement and explain under interview time pressure.

## Edge Cases

- Arrays containing only positive numbers
- Arrays containing only negative numbers
- Zero values, which should be classified explicitly based on the problem statement
- Unequal counts, where one sign must occupy the tail of the result

## Common Mistakes

- assuming there is only one valid output
- forgetting to define how `0` should be treated
- claiming a stable order when swaps actually changed relative positions
- alternating signs without explaining what happens when one side runs out
- jumping to a complicated in-place stable method before giving the simpler linear-space answer

The stability mistake is especially common. A two-pointer partition is fast, but it absolutely does not preserve original order.

## Complexity

- simple partitioning: `O(N)` time and `O(1)` extra space
- stable grouping or stable alternation with helper arrays: `O(N)` time and `O(N)` extra space

## Interview-Ready Summary

The strongest concise answer is:

- first clarify whether the task is partitioning or strict alternation
- ask whether order must stay stable
- if order does not matter, use a two-pointer partition in linear time and constant space
- if order must stay stable, collect negatives and positives separately and merge them back in the required pattern

That shows you understand both the algorithm and the hidden contract behind the prompt.
