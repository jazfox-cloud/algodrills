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

A car can be the fastest right now and still be behind. Before choosing a heap or a tree, define whether the leaderboard ranks current speed or accumulated distance.

This guide uses the archived car-race topic as its starting point. The precise timing, tie-breaking, and callback rules below are explicit choices for this implementation, not claims about details recovered from the snapshot.

## Two Different Leaderboards

For a speed leaderboard, the score changes only when a car receives a speed update. A map plus an ordered structure can maintain the maximum speed efficiently.

For a distance leaderboard, every moving car's position changes with time. A faster car can overtake the leader between speed updates. Updating only one key in a heap of old distances does not keep that heap correctly ordered.

The implementation below answers the distance version at explicit observation times. It gives a correct baseline before considering more advanced event scheduling.

## Contract: Observe the Race at a Given Time

- Cars have unique string IDs and begin at position zero at time zero. The initial mapping contains nonnegative integer speeds and a fixed set of cars.
- Times are nonnegative integers, shared by all cars. Calls must use nondecreasing times; multiple calls at the same time are processed in call order.
- `update(car_id, speed, t)` changes a known car's speed at time `t`. Its old speed applies up to `t`; its new speed applies afterward. New speeds are nonnegative integers.
- `leader(t)` returns the ID with the greatest distance at time `t`. Equal distances are resolved by the lexicographically smallest ID. An empty race returns `None`.
- Both operations observe the leaderboard. A synchronous callback receives `(leader_id, t)` on the first nonempty observation and whenever the observed leader ID changes. An unchanged leader produces no callback.
- The callback must return normally and must not call back into the race object. Input types and nonnegative speeds are caller preconditions; decreasing times and unknown update IDs are rejected.

This is an observation-based notification contract. It does not promise a callback at every physical overtaking instant between calls. At a speed-update timestamp, changing speed alone cannot change position.

## Runnable Python Baseline

For each car, store its distance at its most recent speed update, its speed, and that update's timestamp. Its position at a later time is:

```text
position(t) = saved_distance + speed * (t - saved_time)
```

Only the updated car needs its saved state advanced. A leader query evaluates every car at the same time.

```python
class DistanceRace:
    def __init__(self, speeds, on_change):
        self.cars = {
            car_id: (0, speed, 0)
            for car_id, speed in speeds.items()
        }
        self.on_change = on_change
        self.last_time = 0
        self.last_leader = None

    def _check_time(self, t):
        if t < self.last_time:
            raise ValueError("timestamps must be nondecreasing")

    def leader(self, t):
        self._check_time(t)
        self.last_time = t
        best_id = None
        best_position = None
        for car_id, (distance, speed, saved_time) in self.cars.items():
            position = distance + speed * (t - saved_time)
            if (best_id is None or position > best_position
                    or (position == best_position and car_id < best_id)):
                best_id = car_id
                best_position = position
        if best_id != self.last_leader:
            self.last_leader = best_id
            self.on_change(best_id, t)
        return best_id

    def update(self, car_id, speed, t):
        self._check_time(t)
        distance, old_speed, saved_time = self.cars[car_id]
        distance += old_speed * (t - saved_time)
        self.cars[car_id] = (distance, speed, t)
        return self.leader(t)
```

Python integers keep the integer-time examples exact. With fractional measurements, specify the numeric representation and tie policy before adapting the implementation.

## Worked Example: Overtaking Without an Update

Car A starts at speed 10 and B at speed 4. At time 2, their distances are 20 and 8. A then slows to speed 1.

- At time 2, A is still ahead: changing speed does not erase its lead.
- At time 5, A is at 23 and B is at 20. B is faster, but A leads.
- At time 6, both are at 24. The tie rule selects A.
- At time 7, A is at 25 and B is at 28. B leads even though no new speed update occurred.

```python
events = []
race = DistanceRace({"A": 10, "B": 4},
                    lambda car_id, t: events.append((car_id, t)))
assert race.leader(0) == "A"
assert race.update("A", 1, 2) == "A"
assert race.leader(5) == "A"
assert race.leader(6) == "A"
assert race.leader(7) == "B"
assert race.leader(7) == "B"  # No duplicate notification.
assert events == [("A", 0), ("B", 7)]
```

The callback at time 7 reports the newly observed leader. It does not claim that the physical overtake happened exactly at time 7.

## Why the Baseline Is Correct

The stored distance for each car is its true distance at its saved timestamp. Initially, that distance is zero. On an update, the old speed has remained constant since the saved timestamp, so adding `old_speed * elapsed_time` preserves this invariant before installing the new speed.

A query uses that same invariant to compute every car's true position at the requested time. Scanning all positions and applying the ID tie rule therefore returns the specified leader. Comparing that ID with the previous observed leader implements exactly the notification contract.

## Boundary Checks

```python
empty_events = []
empty = DistanceRace({}, lambda car_id, t: empty_events.append((car_id, t)))
assert empty.leader(0) is None
assert empty_events == []

still_events = []
still = DistanceRace({"B": 0, "A": 0},
                     lambda car_id, t: still_events.append((car_id, t)))
assert still.leader(0) == "A"  # ID order, not dictionary order.
assert still.update("B", 3, 0) == "A"  # Same-time position is unchanged.
assert still.leader(1) == "B"
assert still_events == [("A", 0), ("B", 1)]

try:
    still.leader(0)
except ValueError:
    pass
else:
    raise AssertionError("backward time must be rejected")

try:
    still.update("missing", 1, 1)
except KeyError:
    pass
else:
    raise AssertionError("unknown car must be rejected")
```

Also test a single car, repeated speed changes, long idle intervals, and large integer distances. A useful independent reference advances every car on every event and compares both leader IDs and callback histories with this lazy-position implementation.

## Complexity and the Speed-Only Optimization

For `N` cars, initialization takes `O(N)` time and storage. A distance query takes `O(N)` time and `O(1)` auxiliary space. An update changes one saved state in `O(1)` expected time, then scans for the callback, so the complete update operation is `O(N)`. These bounds treat arithmetic, ID comparisons, and callbacks as constant-cost operations; callback work is otherwise additional.

If the requirement is explicitly highest current speed, a balanced tree keyed by `(-speed, car_id)` supports removing the old key and inserting the new one in `O(log N)` time with `O(N)` storage. Reading the winner costs `O(1)` with a cached minimum, or `O(log N)` with a tree lookup.

A lazy heap is another speed-only option, but stale entries require care. Keep a current version per car and discard obsolete versions at the top. Without rebuilding, `U` updates can leave `O(N + U)` entries; one query may remove many stale entries. Do not claim worst-case `O(log N)` per call or `O(N)` storage for that implementation without additional bounds or compaction.

For distance leaders, a static heap of saved positions is insufficient. Continuous overtake notifications require reasoning about future crossings, invalidating predictions when speeds change, and specifying ties at crossing times. That is a separate extension, not a consequence of replacing the speed key with a distance key.
