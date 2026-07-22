---
title: "Car Race Leaderboard: Tracking the Fastest Car on a Linear Track"
seo_title: "Car Race Leaderboard on a Linear Track"
description: "Model a linear car race as ordered events, update positions when speeds change, and track the current leader without simulating every instant."
source_url: "http://www.interviewbits.com:80/blog/2014/12/03/car_race/"
source_path: "/blog/2014/12/03/car_race/"
wayback_snapshot: "https://web.archive.org/web/20141228193216/http://www.interviewbits.com:80/blog/2014/12/03/car_race/"
evidence_tier: "Gold"
topic: "algorithm-interview"
rewrite_status: "rewritten"
---

# Car Race Leaderboard: Tracking the Fastest Car on a Linear Track

This interview problem combines event processing with ordered ranking. The archived page described a race on a straight track where cars receive speed updates over time, and the system needs to identify the current winner as the race evolves.

## Problem

You manage a set of cars moving on a one-dimensional track.

The interface exposes an operation like:

```text
update(car_id, speed)
```

Each update changes the current speed of one car. After processing updates, the system should be able to determine which car is winning and notify a callback when the leader changes.

That sounds simple until you think about scale:

- updates may arrive frequently
- many cars may be active at once
- the leader can change often

The real interview question is how to maintain the ranking efficiently without rescanning every car after each event.

## What State Do You Need?

At minimum, track two things:

- the latest speed for each `car_id`
- a structure that can tell you which car currently has the best race position

If the problem treats higher speed as "ahead right now," then a max-oriented structure over speeds is enough. If it models elapsed time and accumulated distance, then each car also needs enough information to compute its current position when queried.

Because the archived description focused on a winner callback tied to updates, the useful preparation angle is the incremental-ranking design rather than one specific physics model.

## Baseline Solution

The brute-force design is:

- store the latest speed for every car in a hash map
- on every `update`, rewrite that car's speed
- scan all cars to find the maximum

This is easy to implement but too slow when the number of updates is large. If there are `N` cars, each update becomes `O(N)`.

## Better Approach: Ordered Leader Tracking

A stronger solution keeps cars in an ordered structure keyed by the value that defines "leading."

Examples include:

- a balanced tree keyed by `(score, car_id)`
- a max-heap with lazy deletion
- a sorted set if the language provides one

Then each `update(car_id, speed)` works like this:

- remove the old ranking record for that car, if it exists
- write the new speed into the hash map
- insert the updated ranking record
- compare the new maximum with the previous leader
- trigger the callback only if the leader actually changed

This turns repeated full scans into efficient incremental maintenance.

## Why a Hash Map Alone Is Not Enough

A hash map is excellent for locating a car by id, but it does not preserve ordering. You still need a second structure for "who is first right now?"

That separation is a common interview pattern:

- hash map for direct access
- heap or tree for ordered queries

Once you recognize that split, the design becomes much cleaner.

## Handling Ties

Interviews often hide complexity in tie behavior. Ask clarifying questions such as:

- If two cars have the same speed, which one wins?
- Does earlier arrival break the tie?
- Should the callback fire if the leader id stays the same but another car matches it?

A deterministic rule like `(speed desc, car_id asc)` is usually enough unless the interviewer defines something else.

## If Distance Matters

Some variants care about actual position rather than just instantaneous speed. In that version, a car's distance depends on:

- its last known speed
- the time since its previous update

Then each `update` must first advance that car's accumulated distance before changing speed. The ordered key becomes current distance, not just speed.

That follow-up is valuable because it shows you can extend the data model instead of hardcoding the simplest interpretation.

## Complexity

With a hash map plus an ordered structure:

- lookup/update by id is `O(log N)` if removal and reinsertion are needed
- leader query is `O(1)` or `O(log N)`, depending on the structure
- memory usage is `O(N)`

That is a clear improvement over rescanning the entire field after every speed change.

## What the Interviewer Is Really Testing

This problem is less about racing and more about maintaining a dynamic maximum under frequent updates.

The key ideas are:

- separate identity lookup from ranking lookup
- update only the affected record
- fire downstream notifications only on meaningful state changes

If you explain the brute-force method first and then evolve it into a map-plus-ordered-structure design, you will usually cover both correctness and scalability well.
