export default [
  {
    actionName: "list-repos",
    actionDesc:
      "The method for fetching all repositories of the github account.",
    actionTitle: "List all Repositories",
  },
  {
    actionName: "get-repo",
    actionDesc:
      "Fetch detailed information about a specific GitHub repository.",
    actionTitle: "Get a Specific Repository",
  },
  {
    actionName: "list-repo-contents",
    actionDesc:
      "List all files and directories in a GitHub repository with optional specific branch and commit.",
    actionTitle: "List Contents of the Repository",
  },
  {
    actionName: "get-repo-file-content",
    actionDesc:
      "Fetch contents of a specific file from a GitHub repository with optional specific branch and commit.",
    actionTitle: "Get the File Content",
  },
  {
    actionName: "list-repo-branches",
    actionDesc: "List all the branches within a repository.",
    actionTitle: "List all Branches",
  },
  {
    actionName: "list-branch-commits",
    actionDesc: "List the brief version of all commits within a branch.",
    actionTitle: "List all Commits of Branch",
  },
  {
    actionName: "list-commit-modifications",
    actionDesc: "List modified files within a specific commit.",
    actionTitle: "Commit Modified List",
  },
  {
    actionName: "get-commit-details",
    actionDesc: "Get detailed information of a specific commit.",
    actionTitle: "Commit Detailed Info",
  },
  {
    actionName: "commits-diff",
    actionDesc: "Compare diff between 2 commits.",
    actionTitle: "Get Diff",
  },
  {
    actionName: "comment-prs",
    actionDesc: "Create comment under pull requests (PRs).",
    actionTitle: "Comment under PRs",
  },
  {
    actionName: "list-pipelines",
    actionDesc: "List all the pipe-lines of the repository.",
    actionTitle: "List the Pipelines",
  },
  {
    actionName: "list-deployments",
    actionDesc: "List all the deployments of the repository.",
    actionTitle: "List the Deployments",
  },
];
