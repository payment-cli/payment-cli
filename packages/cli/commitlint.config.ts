module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "header-max-length": [2, "always", 100],
    "type-enum": [
      2,
      "always",
      ["feat", "fix", "docs", "style", "refactor", "perf", "test", "chore"],
    ],
    "type-case": [2, "always", "lower-case"],
    "type-empty": [2, "never"],
    "scope-case": [2, "always", "kebab-case"],
    "scope-empty": [2, "never"],
    "subject-case": [2, "always", "sentence-case"],
    "subject-full-stop": [2, "never", "."],
    "subject-empty": [2, "never"],
    "subject-min-length": [2, "always", 1],
  },
};
