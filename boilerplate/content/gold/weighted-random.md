---
title: "Weighted Random Selection: Picking Values by Distribution"
description: "Implement weighted random selection with prefix sums and binary search, then handle invalid weights, floating-point boundaries, and repeated draws."
source_url: "http://www.interviewbits.com:80/blog/2014/12/11/random-number-with-distribution/"
source_path: "/blog/2014/12/11/random-number-with-distribution/"
wayback_snapshot: "https://web.archive.org/web/20141228193243/http://www.interviewbits.com:80/blog/2014/12/11/random-number-with-distribution/"
evidence_tier: "Gold"
topic: "algorithm-interview"
rewrite_status: "rewritten"
---

# Weighted Random Selection: Picking Values by Distribution

Weighted random selection appears in interview questions, ranking systems, simulations, games, and load balancing. The goal is to choose an item randomly, but not uniformly: items with higher weights should be selected more often.

## Problem

Given items and positive weights, return one item at random according to the weight distribution.

For example:

```text
items   = [A, B, C]
weights = [2, 3, 5]
```

The total weight is `10`, so `A` should be selected about 20% of the time, `B` about 30%, and `C` about 50%.

## Core Idea: Prefix Sums

Convert the weights into cumulative ranges:

```text
A: 1..2
B: 3..5
C: 6..10
```

Then generate a random number between `1` and the total weight. The range that contains that number determines the selected item.

## Linear Scan Approach

- Build a running total of weights.
- Generate a random integer from `1` to `totalWeight`.
- Scan the prefix sums from left to right.
- Return the first item whose prefix sum is greater than or equal to the random number.

This is simple and works well for small lists.

## Binary Search Optimization

If selection happens many times, precompute the prefix sums once. Then use binary search to find the first prefix sum that is at least the random target.

This changes each selection from `O(N)` to `O(log N)`.

## Complexity

Building prefix sums takes `O(N)` time and space.

Each selection takes `O(N)` with a linear scan or `O(log N)` with binary search.
