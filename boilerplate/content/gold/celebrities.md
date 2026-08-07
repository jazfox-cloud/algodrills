---
title: "Celebrity Problem: Elimination Strategy for a Directed Knows Graph"
seo_title: "Celebrity Problem: Directed Knows Graph Strategy"
description: "Solve the celebrity problem with candidate elimination, then verify the directed knows-graph conditions in linear time and constant space."
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

## Clarify the Contract First

Before jumping into the algorithm, make the interview assumptions explicit:

- There may be zero or one celebrity.
- `knows(a, b)` can be queried in constant time.
- A person is not treated as "knowing themselves" for the decision rule.
- The goal is to minimize relationship checks, not just write working code.

That framing matters because it explains why a second verification pass is required. The first pass only finds the last surviving candidate.

## Naive Approach

The direct approach checks every person against every other person.

For each candidate `c`:

- Verify that every other person knows `c`.
- Verify that `c` does not know any other person.

This works, but it costs `O(N^2)` checks.

That answer is correct, but it misses the elimination structure hidden in the problem. Interviewers usually expect you to move past this quickly.

## Key Elimination Insight

You can rule people out one comparison at a time.

Suppose you compare `a` and `b`:

- If `a` knows `b`, then `a` cannot be the celebrity.
- If `a` does not know `b`, then `b` cannot be the celebrity.

Either way, one person is eliminated immediately.

This is the whole trick. A single comparison cannot prove who the celebrity is, but it can prove that one of the two people is definitely not the celebrity.

## Linear Candidate Selection

Start with candidate `0`. Scan through the group from left to right:

- If the current candidate knows person `i`, replace the candidate with `i`.
- Otherwise keep the current candidate.

After one pass, only one possible celebrity remains.

This pass does not prove the candidate is a celebrity. It only finds the only person who still could be one.

## Worked Example

Suppose there are four people: `0`, `1`, `2`, and `3`.

Assume:

- `0` knows `1`
- `1` knows `3`
- `2` knows `3`
- `3` knows nobody
- everyone except `3` knows `3`

Now run the elimination pass:

1. candidate = `0`
2. compare `0` with `1`
   - `0` knows `1`, so `0` cannot be the celebrity
   - candidate becomes `1`
3. compare `1` with `2`
   - if `1` does not know `2`, then `2` cannot be the celebrity
   - candidate stays `1`
4. compare `1` with `3`
   - `1` knows `3`, so `1` cannot be the celebrity
   - candidate becomes `3`

At that point, `3` is the only remaining possibility.

You still need to verify:

- `0`, `1`, and `2` all know `3`
- `3` knows none of `0`, `1`, or `2`

Only then can you return `3`.

## Verification Pass

Once the candidate is chosen, run a second pass to verify both celebrity conditions:

- Every other person must know the candidate.
- The candidate must not know any other person.

If either condition fails, there is no celebrity.

## Why the Elimination Pass Is Safe

The elimination logic works because each comparison answers one binary question with a guaranteed discard:

- if `a` knows `b`, then `a` fails the "knows nobody" rule
- if `a` does not know `b`, then `b` fails the "everyone knows them" rule

So every step shrinks the candidate pool by one without ever discarding a real celebrity.

That is the invariant to say out loud in an interview.

## Matrix View

Some interviewers phrase this problem with an `N x N` boolean matrix where `M[a][b] = 1` means person `a` knows person `b`.

In that version, a celebrity row and column have a distinctive shape:

- the celebrity row is all `0`s except possibly the diagonal
- the celebrity column is all `1`s except the diagonal

The elimination pass avoids scanning the whole matrix up front. It uses selected row/column comparisons to identify the only column that might satisfy the rule.

## Reference Pseudocode

```text
findCelebrity(n):
    candidate = 0

    for i from 1 to n - 1:
        if knows(candidate, i):
            candidate = i

    for i from 0 to n - 1:
        if i == candidate:
            continue

        if knows(candidate, i):
            return -1

        if not knows(i, candidate):
            return -1

    return candidate
```

The return value `-1` here means no celebrity exists.

## Complexity

The elimination pass takes `O(N)` checks.

The verification pass also takes `O(N)` checks.

So the overall time complexity is `O(N)`, with `O(1)` extra space.

In terms of relationship checks, the first pass uses `N - 1` queries, and the verification pass uses up to `2(N - 1)` more. That keeps the total linear.

## Common Mistakes

- Returning the candidate immediately after the first pass without verification
- Forgetting that the problem may have no celebrity at all
- Mixing up the direction of `knows(a, b)`
- Claiming `O(1)` time because only one candidate is tracked
- Writing a symmetric friendship-style interpretation even though `knows` is directional

The direction issue is especially common. This is not an undirected graph problem.

## Good Follow-Ups

If the interviewer pushes further, these are reasonable extensions:

- What changes if `knows(a, b)` is very expensive?
- How would you cache repeated queries?
- What if you must return all people who satisfy a weaker variant of the rule?
- What if the graph is streamed instead of fully queryable?

Those follow-ups usually turn the discussion from pure elimination into API-cost reasoning or graph modeling.

## Why Interviewers Like It

This problem tests whether you can replace brute force with invariant-based reasoning. The important step is recognizing that each comparison can permanently discard one candidate, which turns a quadratic search into a linear one.

## Interview-Ready Summary

The clean answer is:

- use one pass to eliminate impossible candidates
- use one more pass to verify the final candidate
- return the candidate only if both celebrity conditions hold

That gives `O(N)` time, `O(1)` space, and a short proof of correctness based on discarding one non-celebrity per comparison.
