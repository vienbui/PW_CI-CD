# LeetCode Prep for Mid–Senior Automation (TypeScript)

Curated list: **5 Easy** | **10 Medium** | **2 Hard** — with approach, complexity, step-by-step code, and variants.

---

## EASY (5)

---

### 1. Two Sum (LeetCode 1)

**Link:** https://leetcode.com/problems/two-sum/

**Problem:** Given an array of integers `nums` and an integer `target`, return indices of the two numbers that add up to `target`. Exactly one solution exists.

#### Idea / Approach

- Use a **hash map** to store “value → index” as we scan the array.
- For each `nums[i]`, check if `target - nums[i]` exists in the map; if yes, return the two indices.

#### Time & Space Complexity

- **Time:** O(n) — single pass.
- **Space:** O(n) — map stores up to n elements.

#### Step-by-Step with Code

```typescript
function twoSum(nums: number[], target: number): number[] {
  const seen = new Map<number, number>(); // value -> index

  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (seen.has(need)) {
      return [seen.get(need)!, i];
    }
    seen.set(nums[i], i);
  }
  return []; // problem guarantees a solution exists
}
```

- Step 1: Build a map `value → index`.
- Step 2: For each `nums[i]`, compute `need = target - nums[i]`.
- Step 3: If `need` is in the map, return `[map.get(need), i]`.
- Step 4: Otherwise add `nums[i] → i` and continue.

#### Extensions / Variants

- **Two Sum II (sorted array):** two pointers from both ends; O(n) time, O(1) space.
- **Three Sum / Four Sum:** fix one or two numbers and reduce to Two Sum.
- **Count pairs with given sum:** same idea, count instead of returning indices.

---

### 2. Valid Palindrome (LeetCode 125)

**Link:** https://leetcode.com/problems/valid-palindrome/

**Problem:** Given a string `s`, determine if it is a palindrome after converting to lowercase and removing non-alphanumeric characters.

#### Idea / Approach

- **Two pointers:** one at start, one at end. Skip non-alphanumeric; compare characters (case-insensitive) until pointers meet.

#### Time & Space Complexity

- **Time:** O(n).
- **Space:** O(1) if we don’t allocate a cleaned string; O(n) if we do.

#### Step-by-Step with Code

```typescript
function isPalindrome(s: string): boolean {
  let left = 0;
  let right = s.length - 1;

  const isAlphanumeric = (c: string): boolean =>
    /[a-zA-Z0-9]/.test(c);

  while (left < right) {
    while (left < right && !isAlphanumeric(s[left])) left++;
    while (left < right && !isAlphanumeric(s[right])) right--;
    if (s[left].toLowerCase() !== s[right].toLowerCase()) return false;
    left++;
    right--;
  }
  return true;
}
```

- Step 1: Move `left` forward until alphanumeric.
- Step 2: Move `right` backward until alphanumeric.
- Step 3: Compare (lowercase); if different, return false.
- Step 4: Move both inward and repeat.

#### Extensions / Variants

- **Palindrome Linked List:** find middle, reverse second half, compare.
- **Valid Palindrome II:** allow at most one deletion; try skip left or skip right once.
- **Longest palindromic substring:** expand around center or DP.

---

### 3. Merge Two Sorted Lists (LeetCode 21)

**Link:** https://leetcode.com/problems/merge-two-sorted-lists/

**Problem:** Merge two sorted linked lists and return the head of the merged list.

#### Idea / Approach

- **Dummy head** + pointer: always append the smaller of `list1.val` and `list2.val`, then advance that list. Attach the remaining list at the end.

#### Time & Space Complexity

- **Time:** O(n + m).
- **Space:** O(1) — only a few pointers.

#### Step-by-Step with Code

```typescript
class ListNode {
  val: number;
  next: ListNode | null;
  constructor(val = 0, next: ListNode | null = null) {
    this.val = val;
    this.next = next;
  }
}

function mergeTwoLists(
  list1: ListNode | null,
  list2: ListNode | null
): ListNode | null {
  const dummy = new ListNode(0);
  let tail = dummy;

  while (list1 && list2) {
    if (list1.val <= list2.val) {
      tail.next = list1;
      list1 = list1.next;
    } else {
      tail.next = list2;
      list2 = list2.next;
    }
    tail = tail.next;
  }
  tail.next = list1 ?? list2;
  return dummy.next;
}
```

- Step 1: Create `dummy` and `tail`.
- Step 2: While both lists exist, link the smaller node to `tail` and advance.
- Step 3: Attach the non-null remainder to `tail.next`.

#### Extensions / Variants

- **Merge k Sorted Lists:** min-heap of list heads, or merge in pairs (divide and conquer).
- **Merge Two Sorted Arrays:** same idea with indices; often merge into a third array or in-place with careful indexing.

---

### 4. Maximum Subarray (LeetCode 53) — Kadane’s Algorithm

**Link:** https://leetcode.com/problems/maximum-subarray/

**Problem:** Find the contiguous subarray with the largest sum.

#### Idea / Approach

- **Kadane:** for each position, decide whether to extend the current subarray or start fresh. Track max sum seen so far.

#### Time & Space Complexity

- **Time:** O(n).
- **Space:** O(1).

#### Step-by-Step with Code

```typescript
function maxSubArray(nums: number[]): number {
  let maxSum = nums[0];
  let currentSum = nums[0];

  for (let i = 1; i < nums.length; i++) {
    currentSum = Math.max(nums[i], currentSum + nums[i]);
    maxSum = Math.max(maxSum, currentSum);
  }
  return maxSum;
}
```

- Step 1: Initialize `maxSum` and `currentSum` with `nums[0]`.
- Step 2: For each `nums[i]`, set `currentSum = max(nums[i], currentSum + nums[i])`.
- Step 3: Update `maxSum = max(maxSum, currentSum)`.

#### Extensions / Variants

- **Maximum Product Subarray:** track both max and min product (because of negatives).
- **Best Time to Buy and Sell Stock:** same idea on array of differences (prices[i] - prices[i-1]).
- **Circular subarray:** either max subarray is inside array, or total - min subarray (wrap-around).

---

### 5. Valid Parentheses (LeetCode 20)

**Link:** https://leetcode.com/problems/valid-parentheses/

**Problem:** Given a string containing only `()`, `[]`, `{}`, determine if the string is valid (properly closed and nested).

#### Idea / Approach

- **Stack:** push opening brackets; for closing bracket, pop and check it matches. Final stack must be empty.

#### Time & Space Complexity

- **Time:** O(n).
- **Space:** O(n) for the stack.

#### Step-by-Step with Code

```typescript
function isValid(s: string): boolean {
  const stack: string[] = [];
  const pairs: Record<string, string> = {
    ')': '(',
    ']': '[',
    '}': '{',
  };

  for (const c of s) {
    if (c === '(' || c === '[' || c === '{') {
      stack.push(c);
    } else {
      if (stack.length === 0 || stack.pop() !== pairs[c]) return false;
    }
  }
  return stack.length === 0;
}
```

- Step 1: Push opening brackets.
- Step 2: For closing bracket, if stack is empty or top doesn’t match, return false; else pop.
- Step 3: Return true only if stack is empty at the end.

#### Extensions / Variants

- **Minimum Add to Make Parentheses Valid:** count unmatched open and unmatched close; sum is the answer.
- **Longest Valid Parentheses:** stack storing indices; compute max length of valid segment.
- **Generate Parentheses:** backtracking with open/close counts.

---

## MEDIUM (10)

---

### 6. Add Two Numbers (LeetCode 2)

**Link:** https://leetcode.com/problems/add-two-numbers/

**Problem:** Two non-empty linked lists represent two non-negative integers (digits in reverse). Return the head of a list representing their sum.

#### Idea / Approach

- Simulate column addition: add digits + carry, create nodes for the result list. Use a dummy head.

#### Time & Space Complexity

- **Time:** O(max(n, m)).
- **Space:** O(max(n, m)) for the result list (we don’t count recursion stack if iterative).

#### Step-by-Step with Code

```typescript
function addTwoNumbers(
  l1: ListNode | null,
  l2: ListNode | null
): ListNode | null {
  const dummy = new ListNode(0);
  let tail = dummy;
  let carry = 0;

  while (l1 || l2 || carry) {
    const sum = (l1?.val ?? 0) + (l2?.val ?? 0) + carry;
    carry = Math.floor(sum / 10);
    tail.next = new ListNode(sum % 10);
    tail = tail.next;
    l1 = l1?.next ?? null;
    l2 = l2?.next ?? null;
  }
  return dummy.next;
}
```

- Step 1: Loop while either list has nodes or carry is non-zero.
- Step 2: Sum = l1.val + l2.val + carry; new digit = sum % 10; carry = sum / 10.
- Step 3: Append new node, advance tail and both list pointers.

#### Extensions / Variants

- **Add Two Numbers II (digits stored forward):** reverse both lists, add, then reverse result; or use stacks.
- **Multiply Strings:** simulate multiplication digit by digit.

---

### 7. Longest Substring Without Repeating Characters (LeetCode 3)

**Link:** https://leetcode.com/problems/longest-substring-without-repeating-characters/

**Problem:** Find the length of the longest substring without repeating characters.

#### Idea / Approach

- **Sliding window + Set (or Map):** extend window by adding `s[r]`; if `s[r]` is already in the set, shrink from the left until the duplicate is removed. Track max window length.

#### Time & Space Complexity

- **Time:** O(n).
- **Space:** O(min(n, alphabet size)).

#### Step-by-Step with Code

```typescript
function lengthOfLongestSubstring(s: string): number {
  const seen = new Set<string>();
  let left = 0;
  let maxLen = 0;

  for (let right = 0; right < s.length; right++) {
    while (seen.has(s[right])) {
      seen.delete(s[left]);
      left++;
    }
    seen.add(s[right]);
    maxLen = Math.max(maxLen, right - left + 1);
  }
  return maxLen;
}
```

- Step 1: Expand with `right`; add `s[right]` to set.
- Step 2: While `s[right]` was already in set, remove `s[left]` and move `left++`.
- Step 3: Update `maxLen` with current window size.

#### Extensions / Variants

- **Longest repeating character replacement:** sliding window; allow at most k changes; check if `windowSize - maxFreq <= k`.
- **Minimum window substring:** sliding window with two maps (need vs current); shrink when valid.

---

### 8. Container With Most Water (LeetCode 11)

**Link:** https://leetcode.com/problems/container-with-most-water/

**Problem:** Array `height[i]` = height of line at index i. Find two lines that form a container (with x-axis) holding the most water.

#### Idea / Approach

- **Two pointers:** start at `left = 0`, `right = n - 1`. Water = `(right - left) * min(height[left], height[right])`. Move the pointer at the **shorter** line inward (only by moving the shorter can we possibly get a taller min and thus more water).

#### Time & Space Complexity

- **Time:** O(n).
- **Space:** O(1).

#### Step-by-Step with Code

```typescript
function maxArea(height: number[]): number {
  let left = 0;
  let right = height.length - 1;
  let maxWater = 0;

  while (left < right) {
    const width = right - left;
    const h = Math.min(height[left], height[right]);
    maxWater = Math.max(maxWater, width * h);
    if (height[left] <= height[right]) left++;
    else right--;
  }
  return maxWater;
}
```

- Step 1: Compute area for current `left`/`right`.
- Step 2: Update `maxWater`.
- Step 3: Move the pointer at the smaller height inward.

#### Extensions / Variants

- **Trapping Rain Water:** for each index, water = min(maxLeft, maxRight) - height[i]; can do two passes or two pointers.
- **Largest Rectangle in Histogram:** stack to find “next smaller” on left and right.

---

### 9. 3Sum (LeetCode 15)

**Link:** https://leetcode.com/problems/3sum/

**Problem:** Find all unique triplets in the array that sum to 0.

#### Idea / Approach

- **Sort + two pointers:** fix `nums[i]`, then solve two-sum on `nums[i+1..n-1]` for target `-nums[i]` using two pointers. Skip duplicates for `i` and for the two pointers.

#### Time & Space Complexity

- **Time:** O(n²) — sort O(n log n) + for each i, two-pointer scan O(n).
- **Space:** O(1) excluding output; O(log n) or O(n) for sort depending on implementation.

#### Step-by-Step with Code

```typescript
function threeSum(nums: number[]): number[][] {
  nums.sort((a, b) => a - b);
  const result: number[][] = [];

  for (let i = 0; i < nums.length - 2; i++) {
    if (i > 0 && nums[i] === nums[i - 1]) continue;
    let left = i + 1;
    let right = nums.length - 1;
    const target = -nums[i];

    while (left < right) {
      const sum = nums[left] + nums[right];
      if (sum === target) {
        result.push([nums[i], nums[left], nums[right]]);
        while (left < right && nums[left] === nums[left + 1]) left++;
        while (left < right && nums[right] === nums[right - 1]) right--;
        left++;
        right--;
      } else if (sum < target) left++;
      else right--;
    }
  }
  return result;
}
```

- Step 1: Sort array.
- Step 2: For each `i`, skip duplicate `i`; set `target = -nums[i]`.
- Step 3: Two pointers on `[i+1, n-1]`; if sum === target, record and skip duplicates; else move left or right.

#### Extensions / Variants

- **3Sum Closest:** same structure; track triplet with minimum |sum - target|.
- **4Sum:** outer loop fixes two indices, inner two-pointer for remaining two.

---

### 10. Group Anagrams (LeetCode 49)

**Link:** https://leetcode.com/problems/group-anagrams/

**Problem:** Group strings that are anagrams of each other.

#### Idea / Approach

- **Hash by canonical form:** for each string, use a key that is the same for all anagrams (e.g. sorted string, or count of each character). Group by key in a map.

#### Time & Space Complexity

- **Time:** O(n * k log k) if key = sorted string (k = max string length); O(n * k) if key = character count array serialized.
- **Space:** O(n * k) for storing groups.

#### Step-by-Step with Code

```typescript
function groupAnagrams(strs: string[]): string[][] {
  const map = new Map<string, string[]>();

  for (const s of strs) {
    const key = [...s].sort().join('');
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(s);
  }
  return Array.from(map.values());
}
```

- Step 1: For each string, compute key (e.g. sorted letters).
- Step 2: Append string to `map[key]`.
- Step 3: Return all values of the map.

**Alternative key (O(k) per string):** use a 26-element count array and serialize it (e.g. `"1,0,2,..."`) to avoid sort.

#### Extensions / Variants

- **Valid Anagram:** compare sorted strings or compare character counts.
- **Find All Anagrams in a String:** sliding window + fixed-size count array; compare with target count array.

---

### 11. Binary Tree Level Order Traversal (LeetCode 102)

**Link:** https://leetcode.com/problems/binary-tree-level-order-traversal/

**Problem:** Return the level-order traversal of a binary tree (each level as a separate array).

#### Idea / Approach

- **BFS with queue:** process level by level by tracking level size; for each level, poll `size` nodes and collect their values, enqueue children.

#### Time & Space Complexity

- **Time:** O(n).
- **Space:** O(w) for the queue (max level width), worst O(n).

#### Step-by-Step with Code

```typescript
class TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
  constructor(val = 0, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

function levelOrder(root: TreeNode | null): number[][] {
  if (!root) return [];
  const result: number[][] = [];
  const queue: TreeNode[] = [root];

  while (queue.length > 0) {
    const level: number[] = [];
    const levelSize = queue.length;
    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift()!;
      level.push(node.val);
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    result.push(level);
  }
  return result;
}
```

- Step 1: Enqueue root.
- Step 2: For each level, record `levelSize = queue.length`, then poll `levelSize` nodes, push values to `level`, enqueue children.
- Step 3: Push `level` to result.

#### Extensions / Variants

- **Binary Tree Zigzag Level Order:** same BFS, reverse every other level.
- **Minimum Depth of Binary Tree:** BFS; return depth when first leaf is found.

---

### 12. Product of Array Except Self (LeetCode 238)

**Link:** https://leetcode.com/problems/product-of-array-except-self/

**Problem:** Return an array where `output[i]` = product of all elements except `nums[i]`. No division; O(n) time.

#### Idea / Approach

- **Prefix and suffix products:** `output[i] = prefix[i-1] * suffix[i+1]`. Can do in one result array: first pass fill prefix, second pass multiply by suffix from the right (using a running variable).

#### Time & Space Complexity

- **Time:** O(n).
- **Space:** O(1) if output array doesn’t count (problem often allows).

#### Step-by-Step with Code

```typescript
function productExceptSelf(nums: number[]): number[] {
  const n = nums.length;
  const result = new Array<number>(n);

  let prefix = 1;
  for (let i = 0; i < n; i++) {
    result[i] = prefix;
    prefix *= nums[i];
  }

  let suffix = 1;
  for (let i = n - 1; i >= 0; i--) {
    result[i] *= suffix;
    suffix *= nums[i];
  }
  return result;
}
```

- Step 1: First pass: `result[i] = product of nums[0..i-1]` (prefix).
- Step 2: Second pass: multiply `result[i]` by product of `nums[i+1..n-1]` (suffix) using a running `suffix` from the right.

#### Extensions / Variants

- **Trapping Rain Water:** similar “prefix/suffix” idea with max-left and max-right.
- **Maximum Product Subarray:** track max and min ending at current index.

---

### 13. Search in Rotated Sorted Array (LeetCode 33)

**Link:** https://leetcode.com/problems/search-in-rotated-sorted-array/

**Problem:** Sorted array is rotated at unknown pivot. Find index of `target` in O(log n).

#### Idea / Approach

- **Binary search:** at least one of `[left, mid]` or `[mid, right]` is sorted. If target is in the sorted half, search there; else search the other half.

#### Time & Space Complexity

- **Time:** O(log n).
- **Space:** O(1).

#### Step-by-Step with Code

```typescript
function search(nums: number[], target: number): number {
  let left = 0;
  let right = nums.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (nums[mid] === target) return mid;

    if (nums[left] <= nums[mid]) {
      if (nums[left] <= target && target < nums[mid]) right = mid - 1;
      else left = mid + 1;
    } else {
      if (nums[mid] < target && target <= nums[right]) left = mid + 1;
      else right = mid - 1;
    }
  }
  return -1;
}
```

- Step 1: If `nums[left] <= nums[mid]`, left half is sorted; if target is in that range, go left, else right.
- Step 2: Else right half is sorted; if target is in that range, go right, else left.
- Step 3: If `nums[mid] === target`, return mid.

#### Extensions / Variants

- **Find Minimum in Rotated Sorted Array:** binary search for the pivot (where `nums[mid] > nums[mid+1]` or similar).
- **Search in Rotated Sorted Array II:** duplicates possible; may need to shrink bounds when `nums[left] === nums[mid] === nums[right]`.

---

### 14. Number of Islands (LeetCode 200)

**Link:** https://leetcode.com/problems/number-of-islands/

**Problem:** Grid of `'1'` (land) and `'0'` (water). Count the number of islands (connected land cells).

#### Idea / Approach

- **DFS or BFS:** for each unvisited `'1'`, run DFS/BFS to mark entire island, then increment count.

#### Time & Space Complexity

- **Time:** O(rows * cols).
- **Space:** O(rows * cols) for recursion/queue in worst case; O(1) extra if we mutate grid to mark visited.

#### Step-by-Step with Code

```typescript
function numIslands(grid: string[][]): number {
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;
  let count = 0;

  function dfs(r: number, c: number): void {
    if (r < 0 || r >= rows || c < 0 || c >= cols || grid[r][c] === '0') return;
    grid[r][c] = '0';
    dfs(r + 1, c);
    dfs(r - 1, c);
    dfs(r, c + 1);
    dfs(r, c - 1);
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === '1') {
        count++;
        dfs(r, c);
      }
    }
  }
  return count;
}
```

- Step 1: For each cell, if it’s `'1'`, increment count and run DFS.
- Step 2: In DFS, if out of bounds or water, return; else set cell to `'0'` and recurse to four neighbors.

#### Extensions / Variants

- **Max Area of Island:** same DFS; return area (count of cells) and take max.
- **Surrounded Regions:** flip O’s that are not on border and not connected to border (DFS from border O’s).

---

### 15. LRU Cache (LeetCode 146)

**Link:** https://leetcode.com/problems/lru-cache/

**Problem:** Implement LRU cache with `get(key)` and `put(key, value)` in O(1) average.

#### Idea / Approach

- **Map + Doubly Linked List:** Map for O(1) key → node; list for order (front = most recent, back = least recent). On get: move node to front. On put: if exists update and move to front; else add to front and evict from back if over capacity.

#### Time & Space Complexity

- **Time:** O(1) per get/put.
- **Space:** O(capacity).

#### Step-by-Step with Code

```typescript
class LRUCache {
  private capacity: number;
  private map = new Map<number, DLLNode>();
  private head: DLLNode;
  private tail: DLLNode;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.head = new DLLNode(-1, -1);
    this.tail = new DLLNode(-1, -1);
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  get(key: number): number {
    if (!this.map.has(key)) return -1;
    const node = this.map.get(key)!;
    this.remove(node);
    this.addToHead(node);
    return node.val;
  }

  put(key: number, value: number): void {
    if (this.map.has(key)) {
      const node = this.map.get(key)!;
      node.val = value;
      this.remove(node);
      this.addToHead(node);
      return;
    }
    const node = new DLLNode(key, value);
    this.map.set(key, node);
    this.addToHead(node);
    if (this.map.size > this.capacity) {
      const lru = this.tail.prev!;
      this.remove(lru);
      this.map.delete(lru.key);
    }
  }

  private remove(node: DLLNode): void {
    node.prev!.next = node.next;
    node.next!.prev = node.prev;
  }

  private addToHead(node: DLLNode): void {
    node.next = this.head.next;
    node.prev = this.head;
    this.head.next!.prev = node;
    this.head.next = node;
  }
}

class DLLNode {
  key: number;
  val: number;
  prev: DLLNode | null = null;
  next: DLLNode | null = null;
  constructor(key: number, val: number) {
    this.key = key;
    this.val = val;
  }
}
```

- Step 1: `get`: if key not in map return -1; else move node to head and return value.
- Step 2: `put`: if key exists, update value and move to head; else create node, add to head, and evict tail if over capacity.
- Step 3: `remove` / `addToHead` maintain the doubly linked list.

#### Extensions / Variants

- **LFU Cache:** evict least frequently used; need frequency buckets and order within each bucket.
- **Design Cache:** same pattern in system design discussions.

---

## HARD (2)

---

### 16. Merge k Sorted Lists (LeetCode 23)

**Link:** https://leetcode.com/problems/merge-k-sorted-lists/

**Problem:** Merge k sorted linked lists into one sorted list.

#### Idea / Approach

- **Min-heap (priority queue):** initially push the head of each list. Repeatedly pop the smallest, append to result, and push its next. Alternative: **divide and conquer** — merge pairs of lists until one remains (same as merge sort on lists).

#### Time & Space Complexity

- **Time (heap):** O(N log k) where N = total nodes, k = number of lists.
- **Space (heap):** O(k) for the heap.
- **Time (divide and conquer):** O(N log k); **Space:** O(log k) recursion.

#### Step-by-Step with Code (Min-Heap approach)

TypeScript doesn’t have a built-in heap; we use a simple array and extract min, or a custom MinHeap. Here we use **divide and conquer** (clean and no heap needed):

```typescript
function mergeKLists(lists: Array<ListNode | null>): ListNode | null {
  if (lists.length === 0) return null;
  return mergeRange(lists, 0, lists.length - 1);
}

function mergeRange(
  lists: Array<ListNode | null>,
  left: number,
  right: number
): ListNode | null {
  if (left === right) return lists[left];
  const mid = Math.floor((left + right) / 2);
  const l1 = mergeRange(lists, left, mid);
  const l2 = mergeRange(lists, mid + 1, right);
  return mergeTwoLists(l1, l2);
}

// Reuse mergeTwoLists from Easy #3
function mergeTwoLists(
  list1: ListNode | null,
  list2: ListNode | null
): ListNode | null {
  const dummy = new ListNode(0);
  let tail = dummy;
  while (list1 && list2) {
    if (list1.val <= list2.val) {
      tail.next = list1;
      list1 = list1.next;
    } else {
      tail.next = list2;
      list2 = list2.next;
    }
    tail = tail.next;
  }
  tail.next = list1 ?? list2;
  return dummy.next;
}
```

- Step 1: Base case: one list → return it.
- Step 2: Split range into left and right; recursively merge each half.
- Step 3: Merge the two results with `mergeTwoLists`.

#### Extensions / Variants

- **Merge k Sorted Arrays:** same ideas (heap of (value, arrayIndex, elementIndex) or merge in pairs).
- **Kth Largest in Stream:** one min-heap of size k.

---

### 17. Serialize and Deserialize Binary Tree (LeetCode 297)

**Link:** https://leetcode.com/problems/serialize-and-deserialize-binary-tree/

**Problem:** Design an algorithm to serialize and deserialize a binary tree (to string and back).

#### Idea / Approach

- **Preorder (or level-order) with null markers:** e.g. `"1,2,null,null,3,4,null,null,5,null,null"`. Serialize: preorder, emit value or "null". Deserialize: consume tokens and build tree recursively; when we see "null", return null.

#### Time & Space Complexity

- **Time:** O(n) for both serialize and deserialize.
- **Space:** O(n) for encoded string and recursion stack.

#### Step-by-Step with Code

```typescript
function serialize(root: TreeNode | null): string {
  const out: string[] = [];
  function preorder(node: TreeNode | null): void {
    if (!node) {
      out.push('null');
      return;
    }
    out.push(String(node.val));
    preorder(node.left);
    preorder(node.right);
  }
  preorder(root);
  return out.join(',');
}

function deserialize(data: string): TreeNode | null {
  const tokens = data.split(',');
  let i = 0;
  function build(): TreeNode | null {
    if (tokens[i] === 'null') {
      i++;
      return null;
    }
    const node = new TreeNode(Number(tokens[i++]));
    node.left = build();
    node.right = build();
    return node;
  }
  return build();
}
```

- **Serialize:** preorder; for null push `"null"`, else push value and recurse left, right.
- **Deserialize:** single global index (or iterator); if token is `"null"` return null; else create node, set left = build(), right = build(), return node.

#### Extensions / Variants

- **Serialize/Deserialize BST:** can encode without nulls by encoding range (smaller footprint).
- **Codec design:** same pattern for “save/load” tree in automation or tools.

---

## Summary Table

| #  | Title                          | Level  | Main idea           | Time   | Space  |
|----|--------------------------------|--------|---------------------|--------|--------|
| 1  | Two Sum                        | Easy   | Hash map            | O(n)   | O(n)   |
| 2  | Valid Palindrome               | Easy   | Two pointers        | O(n)   | O(1)   |
| 3  | Merge Two Sorted Lists         | Easy   | Dummy head          | O(n+m) | O(1)   |
| 4  | Maximum Subarray               | Easy   | Kadane              | O(n)   | O(1)   |
| 5  | Valid Parentheses              | Easy   | Stack               | O(n)   | O(n)   |
| 6  | Add Two Numbers                | Medium | Simulate add        | O(n+m) | O(1)*  |
| 7  | Longest Substring No Repeat    | Medium | Sliding window+Set  | O(n)   | O(n)   |
| 8  | Container With Most Water      | Medium | Two pointers        | O(n)   | O(1)   |
| 9  | 3Sum                           | Medium | Sort + two pointers | O(n²)  | O(1)*  |
| 10 | Group Anagrams                 | Medium | Hash by key         | O(n k) | O(n k) |
| 11 | Binary Tree Level Order        | Medium | BFS                 | O(n)   | O(n)   |
| 12 | Product of Array Except Self   | Medium | Prefix/suffix       | O(n)   | O(1)*  |
| 13 | Search Rotated Sorted Array    | Medium | Binary search       | O(log n)| O(1)  |
| 14 | Number of Islands              | Medium | DFS/BFS             | O(RC)  | O(RC)  |
| 15 | LRU Cache                      | Medium | Map + DLL           | O(1)   | O(k)   |
| 16 | Merge k Sorted Lists           | Hard   | Heap or D&C         | O(N log k) | O(log k) |
| 17 | Serialize/Deserialize Tree     | Hard   | Preorder + null     | O(n)   | O(n)   |

\* Excluding output/input space as per problem.

Good luck with your mid–senior automation interview.
