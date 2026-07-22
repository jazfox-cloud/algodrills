---
title: "Insert Interval: Merging a New Range Into Sorted Intervals"
description: "Insert a new interval into a sorted non-overlapping list, merge overlaps in one scan, and review complexity, boundary cases, and implementation."
source_url: "http://www.interviewbits.com:80/blog/2014/11/29/insert/"
source_path: "/blog/2014/11/29/insert/"
wayback_snapshot: "https://web.archive.org/web/20141228212345/http://www.interviewbits.com:80/blog/2014/11/29/insert/"
evidence_tier: "Gold"
topic: "algorithm-interview"
rewrite_status: "rewritten"
---

# Insert Interval: Merging a New Range Into Sorted Intervals

The insert interval problem asks you to place a new interval into an existing sorted list of non-overlapping intervals, then merge anything that overlaps. It is a common interview problem because it tests whether you can reason about ordered ranges without overcomplicating the scan.

## Problem

Given a list of intervals sorted by start time, and a new interval, return a new list where the new interval has been inserted and all overlapping intervals have been merged.

For example, inserting `[4, 8]` into:

```text
[[1, 2], [3, 5], [6, 7], [9, 10]]
```

should produce:

```text
[[1, 2], [3, 8], [9, 10]]
```

## Core Idea

Because the input is already sorted, you do not need to sort again. A single linear pass is enough.

There are three phases:

- Add intervals that end before the new interval starts.
- Merge every interval that overlaps the new interval.
- Add intervals that start after the merged interval ends.

## Algorithm Steps

- Create an empty result list.
- Add every interval whose end is less than the new interval's start.
- While intervals overlap the new interval, update the new interval's start and end.
- Add the merged new interval.
- Append all remaining intervals.

## Edge Cases

- The new interval belongs at the beginning.
- The new interval belongs at the end.
- The new interval overlaps every existing interval.
- The input interval list is empty.

## Complexity

The time complexity is `O(N)` because each interval is inspected once.

The space complexity is `O(N)` for the output list.
