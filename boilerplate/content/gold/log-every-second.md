---
title: "Log Every Second: Scheduling Repeated Output Without Blocking"
source_url: "http://www.interviewbits.com:80/blog/2014/12/02/log-every-second/"
source_path: "/blog/2014/12/02/log-every-second/"
wayback_snapshot: "https://web.archive.org/web/20141228212406/http://www.interviewbits.com:80/blog/2014/12/02/log-every-second/"
evidence_tier: "Gold"
topic: "algorithm-interview"
rewrite_status: "rewritten"
---

# Log Every Second: Scheduling Repeated Output Without Blocking

Questions about logging output every second are really questions about scheduling. The interviewer is not only checking whether you can print values in order, but whether you understand the difference between blocking a thread and handing work to a timer.

## Problem

Given a sequence of values, print one item every second until the sequence is exhausted.

Common interview variants include:

- print numbers from `1` to `N`
- print the contents of an array one element per second
- stop cleanly after the last value
- explain how the solution changes in a single-threaded event loop

The useful skill here is separating the repeated action from the scheduling mechanism.

## Straightforward Timer-Based Approach

If the language provides timers, the clearest solution is usually:

1. keep an index for the next item to print
2. schedule a repeating callback once per second
3. print the current item inside the callback
4. advance the index
5. cancel the timer after the final item

In pseudocode:

```text
index = 0
start repeating timer every 1 second:
  print(values[index])
  index += 1
  if index == values.length:
    stop timer
```

This approach is easy to explain and avoids busy waiting.

## Why Busy Waiting Is Wrong

A weak solution uses a loop that repeatedly checks the clock until one second has passed. That wastes CPU time and blocks other work.

Interviewers usually want you to say that:

- busy waiting is inefficient
- it prevents concurrent work on the same thread
- timer APIs or sleep primitives are a better fit

If the environment is event-driven, blocking the main thread is especially harmful because it delays every other callback.

## Recursive Timeout Variant

Some candidates prefer a self-scheduling function instead of a fixed interval timer.

That pattern looks like this:

1. print the current item
2. schedule the next call one second later
3. stop when there are no items left

This variant is nice because the delay to the next run starts only after the current callback finishes, which avoids overlap if the callback work is not constant.

## Edge Cases

- Empty input: print nothing and exit immediately
- One element: print once and stop
- Large `N`: avoid recursion that grows the call stack synchronously
- Slow callback work: prefer self-scheduling timeouts if overlap would be a problem

## Complexity

The algorithm prints each item once, so the total work is `O(N)`.

Extra space is `O(1)` beyond the input storage.

Wall-clock time is about `N` seconds because the problem requires spacing each output by one second.

## Interview Follow-Ups

The common follow-up questions are:

- How would you cancel the process early?
- What happens if the callback takes longer than one second?
- How would you implement the same idea with threads and `sleep`?
- How do closures affect the captured loop variable?

A strong answer focuses on correctness first, then explains the runtime model clearly.
