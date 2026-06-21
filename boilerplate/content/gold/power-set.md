---
title: "Power Set Generation: Two Practical Interview Approaches"
source_url: "http://www.interviewbits.com:80/blog/2014/12/03/power-set/"
source_path: "/blog/2014/12/03/power-set/"
wayback_snapshot: "https://web.archive.org/web/20141228212413/http://www.interviewbits.com:80/blog/2014/12/03/power-set/"
evidence_tier: "Gold"
topic: "algorithm-interview"
rewrite_status: "rewritten"
---

# Power Set Generation: Two Practical Interview Approaches

A power set is the set of all subsets of a given set. It includes the empty set and the original set itself. If the input has `N` elements, the power set contains `2^N` subsets.

Generating every subset without duplicates or omissions is a common interview problem because it tests your ability to model choices cleanly.

## Approach 1: Bit Masking

Each element has exactly two states in a subset: included or excluded. That maps naturally to binary digits.

For an input array of length `N`, every integer from `0` to `2^N - 1` can represent one subset. If the `j`-th bit of the number is `1`, include the `j`-th input element. If it is `0`, leave that element out.

## Bit Masking Steps

- Let `total = 1 << N`.
- Iterate `mask` from `0` to `total - 1`.
- For each bit position `j`, check whether `mask & (1 << j)` is non-zero.
- If the bit is set, add `nums[j]` to the current subset.
- Append the completed subset to the result list.

This approach is compact and avoids recursion. It is especially convenient when the input size is small enough that `2^N` subsets can fit in memory.

## Approach 2: Backtracking

Backtracking models subset generation as a decision tree. At each element, make one of two choices:

- Include the current element.
- Exclude the current element.

When the recursion index reaches the end of the array, copy the current path into the result list.

## Choosing Between Them

Bit masking is concise and iterative. Backtracking is often easier to extend when the problem adds constraints, duplicate handling, pruning, or ordering requirements.

Both approaches have the same output size, so both require `O(2^N * N)` time in the general case.
