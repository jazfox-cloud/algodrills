---
title: "Weighted Random Selection: Picking Values by Distribution"
description: "Use prefix sums and binary search to sample by weight, then handle zero weights, repeated picks, and floating-point boundary mistakes."
source_url: "http://www.interviewbits.com:80/blog/2014/12/11/random-number-with-distribution/"
source_path: "/blog/2014/12/11/random-number-with-distribution/"
wayback_snapshot: "https://web.archive.org/web/20141228193243/http://www.interviewbits.com:80/blog/2014/12/11/random-number-with-distribution/"
evidence_tier: "Gold"
topic: "algorithm-interview"
rewrite_status: "rewritten"
---

# Weighted Random Selection: Picking Values by Distribution

Weighted random selection is a common interview problem because it blends probability, arrays, prefix sums, and search. The task sounds random, but the implementation is mostly deterministic bookkeeping: turn weights into ranges, generate one target number, and find which range owns it.

## Problem

Given an array of items and a matching array of non-negative weights, return an item so that each item's selection probability is proportional to its weight.

For example:

```text
items   = [A, B, C]
weights = [2, 3, 5]
```

The total weight is `10`, so a correct implementation should choose:

- `A` about 20% of the time
- `B` about 30% of the time
- `C` about 50% of the time

If a weight is `0`, that item should never be picked.

## Why Prefix Sums Work

The simplest way to think about the distribution is to convert it into a line of numbered slots:

```text
A: 1..2
B: 3..5
C: 6..10
```

Now every slot is equally likely. If the random target is `4`, the answer is `B`. If the target is `9`, the answer is `C`.

That means the problem has two clear steps:

- build cumulative weights
- find the first cumulative value that is at least the random target

## Preprocessing

Create a prefix-sum array where each position stores the total weight up to that item:

```text
weights = [2, 3, 5]
prefix  = [2, 5, 10]
```

This array is sorted automatically as long as all weights are non-negative, which is exactly what makes binary search possible.

## Linear Scan Solution

The most direct implementation is:

- compute the total weight
- generate a random integer from `1` to `totalWeight`
- walk through the prefix sums from left to right
- return the first index whose prefix sum is at least the target

Example:

```text
prefix = [2, 5, 10]
target = 5
```

The first prefix sum that is at least `5` is `5`, so the selected item is `B`.

This approach is easy to explain and often enough for a first-pass interview answer.

## Faster Repeated Sampling with Binary Search

If the same distribution is queried many times, the expensive part should not be repeated. Build the prefix sums once, then use binary search for every pick.

```text
prefix = [2, 5, 10]
target = 7
```

Binary search finds the leftmost prefix sum greater than or equal to `7`, which is `10`, so the selected item is `C`.

This reduces each draw from `O(N)` to `O(log N)` after `O(N)` preprocessing.

## Reference Implementation

```text
buildPicker(weights):
    prefix = []
    running = 0

    for weight in weights:
        if weight < 0:
            error
        running += weight
        prefix.append(running)

    if running == 0:
        error

    return prefix, running

pickIndex(prefix, totalWeight):
    target = randomInteger(1, totalWeight)
    return lowerBound(prefix, target)
```

The key detail is `lowerBound`: return the first index whose value is at least the target.

## Common Interview Pitfalls

### Off-by-One Boundaries

Be consistent about the target range.

- If you generate `1..totalWeight`, use `>= target`.
- If you generate `0..totalWeight - 1`, compare against cumulative ranges built for zero-based intervals.

Mixing these conventions causes subtle bias.

### Allowing Negative Weights

Negative weights break the model entirely. Prefix sums may stop being sorted, and the idea of probability mass no longer makes sense.

Reject negative weights early.

### All-Zero Input

If every weight is `0`, there is no valid probability distribution. Returning an arbitrary item would be wrong.

Treat this as invalid input.

### Rebuilding on Every Query

If the interviewer says the picker will be called thousands of times, rebuilding prefix sums inside each call is the main optimization miss.

Build once, sample many times.

## How to Talk About Randomness

Interviewers usually do not expect a proof, but they do expect the core argument:

- each integer target is chosen uniformly
- item `i` owns exactly `weight[i]` integer targets
- therefore item `i` is selected with probability `weight[i] / totalWeight`

That short explanation is often more important than the code.

## Follow-Up Variants

A good interviewer may extend the problem in one of these directions:

- dynamic updates to weights after construction
- sampling with replacement versus without replacement
- very large weights that require `64-bit` sums
- floating-point probabilities instead of integers

For dynamic updates, a Fenwick tree or segment tree becomes more useful because updates and picks can both stay logarithmic.

## Complexity

- prefix-sum preprocessing: `O(N)` time and `O(N)` space
- one draw with linear scan: `O(N)`
- one draw with binary search: `O(log N)`

## What to Remember

Weighted random selection is mostly a search problem disguised as probability. Once you map weights into cumulative ranges, the rest is straightforward:

- preprocess once with prefix sums
- draw one random target in the total range
- use lower bound to find the owner of that target

That framing gives you a clean answer for both the baseline solution and the optimized follow-up.
