---
title: "Log Every Second: Scheduling Repeated Output Without Blocking"
seo_title: "Log Every Second Without Blocking"
description: "Compare blocking and timer-based ways to emit one value per second, including scheduling drift, cancellation, completion, and testing concerns."
source_url: "http://www.interviewbits.com:80/blog/2014/12/02/log-every-second/"
source_path: "/blog/2014/12/02/log-every-second/"
wayback_snapshot: "https://web.archive.org/web/20141228212406/http://www.interviewbits.com:80/blog/2014/12/02/log-every-second/"
evidence_tier: "Gold"
topic: "algorithm-interview"
rewrite_status: "rewritten"
---

# Log Every Second: Scheduling Repeated Output Without Blocking

Given an array, emit its values in order with a one-second delay between completed outputs. The interview challenge is managing the next index and the timer without blocking the event loop.

## Define the Timing Contract First

Accept a fixed array and a synchronous, non-throwing output function. Do not mutate the array while it runs. The default output function is `console.log`.

- Schedule the first value after 1,000 milliseconds, not immediately.
- Schedule each later value 1,000 milliseconds after the previous output function returns.
- Empty input produces no output and creates no timer.
- Completion leaves no pending timer after the last output.
- The returned cancellation function stops future outputs and is safe to call repeatedly. It cannot interrupt an output already executing.

These are requested delays, not exact real-time guarantees. Other event-loop work can delay a callback. This is a fixed-delay solution; it does not catch up to a wall-clock schedule.

## Runnable JavaScript

Run this function in Node.js or a browser console:

```javascript
function logEverySecond(values, emit = console.log) {
  let index = 0;
  let timer = null;
  let cancelled = false;

  function tick() {
    timer = null;
    if (cancelled) return;
    emit(values[index]);
    index += 1;
    if (!cancelled && index < values.length) {
      timer = setTimeout(tick, 1000);
    }
  }

  if (values.length > 0) {
    timer = setTimeout(tick, 1000);
  }

  return function cancel() {
    cancelled = true;
    clearTimeout(timer);
    timer = null;
  };
}
```

Call it with a sequence:

```javascript
const cancel = logEverySecond([10, 20, 30]);
// Expected output: 10, then 20, then 30.
// Call cancel() to stop future outputs.
```

The function returns the cancellation handle immediately. It does not wait for completion or return a completion Promise. Empty input returns a harmless cancellation function.

## Trace the Sequence

For `[10, 20, 30]`, assuming negligible output work and no scheduling delays:

1. At time zero, the index is zero and one timeout is pending. Nothing is printed yet.
2. Around one second, emit `10`, advance the index, and schedule the next timeout.
3. Around two seconds, emit `20`, advance the index, and schedule the next timeout.
4. Around three seconds, emit `30`. The index equals the array length, so no new timer is created.

Cancellation after the first output but before the second callback prevents the remaining outputs. If `emit` calls the cancellation handle itself, the check after `emit` prevents another timer from being scheduled.

## Why It Works

Before each active callback, the index identifies the next unprinted value, and exactly the preceding values have been emitted in order. Each callback emits one value and advances once. Another callback is scheduled only while a value remains and cancellation has not occurred. Thus every value is emitted once in order unless cancelled.

The empty-input guard is essential: blindly reading the first element would emit `undefined` for an empty array. The guard also avoids creating a timer that has nothing to do.

Only one timeout is pending at a time. Each callback returns before the next one runs, so scheduling the same function again does not grow the synchronous call stack.

## Fixed Delay Versus Fixed Interval

A repeating `setInterval` is another answer when periodic scheduling is the intended contract. It needs an empty-input guard and explicit `clearInterval` after the last value. It does not express this solution's full one-second wait after the output callback finishes.

Synchronous callbacks on one JavaScript thread do not execute simultaneously. However, an interval callback that starts asynchronous work can start another operation before the earlier operation finishes. This implementation requires a synchronous `emit` and does not await a returned Promise. For asynchronous output, await the operation before scheduling the next timeout and define failure and cancellation behavior.

Busy waiting consumes CPU and blocks the event loop. A slow synchronous output function also blocks while it executes; using a timer does not make that work non-blocking.

## Test Without Waiting in Real Time

Use a fake clock that replaces `setTimeout` and `clearTimeout` while running the function. Check both outputs and pending timers:

- Empty array: no output and zero timers immediately.
- `[7]`: no output at 999 milliseconds; one `7` at 1,000; zero timers afterward.
- `[10, 20, 30]`: advance in 1,000-millisecond steps and check each ordered prefix. Advance again after completion and check that nothing changes.
- Cancel before the first tick: advancing time produces no output.
- Cancel after one tick, including from inside `emit`: only the first value is emitted and no timer remains.
- Cancel twice or after completion: no new output or timer is created.
- Simulate 250 milliseconds of synchronous output work: the next callback is scheduled 1,000 milliseconds after that work ends, not after the preceding callback started.

Fake clocks verify scheduling logic, not real-world timing precision. A separate runtime smoke test can confirm execution with actual timers.

## Complexity

For `N` values and constant-time output, total work is `O(N)`. Auxiliary space is `O(1)` beyond the input: an index, cancellation state, and at most one timer. The closure retains the input while the operation or its cancellation function remains reachable.

With negligible callback work and no extra delays, completion takes about `N` seconds under this delayed-first-output contract. Output duration and scheduling delays add to that time. If the interviewer wants an immediate first output, change the timing contract and expected trace together.

## References

The archived source metadata identifies the recovered interview topic; the implementation and tests above are an independent explanation. See the [Node.js timer documentation](https://nodejs.org/api/timers.html) for scheduling and cancellation behavior.
