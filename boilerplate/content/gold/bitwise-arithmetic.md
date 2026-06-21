---
title: "Bitwise Arithmetic: Replacing Multiplication, Powers, and Modulo"
source_url: "http://www.interviewbits.com:80/blog/2015/01/06/replace-multiplication-power-and-modulo-with-bitwise-operators/"
source_path: "/blog/2015/01/06/replace-multiplication-power-and-modulo-with-bitwise-operators/"
wayback_snapshot: "https://web.archive.org/web/20150212021013/http://www.interviewbits.com:80/blog/2015/01/06/replace-multiplication-power-and-modulo-with-bitwise-operators/"
evidence_tier: "Gold"
topic: "algorithm-interview"
rewrite_status: "rewritten"
---

# Bitwise Arithmetic: Replacing Multiplication, Powers, and Modulo

Bitwise arithmetic questions test whether you understand how integers are represented and how simple operations can be expressed through shifts and masks. These questions are less about memorizing tricks and more about recognizing powers of two.

## Multiplication by Powers of Two

Left shift is equivalent to multiplying by a power of two.

```text
x << k  ==  x * 2^k
```

For example:

```text
5 << 3 == 40
```

because shifting left by `3` multiplies by `8`.

## Division by Powers of Two

Right shift is equivalent to integer division by a power of two for non-negative integers.

```text
x >> k  ==  floor(x / 2^k)
```

For negative numbers, behavior can vary by language and signed-integer rules, so interview solutions should state the assumption clearly.

## Modulo by Powers of Two

When the divisor is a power of two, modulo can be computed with a bit mask:

```text
x % 2^k  ==  x & (2^k - 1)
```

For example:

```text
x % 8 == x & 7
```

This works because `7` is binary `111`, which keeps only the lowest three bits.

## Checking Whether a Number Is a Power of Two

A positive integer is a power of two if it has exactly one bit set.

```text
x > 0 && (x & (x - 1)) == 0
```

This expression clears the lowest set bit. If the result is zero, there was only one set bit to begin with.

## Practical Notes

Bitwise replacements are useful in low-level code and interview reasoning, but readability matters. In production code, prefer clear arithmetic unless bitwise operations are required for performance, memory layout, or protocol work.
