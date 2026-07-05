---
title: "Rectangles Store: Fast Point Queries Over Overlapping Rectangles"
source_url: "http://www.interviewbits.com:80/blog/2014/12/18/rectangles-store/"
source_path: "/blog/2014/12/18/rectangles-store/"
wayback_snapshot: "https://web.archive.org/web/20141228193350/http://www.interviewbits.com:80/blog/2014/12/18/rectangles-store/"
evidence_tier: "Gold"
topic: "algorithm-interview"
rewrite_status: "rewritten"
---

# Rectangles Store: Fast Point Queries Over Overlapping Rectangles

This problem asks you to design a rectangle lookup structure that is efficient both in memory and query time. That combination is what makes it a good interview question: you cannot get away with either a brute-force scan or a giant point-by-point grid.

## Problem

You are given:

- one large bounding rectangle
- many rectangles contained inside that bounding rectangle

You need to support two operations:

1. initialize the data structure from the bounding box and the rectangle collection
2. answer `findRectangleAt(x, y)` by returning the topmost rectangle that contains the point, or `null` if none does

The tricky part is the scale. The input may contain many rectangles, and the bounding box may be extremely large.

## Why the Obvious Solutions Fail

Two simple ideas are ruled out:

- Storing the rectangles in a plain list makes each query too slow because you may need to scan every rectangle.
- Mapping every point in the bounding box to a rectangle uses far too much memory when coordinates are large.

So the real task is to index rectangle boundaries in a way that narrows the candidate set quickly.

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

## Query Strategy

For a query point `(x, y)`, compute four candidate sets:

- rectangles whose left edge is at or before `x`
- rectangles whose right edge is at or after `x`
- rectangles whose top edge is at or above `y`
- rectangles whose bottom edge is at or below `y`

Any rectangle containing `(x, y)` must appear in all four sets.

So the answer is the first rectangle id that appears in every set, using the ordering rule that matches "topmost" in the problem definition.

## Why This Works

Instead of asking every rectangle whether it contains the point, we first rule out most rectangles using sorted boundary indexes.

That gives us:

- good memory behavior because we store only rectangle boundaries
- faster point queries because each filter removes impossible candidates early

The exact implementation can use balanced trees, sorted arrays with binary search, or interval-oriented structures. What matters in an interview is the reduction from geometric containment to four one-dimensional filters.

## Complexity Discussion

If there are `N` rectangles:

- initialization is roughly `O(N log N)` if you insert all four edges into sorted structures
- query time depends on how the candidate intersections are implemented

The archived solution uses sorted sets plus list intersection checks. That is conceptually sound, though there is still room to improve the query path with more specialized indexing if the interviewer wants stronger asymptotics.

## Edge Cases

- A query point may be outside the bounding box.
- Multiple rectangles may overlap the same point.
- Rectangles may share edges.
- The topmost rectangle rule needs a deterministic interpretation.

Clarifying that last point is important. If "topmost" means smallest top coordinate, highest z-index, or most recently inserted rectangle, the data structure may need different tie-breaking.

## Interview Follow-Up

Good follow-up questions include:

- How many queries will we run after initialization?
- Are rectangles static, or do insertions and deletions happen later?
- What exactly defines the topmost rectangle?
- Do we need worst-case guarantees or just practical speed?

The strongest answer is not just "use a TreeSet." It is showing that point containment can be decomposed into four ordered constraints and that a sparse index is better than a dense grid for large coordinate spaces.
