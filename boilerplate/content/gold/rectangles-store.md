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

This problem asks you to design a rectangle lookup structure that is efficient both in memory and query time. That combination is what makes it a good interview question: you cannot get away with either a brute-force scan or a giant point-by-point grid.

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

## Why the Obvious Solutions Fail

Two simple ideas are ruled out:

- Storing the rectangles in a plain list makes each query too slow because you may need to scan every rectangle.
- Mapping every point in the bounding box to a rectangle uses far too much memory when coordinates are large.

So the real task is to index rectangle boundaries in a way that narrows the candidate set quickly.

## Baseline Answer

The baseline interview answer is usually:

1. preprocess rectangle boundaries into sorted structures
2. narrow the candidates for `x`
3. narrow the candidates for `y`
4. intersect the survivors
5. apply the tie-break rule for the topmost rectangle

That answer is already much stronger than suggesting a full grid or a linear scan over every rectangle on every query.

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

So the answer is the first rectangle id that appears in every set, using the ordering rule that matches "topmost" in the problem definition.

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

All three rectangles contain the point, so geometry alone is not enough. You still need a tie-break rule. For example:

- highest visual layer
- smallest area
- most recently inserted rectangle
- smallest top coordinate, if "topmost" is geometric

That is why the definition of "topmost" must be clarified early.

## Why This Works

Instead of asking every rectangle whether it contains the point, we first rule out most rectangles using sorted boundary indexes.

That gives us:

- good memory behavior because we store only rectangle boundaries
- faster point queries because each filter removes impossible candidates early

The exact implementation can use balanced trees, sorted arrays with binary search, or interval-oriented structures. What matters in an interview is the reduction from geometric containment to four one-dimensional filters.

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

If there are `N` rectangles:

- initialization is roughly `O(N log N)` if you insert all four edges into sorted structures
- query time depends on how the candidate intersections are implemented

The archived solution uses sorted sets plus list intersection checks. That is conceptually sound, though there is still room to improve the query path with more specialized indexing if the interviewer wants stronger asymptotics.

Another useful refinement is to store candidate ids in compact integer sets so intersections are cheaper. The main performance question is not only "how fast is search?" but also "how large are the intermediate candidate lists?"

## Edge Cases

- A query point may be outside the bounding box.
- Multiple rectangles may overlap the same point.
- Rectangles may share edges.
- The topmost rectangle rule needs a deterministic interpretation.
- Degenerate rectangles may have zero width or zero height.
- Coordinate comparisons may become tricky if floating-point inputs are allowed.

Clarifying that last point is important. If "topmost" means smallest top coordinate, highest z-index, or most recently inserted rectangle, the data structure may need different tie-breaking.

## Common Mistakes

- Building a dense coordinate map for a huge bounding box
- Forgetting to define whether boundary points count as inside
- Returning the first matching rectangle without a stable tie-break rule
- Optimizing search while ignoring the cost of intersecting large candidate sets
- Assuming a dynamic structure is needed before the prompt actually asks for updates

## Interview-Ready Explanation

If you need a concise verbal answer, this is a good version:

> I would avoid a point-by-point grid because the bounding box can be huge, and I would avoid scanning every rectangle per query because that makes queries linear. Instead, I would preprocess rectangle boundaries into sorted indexes, use the query point to filter rectangles on left, right, top, and bottom constraints, intersect those candidate sets, and then apply a deterministic topmost rule. If rectangles are static, sorted arrays plus binary search are probably the simplest strong answer. If updates are frequent, I would switch to a more dynamic interval-oriented structure.

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
