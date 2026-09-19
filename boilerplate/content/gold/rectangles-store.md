---
title: "Rectangles Store: Fast Point Queries Over Overlapping Rectangles"
seo_title: "Rectangle Store: Fast Point Queries"
description: "Design a rectangle store for fast point queries using candidate filtering and spatial indexing, with overlap, boundary, and complexity considerations."
source_url: "http://www.interviewbits.com:80/blog/2014/12/18/rectangles-store/"
source_path: "/blog/2014/12/18/rectangles-store/"
wayback_snapshot: "https://web.archive.org/web/20141228193350/http://www.interviewbits.com:80/blog/2014/12/18/rectangles-store/"
evidence_tier: "Gold"
topic: "algorithm-interview"
rewrite_status: "rewritten"
---

# Rectangles Store: Fast Point Queries Over Overlapping Rectangles

This problem asks you to design a rectangle lookup structure that is efficient both in memory and query time. A brute-force scan is a useful correctness baseline; a boundary index can reduce the candidates without allocating a giant point-by-point grid. It does not automatically guarantee sublinear queries.

In practice, this is the kind of prompt where interviewers care less about naming a specific data structure and more about whether you can turn a two-dimensional geometry question into a small number of ordered one-dimensional checks. That is the main idea to make explicit.

## Problem

You are given:

- one large bounding rectangle
- many rectangles contained inside that bounding rectangle

You need to support two operations:

1. initialize the data structure from the bounding box and the rectangle collection
2. answer `findRectangleAt(x, y)` by returning the topmost rectangle that contains the point, or `null` if none does

The tricky part is the scale. The input may contain many rectangles, and the bounding box may be extremely large.

## What a Strong Answer Should Clarify First

Before choosing a data structure, pin down the contract:

- Are rectangles static after initialization, or can they be inserted and removed later?
- What does "topmost" mean when several rectangles contain the same point?
- Are rectangle edges inclusive?
- Are coordinates integers, floating-point values, or both?

Those details change the best implementation. If updates are rare and queries are frequent, preprocessing is worth more. If updates happen constantly, a heavier dynamic index may be justified.

## Contract for the Python Example

The implementation below makes explicit choices for this tutorial; these are not additional claims about the archived prompt:

- Rectangles are static after construction. Rebuild the store to change them.
- Each rectangle is `(id, left, right, top, bottom)` with a unique string id and integer coordinates. The caller supplies valid rectangles: `left <= right`, `top <= bottom`, all contained in the bounding box.
- Bounds are `(left, right, top, bottom)`, with the same coordinate convention. Larger y values point downward.
- Edges are inclusive. Zero-width and zero-height rectangles are allowed.
- Input order is the layer order, from back to front. The last containing rectangle wins, regardless of its area or top coordinate.
- Empty stores, uncovered points, and points outside the bounding box return `None`.

These are input preconditions, not a validation API. A production interface can validate them once at construction.

## Baseline and Memory Tradeoff

A reverse scan of the input finds the topmost containing rectangle in `O(N)` time with no index. Keep that version as a reference for testing. Mapping every point in the bounding box to a rectangle, however, uses memory proportional to coordinate area, which is unsuitable for huge coordinates.

Boundary indexes use memory proportional to the number of rectangles. They help when at least one boundary filter is selective; heavy overlap can still force a linear query.

## Baseline Answer

The baseline interview answer is usually:

1. preprocess rectangle boundaries into sorted structures
2. narrow the candidates for `x`
3. narrow the candidates for `y`
4. intersect the survivors
5. apply the tie-break rule for the topmost rectangle

The key follow-up is how many candidates survive each filter. Binary search finds a cutoff quickly, but processing the candidates still costs time.

## Core Idea

A point `(x, y)` lies inside a rectangle exactly when all four of these conditions hold:

- `left <= x`
- `right >= x`
- `top <= y`
- `bottom >= y`

That means we can index rectangle edges rather than every covered point.

One clean approach is to maintain four sorted collections:

- rectangle left edges
- rectangle right edges
- rectangle top edges
- rectangle bottom edges

Each entry stores both the edge value and the rectangle id.

If you want to describe this in implementation-neutral terms, say "four sorted indexes keyed by boundary value." That leaves room for `TreeSet`, balanced trees, sorted arrays plus binary search, or an interval tree variant depending on the language and follow-up constraints.

## Query Strategy

For a query point `(x, y)`, compute four candidate sets:

- rectangles whose left edge is at or before `x`
- rectangles whose right edge is at or after `x`
- rectangles whose top edge is at or above `y`
- rectangles whose bottom edge is at or below `y`

Any rectangle containing `(x, y)` must appear in all four sets.

Take the highest-layer id in the intersection. Iteration order in a set is not a substitute for the layer rule.

We can avoid materializing four sets: find all four cutoff ranges, scan the smallest range, and check all four inequalities directly for each candidate. Every containing rectangle must occur in that range, so this produces the same answer.

## Runnable Python Implementation

The store copies the input into tuples and maintains four arrays of rectangle indexes, one per sorted boundary. Separate edge-value arrays make the binary searches explicit. The stored arrays are internal state and should not be mutated by callers.

```python
from bisect import bisect_left, bisect_right


class RectangleStore:
    def __init__(self, bounds, rectangles):
        self.bounds = tuple(bounds)
        self.rectangles = tuple(tuple(r) for r in rectangles)
        n = len(self.rectangles)
        self.orders = []
        self.edges = []
        for field in (1, 2, 3, 4):  # left, right, top, bottom
            order = sorted(range(n), key=lambda i: self.rectangles[i][field])
            self.orders.append(order)
            self.edges.append([self.rectangles[i][field] for i in order])

    def find_rectangle_at(self, x, y):
        left, right, top, bottom = self.bounds
        if not (left <= x <= right and top <= y <= bottom):
            return None

        n = len(self.rectangles)
        ranges = (
            (0, bisect_right(self.edges[0], x)),  # left <= x
            (bisect_left(self.edges[1], x), n),  # right >= x
            (0, bisect_right(self.edges[2], y)),  # top <= y
            (bisect_left(self.edges[3], y), n),  # bottom >= y
        )
        axis = min(range(4), key=lambda j: ranges[j][1] - ranges[j][0])
        start, stop = ranges[axis]
        best = -1
        for position in range(start, stop):
            i = self.orders[axis][position]
            _, left, right, top, bottom = self.rectangles[i]
            if left <= x <= right and top <= y <= bottom:
                best = max(best, i)
        return None if best == -1 else self.rectangles[best][0]


store = RectangleStore((0, 10, 0, 10), [
    ("R1", 0, 8, 0, 8),
    ("R2", 2, 5, 2, 6),
    ("R3", 4, 7, 1, 4),
])
assert store.find_rectangle_at(4, 3) == "R3"
assert store.find_rectangle_at(2, 6) == "R2"  # inclusive corner
assert store.find_rectangle_at(8, 8) == "R1"
assert store.find_rectangle_at(9, 9) is None
assert store.find_rectangle_at(-1, 3) is None
assert RectangleStore((0, 10, 0, 10), []).find_rectangle_at(0, 0) is None

point_store = RectangleStore((0, 10, 0, 10), [
    ("back", 0, 10, 0, 10),
    ("front", 0, 10, 0, 10),
    ("point", 5, 5, 5, 5),
])
assert point_store.find_rectangle_at(5, 5) == "point"
assert point_store.find_rectangle_at(5, 6) == "front"
```

Use `bisect_right` for the `<=` prefixes and `bisect_left` for the `>=` suffixes. That distinction includes every rectangle tied at a boundary. The loop uses index positions rather than a slice, so queries do not copy the candidate range.

## Worked Example

Suppose the rectangles are:

- `R1 = [left=0, right=8, top=0, bottom=8]`
- `R2 = [left=2, right=5, top=2, bottom=6]`
- `R3 = [left=4, right=7, top=1, bottom=4]`

For query point `(4, 3)`:

- left-edge filter keeps `R1`, `R2`, `R3`
- right-edge filter keeps `R1`, `R2`, `R3`
- top-edge filter keeps `R1`, `R2`, `R3`
- bottom-edge filter keeps `R1`, `R2`, `R3`

All four candidate ranges have size three. The implementation chooses the first tied range, the left-edge index, and checks `R1`, `R2`, then `R3`. Their input indexes are `0`, `1`, and `2`; all contain the point, so `best` ends at `2` and the answer is `R3`.

For `(2, 6)`, the left-edge prefix contains only `R1` and `R2`. Both contain the point, including the corner of `R2`, and index `1` wins. For `(9, 9)`, the right-edge suffix is empty, so the answer is `None` without scanning any rectangle.

If an interviewer instead defines topmost by smallest top coordinate or an explicit z-index, change the winner comparison. Do not silently reuse input order.

## Why This Works

Every rectangle containing `(x, y)` satisfies all four inequalities, so it belongs to every candidate range, including the smallest one. Scanning that range cannot miss a valid answer. Checking all four inequalities removes candidates that satisfy only the chosen boundary condition.

During the scan, `best` is the largest input index among containing rectangles examined so far, or `-1` if none have matched. Updating it with `max(best, i)` preserves that invariant. At the end, it identifies the topmost containing rectangle under the stated layer contract.

## When Sorted Arrays Are Good Enough

If rectangles are built once and queried many times, sorted arrays are often the simplest practical answer:

- preprocessing is straightforward
- binary search is easy to explain
- memory usage is predictable
- there is no tree-rotation or balancing complexity

For a whiteboard or interview setting, that tradeoff is often better than reaching immediately for a more complex dynamic structure.

## When You Should Suggest a Stronger Structure

If the interviewer adds frequent updates or much larger query volume, say so explicitly and upgrade the design:

- interval trees if containment checks dominate
- segment trees or range trees for more structured spatial filtering
- R-trees or spatial indexes if the discussion moves from interview exercise toward production geometry workloads

That kind of answer shows judgment: you are not pretending one structure is always best.

## Complexity Discussion

For this implementation, let `N` be the number of rectangles and `K` the size of the smallest of the four candidate ranges:

- Construction takes `O(N log N)` time for four sorts and `O(N)` storage for the copied rectangles, indexes, and edge values.
- An in-bounds query takes `O(log N + K)` time: four binary searches followed by `K` constant-size containment checks. Empty stores take `O(1)` time.
- Query auxiliary space is `O(1)`. No candidate lists or intersections are allocated, and the result is one id or `None`.
- An outside-bounds query takes `O(1)` time.
- Worst-case query time is `O(N)`, because `K` can equal `N`. For example, all rectangles may contain the queried point. Small final result size does not imply a small candidate range.

These bounds use the usual unit-cost model for coordinate comparisons. Python integers support large coordinates, though arithmetic and comparison costs grow with their bit length.

The four-set intersection version can also require linear temporary space. A stricter query guarantee needs a specified spatial data structure and its own analysis; naming an interval tree or R-tree alone does not prove logarithmic topmost queries.

## Edge Cases

- A query point may be outside the bounding box.
- Multiple rectangles may overlap the same point.
- Rectangles may share edges.
- The topmost rectangle rule needs a deterministic interpretation.
- Degenerate rectangles may have zero width or zero height.
- Coordinate comparisons may become tricky if floating-point inputs are allowed.

The executable assertions cover empty input, overlap, identical rectangles, an inclusive corner, a zero-area rectangle, an uncovered point, and an outside point. For broader testing, compare the indexed result with a reverse linear scan over many generated valid rectangle collections and query points. Float and tolerance policies are outside this example's integer contract.

## Common Mistakes

- Building a dense coordinate map for a huge bounding box
- Forgetting to define whether boundary points count as inside
- Returning the first matching rectangle without a stable tie-break rule
- Optimizing search while ignoring the cost of intersecting large candidate sets
- Assuming a dynamic structure is needed before the prompt actually asks for updates

## Interview-Ready Explanation

If you need a concise verbal answer, this is a good version:

> I would first define containment and layer order, then use a reverse scan as a correctness baseline. For static rectangles, four sorted boundary indexes let me find the smallest candidate range with binary search. I scan that range, check full containment, and return the highest layer. This costs O(log N + K) per query with constant query space, but remains O(N) in the worst case. If that bound is insufficient, we need a stronger spatial index chosen for the required operations.

That explanation is usually enough to show both the core insight and the tradeoff thinking.

## Interview Follow-Up

Good follow-up questions include:

- How many queries will we run after initialization?
- Are rectangles static, or do insertions and deletions happen later?
- What exactly defines the topmost rectangle?
- Do we need worst-case guarantees or just practical speed?

The strongest answer is not just "use a TreeSet." It is showing that point containment can be decomposed into four ordered constraints and that a sparse index is better than a dense grid for large coordinate spaces.

## Final Takeaway

This problem is really about choosing the right abstraction. Rectangles look two-dimensional, but point containment reduces cleanly to four ordered comparisons. Once you state that reduction clearly, the rest of the answer becomes an informed tradeoff between simpler static indexes and heavier dynamic spatial structures.
