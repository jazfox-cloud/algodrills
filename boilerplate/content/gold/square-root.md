---
title: "How to Compute a Square Root Without Calling a Library Function"
source_url: "http://www.interviewbits.com:80/blog/2014/11/29/square-root/"
source_path: "/blog/2014/11/29/square-root/"
wayback_snapshot: "https://web.archive.org/web/20141228212350/http://www.interviewbits.com:80/blog/2014/11/29/square-root/"
evidence_tier: "Gold"
topic: "algorithm-interview"
rewrite_status: "rewritten"
---

# How to Compute a Square Root Without Calling a Library Function

Implementing square root without calling a built-in function is a useful interview exercise because it combines numerical reasoning, boundary handling, and safe arithmetic. The problem usually appears in one of two forms: return the integer part of the square root, or compute a floating-point approximation to a chosen precision.

## Approach 1: Binary Search

If the goal is to compute `floor(sqrt(N))` for a non-negative integer `N`, binary search is a direct and reliable approach. The answer must lie in a bounded interval, and the square function is monotonic on non-negative numbers.

For `N >= 1`, the search interval can start as `[1, N]`. For each midpoint, compare `mid * mid` against `N` and move the search boundaries accordingly.

## Binary Search Details

- Set `low = 0` and `high = N`.
- Compute `mid = low + (high - low) / 2`.
- If `mid * mid == N`, return `mid`.
- If `mid * mid < N`, store `mid` as the current best answer and move right.
- If `mid * mid > N`, move left.

One practical detail matters: `mid * mid` can overflow for large integers. A safer comparison is to use division, such as `mid <= N / mid`, instead of multiplying first.

## Approach 2: Newton's Method

Newton's method converges quickly by repeatedly improving an estimate. For the equation `x^2 - N = 0`, the update rule is:

```text
x_next = 0.5 * (x + N / x)
```

Start with a positive guess, often `N` itself for simple implementations, and repeat the update until the difference between two consecutive estimates is smaller than the required tolerance.

## When to Use Each Approach

Binary search is easier to reason about and works well for integer square roots. Newton's method is faster for floating-point approximations, but it requires careful handling of precision, zero, and stopping conditions.
