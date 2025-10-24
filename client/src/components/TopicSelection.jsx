// components/TopicSelection.jsx
import { useState } from 'react';
import { Code2, ChevronRight, Loader2 } from 'lucide-react';

export default function TopicSelection({ onTopicSelect }) {
  const [loading, setLoading] = useState(false);

  // ONLY DSA topics with the exact questions & prompts you provided
  const topics = [
    {
      id: 1,
      name: 'Arrays',
      description: 'Easy — fundamental array problems',
      subtopics: [
        {
          name: 'Arrays (Easy)',
          questions: [
            {
              title: 'Intersection of Two Arrays',
              difficulty: 'Easy',
              prompt: `Given two integer arrays nums1 and nums2, return an array of their intersection. Each element in the result must be unique and you may return the result in any order.

Example 1:
Input: nums1 = [1,2,2,1], nums2 = [2,2]
Output: [2]

Example 2:
Input: nums1 = [4,9,5], nums2 = [9,4,9,8,4]
Output: [9,4]
Explanation: [4,9] is also accepted.

Constraints:
1 <= nums1.length, nums2.length <= 1000
0 <= nums1[i], nums2[i] <= 1000.`,
            },
            {
              title: 'Transform Array by Parity',
              difficulty: 'Easy',
              prompt: `You are given an integer array nums. Transform nums by performing the following operations in the exact order specified:

1) Replace each even number with 0.
2) Replace each odd number with 1.
3) Sort the modified array in non-decreasing order.

Return the resulting array after performing these operations.

Example 1:
Input: nums = [4,3,2,1]
Output: [0,0,1,1]

Example 2:
Input: nums = [1,5,1,4,2]
Output: [0,0,1,1,1]

Constraints:
1 <= nums.length <= 100
1 <= nums[i] <= 1000.`,
            },
          ],
        },
      ],
    },
    {
      id: 2,
      name: 'Linked Lists',
      description: 'Easy — classic linked-list questions',
      subtopics: [
        {
          name: 'Linked Lists (Easy)',
          questions: [
            {
              title: 'Linked List Cycle',
              difficulty: 'Easy',
              prompt: `Given head, the head of a linked list, determine if the linked list has a cycle in it.

There is a cycle in a linked list if there is some node in the list that can be reached again by continuously following the next pointer. Internally, pos is used to denote the index of the node that tail's next pointer is connected to. Note that pos is not passed as a parameter.

Return true if there is a cycle in the linked list. Otherwise, return false.

Example 1:
Input: head = [3,2,0,-4], pos = 1
Output: true

Example 2:
Input: head = [1,2], pos = 0
Output: true

Example 3:
Input: head = [1], pos = -1
Output: false

Constraints:
The number of the nodes in the list is in the range [0, 10^4].
-10^5 <= Node.val <= 10^5
pos is -1 or a valid index in the linked-list.`,
            },
            {
              title: 'Reverse Linked List',
              difficulty: 'Easy',
              prompt: `Given the head of a singly linked list, reverse the list, and return the reversed list.

Example 1:
Input: head = [1,2,3,4,5]
Output: [5,4,3,2,1]

Example 2:
Input: head = [1,2]
Output: [2,1]

Example 3:
Input: head = []
Output: []

Constraints:
The number of nodes in the list is in the range [0, 5000].
-5000 <= Node.val <= 5000.`,
            },
          ],
        },
      ],
    },
    {
      id: 3,
      name: 'Bit Manipulation',
      description: 'Easy — bitwise puzzles',
      subtopics: [
        {
          name: 'Bit Manipulation (Easy)',
          questions: [
            {
              title: 'Single Number',
              difficulty: 'Easy',
              prompt: `Given a non-empty array of integers nums, every element appears twice except for one. Find that single one.

You must implement a solution with a linear runtime complexity and use only constant extra space.

Example 1:
Input: nums = [2,2,1]
Output: 1

Example 2:
Input: nums = [4,1,2,1,2]
Output: 4

Example 3:
Input: nums = [1]
Output: 1

Constraints:
1 <= nums.length <= 3 * 10^4
-3 * 10^4 <= nums[i] <= 3 * 10^4
Each element in the array appears twice except for one element which appears only once.`,
            },
            {
              title: 'Hamming Distance',
              difficulty: 'Easy',
              prompt: `The Hamming distance between two integers is the number of positions at which the corresponding bits are different.

Given two integers x and y, return the Hamming distance between them.

Example 1:
Input: x = 1, y = 4
Output: 2

Example 2:
Input: x = 3, y = 1
Output: 1

Constraints:
0 <= x, y <= 2^31 - 1.`,
            },
          ],
        },
      ],
    },
    {
      id: 4,
      name: 'Tree',
      description: 'Easy — basic binary tree problems',
      subtopics: [
        {
          name: 'Tree (Easy)',
          questions: [
            {
              title: 'Diameter of Binary Tree',
              difficulty: 'Easy',
              prompt: `Given the root of a binary tree, return the length of the diameter of the tree.

The diameter of a binary tree is the length of the longest path between any two nodes in a tree. This path may or may not pass through the root.

The length of a path between two nodes is represented by the number of edges between them.

Example 1:
Input: root = [1,2,3,4,5]
Output: 3
Explanation: 3 is the length of the path [4,2,1,3] or [5,2,1,3].

Constraints:
The number of nodes in the tree is in the range [1, 10^4].
-100 <= Node.val <= 100.`,
            },
            {
              title: 'Symmetric Tree',
              difficulty: 'Easy',
              prompt: `Given the root of a binary tree, check whether it is a mirror of itself (i.e., symmetric around its center).

Example 1:
Input: root = [1,2,2,3,4,4,3]
Output: true

Example 2:
Input: root = [1,2,2,null,3,null,3]
Output: false

Constraints:
The number of nodes in the tree is in the range [1, 1000].
-100 <= Node.val <= 100.`,
            },
          ],
        },
      ],
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Code2 className="w-12 h-12 text-blue-400" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Smart Online Interviewer</h1>
          <p className="text-slate-400 text-lg">Select a topic to begin your technical interview</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {topics.map((topic) => (
            <button
              key={topic.id}
              onClick={() => onTopicSelect(topic)}
              className="group relative bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 text-left hover:border-blue-400 hover:bg-slate-800/80 transition-all duration-300 hover:shadow-lg hover:shadow-blue-400/20 hover:scale-105"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-1 group-hover:text-blue-400 transition-colors">
                    {topic.name}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{topic.description}</p>
                </div>
                <ChevronRight className="w-6 h-6 text-slate-600 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
              </div>

              <div className="mt-4 text-xs text-slate-300">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                  <span>Ready to start</span>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-slate-500 text-sm">Make sure you have a stable internet connection and a quiet environment</p>
        </div>
      </div>
    </div>
  );
}
