---
title: "Loop Invariants for Array Interviews: How to Prove Your Scan Is Correct"
seo_title: "Loop Invariants for Array Interview Problems"
content_type: "original-guide"
description: "Learn how to state, maintain, and use loop invariants to explain one-pass array and scan-based interview solutions with confidence."
topic: "algorithm-interview"
rewrite_status: "original"
---

# Loop Invariants for Array Interviews: How to Prove Your Scan Is Correct

Many array interview problems look simple after you see the final code. The real challenge is not writing a loop. It is proving that the loop preserves the right structure after every step.

That proof usually comes from a loop invariant: a statement that is true before the loop starts, remains true after every iteration, and is strong enough to justify the final answer.

If you can say the invariant clearly, you can often explain the whole algorithm clearly.

## What a Loop Invariant Really Is

A loop invariant is not a slogan like "the array is getting sorted." It is a precise claim about the part of the input you have already processed and the state you are carrying forward.

In interview terms, a good invariant answers three questions:

- what part of the input has already been handled
- what your variables mean right now
- what property is guaranteed to hold before the next iteration begins

For scan-based problems, this is often the difference between "I think this works" and "here is why it works."

## The Three-Part Proof You Can Reuse

When an interviewer asks why your loop is correct, use the same structure every time:

- Initialization: explain why the invariant is true before the first iteration
- Maintenance: explain why one more iteration keeps the invariant true
- Termination: explain why the invariant implies the final answer when the loop ends

This structure is more useful than memorizing a proof for one problem. It gives you a reusable way to talk through almost any one-pass solution.

## Start by Naming the Processed Region

The easiest way to find an invariant is to split the input into regions.

For example, after reading the first `i` elements, you might know:

- the left side already satisfies the target arrangement
- the middle section is still unknown
- one variable stores the best answer seen so far
- a candidate has survived every elimination test up to this point

That region-based view makes the invariant concrete. Without it, developers often describe only the next action and never explain what the current state guarantees.

## Example: Insert Interval

In [Insert Interval](/insert-interval/), the useful invariant is not just "we are merging intervals."

A better invariant is:

- the output built so far contains the correct merged result for every interval that ends before the current scan position
- if a merged interval is still open, it represents the correct merge of the new interval with every overlapping interval seen so far

That wording tells you exactly why it is safe to append a non-overlapping interval, exactly when to merge, and exactly why the final append is correct.

The code becomes much easier to defend because each branch corresponds to one invariant-preserving case.

## Example: Plus Minus Array

In [Plus Minus Array](/plus-minus-array/), a strong invariant focuses on placement rather than vague progress.

For a left-to-right construction, you might say:

- every filled index before position `i` already satisfies the alternating-sign rule
- the unused positive and negative elements still preserve their original relative order within their own groups
- the next write position is the first index whose value is not yet fixed

That invariant clarifies why each assignment is safe and why the algorithm can stop once one group is exhausted and the remaining elements are appended under the chosen contract.

## Example: Sort by Length and Frequency

In [Sort Words by Length and Frequency](/sort-by-length-then-frequency/), the main loop may build counts before a later sort step. The invariant during counting is different from the invariant during output construction.

During counting, a good invariant is:

- after processing the first `i` words, the frequency map matches exactly those `i` words

That sounds obvious, but it matters because it identifies the meaning of the map precisely. Once you later sort by the comparison rule, the reasoning shifts from a scan invariant to a comparator contract.

This is a useful reminder: not every problem has one invariant for the entire solution. Multi-stage solutions often need one invariant per stage.

## Example: Candidate Elimination

In [Celebrity Problem](/celebrities/), the elimination pass is a classic invariant exercise.

After processing the first `i` people, the invariant can be:

- every person eliminated so far is provably not a celebrity
- the current candidate is the only person among the processed prefix who could still be a celebrity

That is what makes the one-pass elimination defensible. You are not guessing. You are shrinking the candidate set while preserving exactly one viable option.

The same style of reasoning shows up in [Car Race Leaderboard](/car-race/), where the maintained state summarizes the best result seen so far over the processed event stream.

## Common Invariant Shapes for Interview Problems

Across array and scan problems, the same invariant patterns appear again and again:

- processed prefix is already correct
- best answer so far summarizes the processed prefix
- candidate set has been reduced without losing any valid answer
- window boundaries capture exactly the current feasible segment
- counts or maps match the elements seen so far
- output built so far is correct and final for its completed region

If you learn to spot these shapes, you stop treating every new problem as if it needs a totally new proof language.

## A Simple Template for Writing One

When you get stuck, fill in this sentence:

```text
Before each iteration, after processing __________,
the variables __________ represent __________,
and the region __________ already satisfies __________.
```

Then test whether that statement survives one more iteration. If it does not, the invariant is too vague or simply wrong.

A good invariant should make incorrect code feel uncomfortable. If two very different branches both seem compatible with your statement, it is probably not specific enough.

## Mistakes That Usually Mean the Invariant Is Weak

- describing what the loop does instead of what is already guaranteed
- using words like "correct" or "better" without saying correct about what
- forgetting to define what a pointer, counter, or candidate means
- jumping from maintenance directly to the final answer without a termination argument
- writing an invariant that is so weak it would also be true for a broken implementation

These mistakes are common because people focus on actions. Invariants force you to focus on state.

## How to Say It in an Interview

You usually do not need a formal proof. A short explanation is enough:

- "Before each iteration, everything before index `i` already satisfies the required arrangement."
- "My candidate is the only remaining possible answer among the people processed so far."
- "The map exactly reflects the counts in the prefix we have scanned."

Then connect each branch of the loop to preserving that statement.

This style makes your reasoning sound deliberate, even if the code itself is short.

## How This Connects to the Rest of AlgoDrills

If you want to practice loop invariants deliberately, this sequence works well:

- [Insert Interval](/insert-interval/) for region-based merging
- [Plus Minus Array](/plus-minus-array/) for placement constraints during a scan
- [Sort Words by Length and Frequency](/sort-by-length-then-frequency/) for stage-specific state meaning
- [Celebrity Problem](/celebrities/) for elimination invariants
- [How to Compute a Square Root Without Calling a Library Function](/square-root/) for a binary-search invariant over an answer space

That last example is important because invariants are not limited to arrays. They also explain why search boundaries, candidate answers, and monotonic conditions stay valid during binary search.

## The Real Goal

Loop invariants are not academic decoration. They are the shortest path from code that seems plausible to code you can defend under pressure.

When you practice a scan-based problem, do not stop after getting the right output. Ask one more question:

- what exactly is guaranteed to be true before the next iteration starts

If you can answer that cleanly, you usually understand the algorithm well enough to adapt it, debug it, and explain it in an interview without sounding like you memorized it.
