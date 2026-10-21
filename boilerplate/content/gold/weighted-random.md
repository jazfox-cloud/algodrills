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

This Python example is an independent educational implementation. It accepts a non-empty iterable of non-negative Python integers, excluding booleans, and requires at least one positive weight. Empty, negative, and all-zero inputs raise `ValueError`; floats and booleans raise `TypeError`. Decimal probabilities need a separate representation or an exact conversion to integer ratios.

```python
from bisect import bisect_left
import random


class WeightedPicker:
    def __init__(self, weights):
        prefix = []
        total = 0
        for weight in weights:
            if type(weight) is not int:
                raise TypeError("weights must be integers, not booleans")
            if weight < 0:
                raise ValueError("weights must be non-negative")
            total += weight
            prefix.append(total)
        if total == 0:
            raise ValueError("at least one weight must be positive")
        self._prefix = tuple(prefix)
        self._total = total

    def pick(self, rng=random):
        target = rng.randrange(1, self._total + 1)
        return bisect_left(self._prefix, target)


items = ["A", "B", "C"]
picker = WeightedPicker([2, 3, 5])
index = picker.pick(random.Random(42))
assert 0 <= index < len(items)
print(items[index])
```

`randrange` excludes its upper bound, so the target is exactly in `1..total`. `bisect_left` implements the required lower bound. `pick` returns an index; keep the item sequence aligned with the original weights. Construction copies cumulative sums and does not mutate the caller's weights. Picks use the fixed distribution with replacement; rebuilding is necessary if the weights change.

Python integers retain exact sums even beyond 64 bits. The default generator is for simulation and interview examples, not cryptographic selection. A supplied generator must provide a uniform `randrange(start, stop)` with the same half-open interval convention.

## Worked Boundaries and Deterministic Tests

For `[2, 0, 3]`, the prefix sums are `[2, 2, 5]`. Targets `1` and `2` select index `0`; targets `3`, `4`, and `5` select index `2`. At target `2`, the leftmost equal prefix is index `0`, so the zero-weight index `1` is skipped. At target `3`, binary search moves past both `2`s and reaches `5`.

The following tests reuse `WeightedPicker` and supply each possible target directly. Enumerating slots checks exact boundaries without relying on a noisy frequency estimate.

```python
class FixedTarget:
    def __init__(self, target):
        self.target = target

    def randrange(self, start, stop):
        assert start <= self.target < stop
        return self.target


picker = WeightedPicker([2, 0, 3])
assert [picker.pick(FixedTarget(t)) for t in range(1, 6)] == [0, 0, 2, 2, 2]
assert WeightedPicker([0, 4, 0]).pick(FixedTarget(4)) == 1
assert WeightedPicker([1]).pick(FixedTarget(1)) == 0

for weights, error in [([], ValueError), ([0, 0], ValueError),
                       ([-1, 2], ValueError), ([1.5], TypeError),
                       ([True], TypeError)]:
    try:
        WeightedPicker(weights)
    except error:
        pass
    else:
        raise AssertionError("invalid weights were accepted")
```

For a general index `i`, let the preceding prefix be `0` when `i = 0`. The targets belonging to `i` are strictly greater than that preceding prefix and at most `prefix[i]`. Their count is exactly `weight[i]`. Uniform target generation therefore assigns probability `weight[i] / total`, including zero probability when adjacent prefixes are equal. Individual random runs can still deviate from the expected proportions.

## Python Library Choice Versus Prefix Sums

In Python, `random.choices(items, weights=weights, k=1)` is a good fit when you need one or more independent draws and do not need to show the picker internals. It samples **with replacement**, so an item can be returned again on the next draw.

For an interview or a service that reuses one distribution many times, implement the prefix sums explicitly. That makes the `O(N)` preprocessing and `O(log N)` lookup visible, and it gives you a place to validate negative or all-zero weights.

```text
prefix = [2, 5, 10]
target = 7
index = lowerBound(prefix, target)  # 2, selecting C
```

Do not use a direct floating-point equality check to decide a boundary. Pick one convention, such as an integer target from `1..totalWeight`, and use the same lower-bound comparison for every draw.

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

These are operation counts assuming bounded-size arithmetic and constant-cost random target generation. If the total uses `B` bits, Python big-integer arithmetic/comparisons and random-target generation also depend on `B`; storing all prefixes uses up to `O(NB)` bits. Returning one index takes constant additional output space, apart from the target integer.

## What to Remember

Weighted random selection is mostly a search problem disguised as probability. Once you map weights into cumulative ranges, the rest is straightforward:

- preprocess once with prefix sums
- draw one random target in the total range
- use lower bound to find the owner of that target

That framing gives you a clean answer for both the baseline solution and the optimized follow-up.
