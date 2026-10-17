---
title: "Center Points: Midpoints and Geometric Centers in Interview Problems"
seo_title: "Center Points in Interview Geometry Problems"
description: "Compare midpoint, centroid, and bounding-box center definitions, with formulas and edge cases for choosing the intended center of a set of points."
source_url: "http://www.interviewbits.com:80/blog/2015/02/02/center-points/"
source_path: "/blog/2015/02/02/center-points/"
wayback_snapshot: "https://web.archive.org/web/20150212021106/http://www.interviewbits.com:80/blog/2015/02/02/center-points/"
evidence_tier: "Silver"
topic: "algorithm-interview"
rewrite_status: "rewritten"
---

# Center Points: Midpoints and Geometric Centers in Interview Problems

Questions about center points usually belong to the geometry side of interview prep. The title alone does not lock the problem to one exact task, so the safest way to prepare is to understand the common interpretations that interviewers use when they ask for the center of points.

The implementations and contracts below are independent educational examples built around the archived topic. They do not imply that the snapshot specified these exact variants.

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

If the interviewer defines the center as the average position of equally weighted input points, compute the centroid. The phrase "geometric center" alone does not establish that definition.

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

## Choosing the Right Center

Use the wording of the task to pick the rule before calculating anything:

- Two endpoints or a line segment: use the midpoint.
- Average location of every point: use the centroid.
- Center of the smallest axis-aligned enclosure: use the bounding-box center.
- Minimum total Manhattan distance in one dimension: consider a median instead of a centroid.

For example, with points `(0, 0)`, `(2, 2)`, and `(8, 2)`, the centroid is `(10 / 3, 4 / 3)`. The bounding-box center is `(4, 1)`, because the box runs from `x = 0` to `8` and from `y = 0` to `2`. Both are valid calculations, but they answer different questions.

## Runnable Python with Exact Results

These examples use two-dimensional integer coordinates, including negative and arbitrarily large integers. Each point must contain exactly two integer coordinates; this is a caller precondition. `midpoint` takes two points. The other functions accept a finite iterable of points, consume it once, and raise `ValueError` for empty input. They do not modify the points or an input list, although an input iterator is consumed.

Results are pairs of standard-library `Fraction` values, so a center such as `(10 / 3, 4 / 3)` stays exact. Duplicate points count as separate observations for the centroid; they do not change the bounding box. A single point is its own center under both definitions.

```python
from fractions import Fraction


def midpoint(a, b):
    ax, ay = a
    bx, by = b
    return Fraction(ax + bx, 2), Fraction(ay + by, 2)


def centroid(points):
    total_x = total_y = count = 0
    for x, y in points:
        total_x += x
        total_y += y
        count += 1
    if count == 0:
        raise ValueError("centroid requires at least one point")
    return Fraction(total_x, count), Fraction(total_y, count)


def bounding_box_center(points):
    points = iter(points)
    try:
        first_x, first_y = next(points)
    except StopIteration:
        raise ValueError("bounding box requires at least one point") from None
    min_x = max_x = first_x
    min_y = max_y = first_y
    for x, y in points:
        min_x = min(min_x, x)
        max_x = max(max_x, x)
        min_y = min(min_y, y)
        max_y = max(max_y, y)
    return Fraction(min_x + max_x, 2), Fraction(min_y + max_y, 2)


sample = [(0, 0), (2, 2), (8, 2)]
assert midpoint(sample[0], sample[2]) == (4, 1)
assert centroid(sample) == (Fraction(10, 3), Fraction(4, 3))
assert bounding_box_center(sample) == (4, 1)
assert centroid([(3, -5)]) == (3, -5)
assert bounding_box_center([(3, -5)]) == (3, -5)
assert midpoint((0, 0), (1, 1)) == (Fraction(1, 2), Fraction(1, 2))
assert centroid([(0, 0), (0, 0), (6, 0)]) == (2, 0)
assert bounding_box_center([(0, 0), (0, 0), (6, 0)]) == (3, 0)
assert centroid(iter(sample)) == centroid(sample)
assert sample == [(0, 0), (2, 2), (8, 2)]
```

Each function needs its own iterator if the input is generated lazily. Calling both functions on the same exhausted iterator makes the second call see empty input.

## Walkthrough and Correctness

For the sample above, the centroid scan maintains `(total_x, total_y, count)`:

- After `(0, 0)`: `(0, 0, 1)`.
- After `(2, 2)`: `(2, 2, 2)`.
- After `(8, 2)`: `(10, 4, 3)`.

After each iteration, the totals equal the coordinate sums of all points seen so far. Dividing the final sums by the final count therefore gives the mean in each coordinate.

The bounding-box scan instead maintains `(min_x, max_x, min_y, max_y)`. For this input it ends at `(0, 8, 0, 2)`. Each update preserves the extremes of the points seen so far, so the final rectangle is the smallest axis-aligned enclosure. Taking the midpoint of each pair of opposite bounds gives its center, `(4, 1)`. That point need not be one of the input points.

## Clarify the Distance Model

Another hidden ambiguity is the distance function.

- To minimize the sum of squared Euclidean distances over all possible centers, use the centroid. For one coordinate, the sum of squared deviations from any candidate equals the sum around the mean plus `N` times the squared distance from that mean; it is minimized at the mean.
- To minimize the sum of ordinary Euclidean distances, the task asks for a geometric median, which is generally different from the centroid.
- To minimize total Manhattan distance in one dimension, use a median. In two dimensions, choose a median independently for each coordinate when any center is allowed. With an even count, any value between the two middle values minimizes the corresponding one-dimensional sum.
- If the task requires a center chosen from the input points, the answer may be different again.

That is why the best interview answer is not only a formula, but also a short clarification about what "center" means in the problem statement.

## Numerical and Edge Cases

- Empty input needs an explicit contract; the iterable functions above raise `ValueError`.
- One point is its own center.
- Integer coordinates may produce fractional centers.
- Large coordinates can overflow fixed-width integer arithmetic if you sum before casting.

Floating-point output can be appropriate when an error tolerance is specified; it does not guarantee exactness. The examples above keep exact rational results for integer input. A floating-point implementation would need its own rounding and finite-value contract.

## Complexity

Midpoint of two points runs in `O(1)` time.

Centroid and bounding-box center for `N` two-dimensional points both use `O(N)` arithmetic operations and a constant number of accumulators. They do not store a copy of the input.

These bounds use the usual unit-cost arithmetic model. Python's arbitrary-size integers and `Fraction` reduction have costs that grow with operand bit length, so the exact implementation does not promise constant byte storage or constant-time arithmetic for unbounded coordinates. In `D` dimensions, the scans require `O(ND)` arithmetic operations and `O(D)` accumulators.

## Interview Follow-Up

Good follow-up questions include:

- Do we need the exact geometric center or just a representative point?
- Can the answer be outside the original set of points?
- Are coordinates integers, floats, or very large values?
- Which distance metric defines the best center?

The main skill is not memorizing one formula. It is recognizing that "center point" is underspecified until you tie it to a concrete geometric rule.
