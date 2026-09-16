---
title: "Power Set Generation: Two Practical Interview Approaches"
description: "Generate every subset with bit masks or backtracking, understand the 2^N output size, and compare ordering, memory, and duplicate handling."
source_url: "http://www.interviewbits.com:80/blog/2014/12/03/power-set/"
source_path: "/blog/2014/12/03/power-set/"
wayback_snapshot: "https://web.archive.org/web/20141228212413/http://www.interviewbits.com:80/blog/2014/12/03/power-set/"
evidence_tier: "Gold"
topic: "algorithm-interview"
rewrite_status: "rewritten"
---

# Power Set Generation: Two Practical Interview Approaches

A power set contains every subset of a set, including the empty set and the original set. For `N` distinct elements, it contains exactly `2^N` subsets: each element can be included or excluded.

## Input and Output Contract

The Python functions below accept a list of distinct integers and return a list of subsets, each represented by a new list. They preserve the input order within each subset and do not modify the input. The order of the subsets may differ between implementations.

- Empty input returns `[[]]`: the empty set has one subset.
- Negative values and zero work like any other values.
- Distinct elements are a precondition, not a runtime check. With `[1, 1]`, these functions treat the two positions separately and produce repeated value-based subsets. If the question asks for unique subsets of an array with duplicates, use a separate duplicate-aware algorithm, such as sorting and skipping equal choices at the same recursion depth.

## Approach 1: Bit Masking

Use one bit for each input position. In a mask, bit `j` is `1` exactly when `nums[j]` belongs to the subset. Enumerating all integers from `0` through `(1 << N) - 1` visits every possible inclusion pattern.

```python
def power_set_masks(nums):
    result = []
    for mask in range(1 << len(nums)):
        subset = []
        for j, value in enumerate(nums):
            if mask & (1 << j):
                subset.append(value)
        result.append(subset)
    return result
```

### Complete Example: `[1, 2, 3]`

The rightmost bit represents the first input element, `1`. Read each mask using that convention:

- `000` selects `[]`.
- `001` selects `[1]`.
- `010` selects `[2]`.
- `011` selects `[1, 2]`.
- `100` selects `[3]`.
- `101` selects `[1, 3]`.
- `110` selects `[2, 3]`.
- `111` selects `[1, 2, 3]`.

For example, mask `101` includes positions zero and two. The function returns the eight lists above in that order.

### Why It Works

Every subset has a unique inclusion bit for each input position, so it corresponds to exactly one mask. The loop visits every mask once. With distinct input elements, this guarantees that no subset is missing or repeated.

## Approach 2: Backtracking

At each index, choose to exclude or include that element. The current `path` holds the choices made so far. At the end of the input, save a copy of it.

```python
def power_set_backtracking(nums):
    result = []
    path = []

    def visit(index):
        if index == len(nums):
            result.append(path.copy())
            return

        visit(index + 1)  # Exclude this element.
        path.append(nums[index])
        visit(index + 1)  # Include this element.
        path.pop()       # Restore the path for the caller.

    visit(0)
    return result
```

For `[1, 2]`, the decisions are exclude/exclude, exclude/include, include/exclude, and include/include. The output is `[[], [2], [1], [1, 2]]`. Bit masking returns `[[], [1], [2], [1, 2]]`; both contain the same subsets.

### Why Copy and Pop Matter

On entry to `visit(index)`, `path` contains exactly the selected elements among positions before `index`. The two recursive calls cover both choices for the next element. At a leaf, every position has been decided, so the path represents one complete subset.

`path.copy()` gives each output subset its own list. Appending `path` directly would store repeated references to the same mutable list. `path.pop()` restores the caller's path after exploring the include branch. Together, these operations preserve the invariant as the traversal visits all `2^N` leaves.

## Runnable Checks

Run these checks after both function definitions. Compare sets of tuples when output order is irrelevant, and check the length separately to catch duplicate outputs.

```python
expected = {
    (), (1,), (2,), (3,),
    (1, 2), (1, 3), (2, 3), (1, 2, 3),
}

for generate in (power_set_masks, power_set_backtracking):
    assert generate([]) == [[]]
    assert generate([7]) == [[], [7]]
    assert {tuple(s) for s in generate([-1, 0])} == {
        (), (-1,), (0,), (-1, 0),
    }

    nums = [1, 2, 3]
    subsets = generate(nums)
    assert len(subsets) == 8
    assert {tuple(s) for s in subsets} == expected
    assert nums == [1, 2, 3]

    # Modifying one output list must not change another or the input.
    subsets[0].append(99)
    assert all(99 not in s for s in subsets[1:])
    assert nums == [1, 2, 3]
```

## Time and Space Complexity

For `N >= 1`, both implementations take `O(N * 2^N)` time when they materialize every subset. Bit masking checks `N` positions for every mask. Backtracking visits `O(2^N)` tree nodes, but copying all paths costs `N * 2^(N - 1)` element copies: each element appears in half of the subsets.

The returned result uses `O(N * 2^N)` space, including the subset contents. Excluding that result, bit masking uses at most `O(N)` working space for its current subset, and backtracking uses `O(N)` for its path and recursion stack. Empty input takes constant time and space.

These are the usual interview bounds with constant-cost index and bit operations. Python integers have arbitrary precision, so operations on very large masks are not literally constant time. In practice, storing exponentially many subsets becomes the main limitation long before a large input is feasible; recursive code also has a recursion-depth limit.

## Choosing Between Them

Use bit masking for a compact iterative solution when every subset is required. Use backtracking when the interview introduces constraints or pruning. Neither approach makes a large power set cheap to produce. Before generating results, clarify whether the interviewer needs all subsets, just their count, or subsets meeting a condition.

## Related Guide

See [Backtracking vs Iterative Generation](/backtracking-vs-iterative-generation/) for guidance on choosing between recursive search, iterative expansion, and bit masks across combinatorial problems.
