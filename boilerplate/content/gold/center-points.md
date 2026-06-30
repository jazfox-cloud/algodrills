---
title: "Center Points: Midpoints and Geometric Centers in Interview Problems"
source_url: "http://www.interviewbits.com:80/blog/2015/02/02/center-points/"
source_path: "/blog/2015/02/02/center-points/"
wayback_snapshot: "https://web.archive.org/web/20150212021106/http://www.interviewbits.com:80/blog/2015/02/02/center-points/"
evidence_tier: "Silver"
topic: "algorithm-interview"
rewrite_status: "rewritten"
---

# Center Points: Midpoints and Geometric Centers in Interview Problems

Questions about center points usually belong to the geometry side of interview prep. The title alone does not lock the problem to one exact task, so the safest way to prepare is to understand the common interpretations that interviewers use when they ask for the center of points.

## Problem

Given points in one or more dimensions, compute a point that represents the center under a clearly defined rule.

The first thing to clarify is which definition of center the interviewer wants. Common variants include:

- the midpoint between two points
- the centroid of many points
- the center of an axis-aligned bounding box
- the point that minimizes total distance under a specific metric

Different definitions lead to different formulas, so a strong answer starts by asking for precision before coding.

## Variant 1: Midpoint of Two Points

If the task gives exactly two points, the center is usually the midpoint.

For points `(x1, y1)` and `(x2, y2)`, the midpoint is:

```text
((x1 + x2) / 2, (y1 + y2) / 2)
```

In higher dimensions, apply the same idea coordinate by coordinate.

This runs in `O(1)` time and uses `O(1)` extra space.

## Variant 2: Centroid of Many Points

If the input contains many points and the interviewer wants the geometric center, they often mean the centroid.

For points:

```text
(x1, y1), (x2, y2), ..., (xn, yn)
```

compute:

```text
centroid_x = (x1 + x2 + ... + xn) / n
centroid_y = (y1 + y2 + ... + yn) / n
```

This is just an average of each coordinate, so it can be computed in one pass over the input.

## Variant 3: Center of a Bounding Box

Sometimes the question is really about enclosing points rather than averaging them.

In that case:

1. find `minX`, `maxX`, `minY`, and `maxY`
2. return `((minX + maxX) / 2, (minY + maxY) / 2)`

This gives the center of the axis-aligned box that contains all points. It is useful when outliers matter for shape coverage but you do not want to average every coordinate.

## Clarify the Distance Model

Another hidden ambiguity is the distance function.

- Under squared Euclidean distance, the centroid is the natural center.
- Under Manhattan distance in one dimension, the median is often the better center.
- If the task requires a center chosen from the input points, the answer may be different again.

That is why the best interview answer is not only a formula, but also a short clarification about what "center" means in the problem statement.

## Numerical and Edge Cases

- Empty input should usually return an error or a null result.
- One point is its own center.
- Integer coordinates may produce fractional centers.
- Large coordinates can overflow fixed-width integer arithmetic if you sum before casting.

When precision matters, use floating-point output or a rational representation if the interviewer asks for exactness.

## Complexity

Midpoint of two points runs in `O(1)` time.

Centroid and bounding-box center for `N` points both run in `O(N)` time with `O(1)` extra space.

## Interview Follow-Up

Good follow-up questions include:

- Do we need the exact geometric center or just a representative point?
- Can the answer be outside the original set of points?
- Are coordinates integers, floats, or very large values?
- Which distance metric defines the best center?

The main skill is not memorizing one formula. It is recognizing that "center point" is underspecified until you tie it to a concrete geometric rule.
