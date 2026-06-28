---
title: "Celebrity Problem: Elimination Strategy for a Directed Knows Graph"
source_url: "http://www.interviewbits.com:80/blog/2014/12/15/celebrities/"
source_path: "/blog/2014/12/15/celebrities/"
wayback_snapshot: "https://web.archive.org/web/20141228193310/http://www.interviewbits.com:80/blog/2014/12/15/celebrities/"
evidence_tier: "Gold"
topic: "algorithm-interview"
rewrite_status: "rewritten"
---

# Celebrity Problem: Elimination Strategy for a Directed Knows Graph

The celebrity problem is a common interview question because it looks social on the surface but reduces to a clean elimination algorithm. You are given a group of people and a function `knows(a, b)` that tells whether person `a` knows person `b`.

A celebrity, if one exists, has two properties:

- Everyone knows the celebrity.
- The celebrity knows nobody else.

The task is to identify the celebrity using as few relationship checks as possible.

## Naive Approach

The direct approach checks every person against every other person.

For each candidate `c`:

- Verify that every other person knows `c`.
- Verify that `c` does not know any other person.

This works, but it costs `O(N^2)` checks.

## Key Elimination Insight

You can rule people out one comparison at a time.

Suppose you compare `a` and `b`:

- If `a` knows `b`, then `a` cannot be the celebrity.
- If `a` does not know `b`, then `b` cannot be the celebrity.

Either way, one person is eliminated immediately.

## Linear Candidate Selection

Start with candidate `0`. Scan through the group from left to right:

- If the current candidate knows person `i`, replace the candidate with `i`.
- Otherwise keep the current candidate.

After one pass, only one possible celebrity remains.

This pass does not prove the candidate is a celebrity. It only finds the only person who still could be one.

## Verification Pass

Once the candidate is chosen, run a second pass to verify both celebrity conditions:

- Every other person must know the candidate.
- The candidate must not know any other person.

If either condition fails, there is no celebrity.

## Complexity

The elimination pass takes `O(N)` checks.

The verification pass also takes `O(N)` checks.

So the overall time complexity is `O(N)`, with `O(1)` extra space.

## Why Interviewers Like It

This problem tests whether you can replace brute force with invariant-based reasoning. The important step is recognizing that each comparison can permanently discard one candidate, which turns a quadratic search into a linear one.
