export type CatalogProblem = {
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  topicTags: string[];
};

// This is a small built-in list of practice problems
// that the recommendation system can choose from.
export const problemCatalog: CatalogProblem[] = [
  { title: "Two Sum", difficulty: "Easy", topicTags: ["arrays", "hash map"] },
  { title: "Valid Parentheses", difficulty: "Easy", topicTags: ["stack", "strings"] },
  { title: "Binary Tree Level Order Traversal", difficulty: "Medium", topicTags: ["trees", "bfs"] },
  { title: "Longest Substring Without Repeating Characters", difficulty: "Medium", topicTags: ["strings", "sliding window"] },
  { title: "Coin Change", difficulty: "Medium", topicTags: ["dp"] },
  { title: "Course Schedule", difficulty: "Medium", topicTags: ["graphs", "topological sort"] },
  { title: "Number of Islands", difficulty: "Medium", topicTags: ["graphs", "dfs"] },
  { title: "Longest Increasing Subsequence", difficulty: "Medium", topicTags: ["dp", "binary search"] },
  { title: "Merge Intervals", difficulty: "Medium", topicTags: ["intervals", "arrays"] },
  { title: "Lowest Common Ancestor of a Binary Tree", difficulty: "Medium", topicTags: ["trees", "recursion"] },
  { title: "Word Break", difficulty: "Medium", topicTags: ["dp", "strings"] },
  { title: "LRU Cache", difficulty: "Medium", topicTags: ["design", "hash map"] },
  { title: "Trapping Rain Water", difficulty: "Hard", topicTags: ["arrays", "two pointers"] },
  { title: "Serialize and Deserialize Binary Tree", difficulty: "Hard", topicTags: ["trees", "design"] },
  { title: "Edit Distance", difficulty: "Hard", topicTags: ["dp", "strings"] },
  { title: "Alien Dictionary", difficulty: "Hard", topicTags: ["graphs", "topological sort"] }
];
