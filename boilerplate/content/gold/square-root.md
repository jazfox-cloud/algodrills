---
title: "How to Compute a Square Root Without Calling a Library Function"
seo_title: "Compute a Square Root Without a Library Function"
description: "Compute integer or approximate square roots without a library call using binary search or Newton's method, with boundary and precision checks."
source_url: "http://www.interviewbits.com:80/blog/2014/11/29/square-root/"
source_path: "/blog/2014/11/29/square-root/"
wayback_snapshot: "https://web.archive.org/web/20141228212350/http://www.interviewbits.com:80/blog/2014/11/29/square-root/"
evidence_tier: "Gold"
topic: "algorithm-interview"
rewrite_status: "rewritten"
---

# How to Compute a Square Root Without Calling a Library Function

Implementing square root without calling a built-in function is a useful interview exercise because it combines numerical reasoning, boundary handling, and safe arithmetic. The problem usually appears in one of two forms: return the integer part of the square root, or compute a floating-point approximation to a chosen precision.

## Clarify the Contract First

Before choosing an algorithm, ask what the function should return:

- For an integer input, should the answer be `floor(sqrt(N))`?
- Should a non-perfect square produce a decimal approximation?
- How should negative inputs be handled?
- If the result is approximate, what error tolerance is acceptable?

Those details change both the algorithm and its stopping condition. In most interview versions, an integer square-root function accepts `N >= 0` and returns the greatest integer `r` such that `r * r <= N`.

## Approach 1: Binary Search for an Integer Square Root

If the goal is to compute `floor(sqrt(N))` for a non-negative integer `N`, binary search is a direct and reliable approach. The answer must lie in a bounded interval, and the square function is monotonic on non-negative numbers.

Handle `0` and `1` directly. For `N >= 2`, the answer lies in `[1, floor(N / 2)]`, so there is no reason to search all the way to `N`.

### Binary Search Details

- Set `low = 1` and `high = floor(N / 2)`.
- Compute `mid = low + (high - low) / 2`.
- If `mid <= N / mid`, store `mid` as the current best answer and move right.
- Otherwise, move left.
- When the search ends, return the best valid midpoint.

The division comparison matters. In a fixed-width integer type, `mid * mid` may overflow before it is compared with `N`. Comparing `mid <= N / mid` expresses the same condition without performing the risky multiplication.

### Reference Pseudocode

```text
integerSquareRoot(n):
    if n < 0:
        error "square root is undefined for negative real numbers"

    if n < 2:
        return n

    low = 1
    high = floor(n / 2)
    answer = 1

    while low <= high:
        mid = low + floor((high - low) / 2)

        if mid <= floor(n / mid):
            answer = mid
            low = mid + 1
        else:
            high = mid - 1

    return answer
```

The variable `answer` preserves the largest midpoint whose square does not exceed `N`. That is exactly the definition of `floor(sqrt(N))`.

## Worked Binary Search Example

For `N = 27`, search the interval `[1, 13]`:

```text
mid = 7   -> 7 > 27 / 7, so move left
mid = 3   -> 3 <= 27 / 3, save 3 and move right
mid = 5   -> 5 <= 27 / 5, save 5 and move right
mid = 6   -> 6 > 27 / 6, so move left
```

The search stops with `answer = 5`. Since `5^2 = 25` and `6^2 = 36`, the integer square root of `27` is `5`.

For a perfect square such as `N = 49`, the same algorithm returns `7`.

## Approach 2: Newton's Method for a Decimal Approximation

Newton's method converges quickly by repeatedly improving an estimate. For the equation `x^2 - N = 0`, the update rule is:

```text
x_next = 0.5 * (x + N / x)
```

Start with a positive guess and repeat the update until the difference between consecutive estimates is at most the required tolerance.

```text
approximateSquareRoot(n, epsilon):
    if n < 0:
        error "square root is undefined for negative real numbers"

    if n == 0:
        return 0

    estimate = max(1, n)

    while true:
        next = 0.5 * (estimate + n / estimate)

        if abs(next - estimate) <= epsilon:
            return next

        estimate = next
```

For `N = 10`, the estimates begin like this:

```text
10
5.5
3.6590909...
3.1960050...
3.1624556...
3.1622776...
```

The sequence quickly approaches `sqrt(10)`. A production numerical routine may use a relative error test as well, but an explicit absolute tolerance is usually enough for an interview answer when the expected input range is known.

## When to Use Each Approach

Use binary search when the output is an integer and you want a simple correctness argument. Use Newton's method when the output is a decimal approximation and fast convergence matters.

- Binary search: `O(log N)` time and `O(1)` extra space.
- Newton's method: `O(log P)` iterations for roughly `P` bits of precision under standard assumptions, with `O(1)` extra space.

The complexity statement for Newton's method depends on the numeric model and precision target, so avoid claiming that it is simply `O(log N)` without explaining what is being measured.

## Edge Cases

- `N = 0`: return `0` before any division.
- `N = 1`: return `1` directly.
- `0 < N < 1`: a decimal implementation should not use `N / 2` as an upper bound because the square root is greater than `N`.
- Negative input: reject it unless complex-number output is part of the contract.
- Large integers: avoid `mid * mid` unless the language provides a wider safe type.
- Approximate output: define the tolerance and ensure the iteration cannot divide by zero.

## Common Mistakes

- solving the decimal version when the interviewer asked for an integer floor
- returning the last midpoint instead of the largest valid midpoint
- overflowing while evaluating `mid * mid`
- forgetting that `0` needs special handling in Newton's formula
- comparing floating-point values for exact equality
- using a tolerance without stating what accuracy it guarantees

## Why the Binary Search Is Correct

At every step, `answer` is a valid lower bound: `answer^2 <= N`. When a midpoint is valid, the algorithm records it and searches for a larger valid value. When a midpoint is too large, every value to its right is also too large because squaring is monotonic for non-negative numbers.

Once `low > high`, no unexamined larger valid integer remains. Therefore `answer` is the greatest integer whose square is at most `N`, which is `floor(sqrt(N))`.

## Interview-Ready Summary

Start by clarifying whether the expected result is an integer floor or a decimal approximation. For `floor(sqrt(N))`, binary-search the non-negative answer range, retain the largest valid midpoint, and compare with `mid <= N / mid` to avoid overflow. For an approximate result, use Newton's update and stop when consecutive estimates differ by no more than an agreed tolerance.
