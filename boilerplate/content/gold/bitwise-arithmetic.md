---
title: "Bitwise Arithmetic: Replacing Multiplication, Powers, and Modulo"
seo_title: "Bitwise Arithmetic: Multiply, Powers, and Modulo"
description: "Learn how shifts and masks replace multiplication by powers of two, test powers of two, and compute modulo when the divisor is a power of two."
source_url: "http://www.interviewbits.com:80/blog/2015/01/06/replace-multiplication-power-and-modulo-with-bitwise-operators/"
source_path: "/blog/2015/01/06/replace-multiplication-power-and-modulo-with-bitwise-operators/"
wayback_snapshot: "https://web.archive.org/web/20150212021013/http://www.interviewbits.com:80/blog/2015/01/06/replace-multiplication-power-and-modulo-with-bitwise-operators/"
evidence_tier: "Gold"
topic: "algorithm-interview"
rewrite_status: "rewritten"
---

# Bitwise Arithmetic: Replacing Multiplication, Powers, and Modulo

Bitwise arithmetic questions test whether you understand how integers are represented and how simple operations can be expressed through shifts and masks. These questions are less about memorizing tricks and more about recognizing powers of two.

## Quick Answer and Assumptions

For a non-negative integer `x` and a non-negative integer shift count `k`, use these Python expressions:

- Multiply by a power of two: `x << k` equals `x * (2 ** k)`.
- Divide and round down: `x >> k` equals `x // (2 ** k)`.
- Take the remainder: `x & ((1 << k) - 1)` equals `x % (2 ** k)`.
- Test a power of two: `x > 0 and (x & (x - 1)) == 0`.

Here, `**` means exponentiation. Python's `^` operator means XOR, not exponentiation. In a fixed-width integer language, also check the permitted shift count and whether the result fits the chosen type.

## Multiplication by Powers of Two

Each binary digit has twice the value of the position to its right, so shifting left by one position doubles the number. Python integers can grow to hold the result.

```text
x << k  ==  x * (2 ** k)
```

For example:

```text
5 << 3 == 40
```

because shifting left by `3` multiplies by `8`.

This computes multiplication by a power of two, not an arbitrary power of `x`. To construct the power of two itself, use `1 << k`; for example, `1 << 3` is `8`.

## Division by Powers of Two

Right shift is equivalent to integer division by a power of two for non-negative integers.

```text
x >> k  ==  x // (2 ** k)
```

For negative numbers, behavior can vary by language and signed-integer rules, so interview solutions should state the assumption clearly.

In Python, `(-7) >> 1` is `-4`, matching floor division `(-7) // 2`. It is not division rounded toward zero, which would produce `-3`.

## Modulo by Powers of Two

When the divisor is a power of two, modulo can be computed with a bit mask:

```text
x % (2 ** k)  ==  x & ((1 << k) - 1)
```

For example:

```text
x % 8 == x & 7
```

This works because `7` is binary `111`, which keeps only the lowest three bits.

For a worked example, split `29` into a multiple of `8` and a remainder: `29 = 3 * 8 + 5`. The multiple has three zero low bits, so masking leaves only the remainder:

```text
  11101   (29)
& 00111   (7)
-------
  00101   (5)
```

The divisor must be a positive power of two. Using `x & (divisor - 1)` for other divisors is incorrect: `12 % 6` is `0`, while `12 & 5` is `4`.

## Checking Whether a Number Is a Power of Two

A positive integer is a power of two if it has exactly one bit set.

```text
x > 0 and (x & (x - 1)) == 0
```

This expression clears the lowest set bit. If the result is zero, there was only one set bit to begin with.

For `8`, the calculation is `1000 & 0111 = 0000`. For `12`, it is `1100 & 1011 = 1000`, so another set bit remains. The `x > 0` guard matters: zero also makes `x & (x - 1)` equal zero, but zero is not a power of two. One is a power of two because it equals `2 ** 0`.

## Runnable Python Example

This function accepts a non-negative integer value and a positive power-of-two integer divisor. It returns the quotient and remainder together, as `divmod` does.

```python
def divide_by_power_of_two(x: int, divisor: int) -> tuple[int, int]:
    if x < 0:
        raise ValueError("x must be non-negative")
    if divisor <= 0 or (divisor & (divisor - 1)) != 0:
        raise ValueError("divisor must be a positive power of two")
    k = divisor.bit_length() - 1
    return x >> k, x & (divisor - 1)


assert divide_by_power_of_two(29, 8) == (3, 5)
assert divide_by_power_of_two(0, 8) == (0, 0)
assert divide_by_power_of_two(7, 8) == (0, 7)
assert divide_by_power_of_two(8, 8) == (1, 0)
assert divide_by_power_of_two(29, 1) == (29, 0)
```

The correctness check is `x == quotient * divisor + remainder`, with `0 <= remainder < divisor`. When the divisor is `1`, the shift count and mask are both zero, giving quotient `x` and remainder `0`.

## Interview Edge Cases and Complexity

- Check zero and one separately when testing powers of two.
- Reject zero, negative divisors, and divisors such as `6` before using a mask.
- For shift count zero, multiplication and division leave `x` unchanged; modulo one returns zero.
- Establish negative-number rounding and remainder rules before porting an expression to another language.
- For fixed-width integers, verify overflow and shift-count rules before replacing multiplication with a shift.

For values that fit in a machine word, these operations are normally analyzed as constant time and constant auxiliary space. Python integers have arbitrary precision, so processing larger integers can require more time and storage; do not claim constant cost independent of bit length.

## Practical Notes

Bitwise replacements are useful in low-level code and interview reasoning, but readability matters. In production code, prefer clear arithmetic unless bitwise operations are required for performance, memory layout, or protocol work.
