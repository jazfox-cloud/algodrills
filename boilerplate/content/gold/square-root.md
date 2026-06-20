---
title: "实战算法：如何在不调用库函数的情况下高效求解平方根"
source_url: "http://www.interviewbits.com:80/blog/2014/11/29/square-root/"
source_path: "/blog/2014/11/29/square-root/"
wayback_snapshot: "https://web.archive.org/web/20141228212350/http://www.interviewbits.com:80/blog/2014/11/29/square-root/"
evidence_tier: "Gold"
topic: "algorithm-interview"
rewrite_status: "rewritten"
---

# 实战算法：如何在不调用库函数的情况下高效求解平方根

在工程开发和底层计算中，不依赖语言内置的 `Math.sqrt()` 来实现开方，是检验数学直觉、边界处理和数值稳定性的常见题目。

## 方案一：二分查找

如果要寻找正整数 `N` 的算术平方根整数部分，也就是 `floor(sqrt(N))`，可以将答案锁定在 `[0, N]` 区间内。因为平方函数在非负区间单调递增，二分查找是直接且稳定的选择。

## 执行细节

- 设置低边界 `low = 0`，高边界 `high = N`。
- 每轮计算中点 `mid = low + (high - low) / 2`。
- 比较 `mid * mid` 与 `N` 的关系。
- 如果 `mid * mid == N`，直接返回 `mid`。
- 如果 `mid * mid < N`，说明答案在右侧，移动低边界，并记录当前候选答案。
- 如果 `mid * mid > N`，说明答案在左侧，移动高边界。

实际编码时要注意整型溢出。可以用 `mid == N / mid` 或 `mid <= N / mid` 代替直接计算 `mid * mid`。

## 方案二：牛顿迭代

牛顿迭代通过切线逼近函数零点，收敛速度通常快于二分查找。对于方程 `f(x) = x^2 - N = 0`，迭代公式为：

```text
x_next = 0.5 * (x + N / x)
```

选择 `N` 作为初始值，持续迭代，直到相邻两次结果差值小于指定精度，即可得到浮点近似解。
