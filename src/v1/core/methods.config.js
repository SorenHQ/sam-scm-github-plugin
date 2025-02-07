export default {
  // Top level plugin information
  name: "scm_github", // Unique identifier for the method`
  title: "SCM Github Provider Integration", // Human-readable plugin title
  description:
    "List of all available methods for this integration, with required configs.", // Plugin description
  methods: [
    {
      name: "list-repos",
      title: "List Repositories",
      description: "List all repositories (50/page) of your selected SCM",
      params: [
        {
          attr: {
            regex_pattern: null,
            input_type: "string",
            secret: false,
            required: true,
          },
          key: "owner",
          placeholder: "Enter account username (owner): dear-john",
          value: [""],
          title: "Username (owner)",
          description:
            "Enter SCM provider account username (owner) to get repositories for.",
        },
        {
          attr: {
            regex_pattern: null,
            input_type: "string",
            secret: false,
            required: false,
          },
          options: [
            { value: "all", title: "All" },
            { value: "public", title: "Public" },
            { value: "private", title: "Private" },
          ],
          key: "visibility",
          placeholder: "Select repository visibility",
          value: ["all"],
          title: "Repository Visibility",
          description:
            "Filter repositories by visibility (all, public, private)",
        },
        {
          attr: {
            regex_pattern: null,
            input_type: "string",
            secret: false,
            required: true,
          },
          options: [
            { value: "created", title: "Created" },
            { value: "updated", title: "Updated" },
            { value: "pushed", title: "Pushed" },
            { value: "full_name", title: "Full Name" },
          ],
          key: "sort",
          placeholder: "Select sorting criteria",
          value: ["updated"],
          title: "Sort By",
          description:
            "Sort repositories by (created, updated, pushed, full_name)",
        },
        {
          attr: {
            regex_pattern: null,
            input_type: "number",
            secret: false,
            required: false,
          },
          key: "page",
          placeholder: "Enter page number",
          value: [1],
          title: "Page Number",
          description: "Page number for paginated results",
        },
      ],
    },

    {
      name: "get-repo-file-content",
      title: "Get the File (Content)",
      description: "Fetch contents of the file within a specific repository",
      params: [
        {
          attr: {
            regex_pattern: null,
            input_type: "string",
            secret: false,
            required: true,
          },
          key: "repoName",
          placeholder: "Enter repository name",
          value: [""],
          title: "Repository Name",
          description: "The name of the repository to fetch details for",
        },
        {
          attr: {
            regex_pattern: null,
            input_type: "string",
            secret: false,
            required: true,
          },
          key: "path",
          placeholder: "Enter file path",
          value: [""],
          title: "Path (File Name)",
          description:
            "The name of the file (path) in repository to fetch data for",
        },
      ],
    },

    {
      name: "list-repo-branches",
      title: "List Repository Branches",
      description: "List all branches within a specific repository",
      params: [
        {
          attr: {
            regex_pattern: null,
            input_type: "string",
            secret: false,
            required: true,
          },
          key: "repoName",
          placeholder: "Enter repository name",
          value: [""],
          title: "Repository Name",
          description: "The name of the repository to fetch branches from",
        },
      ],
    },

    {
      name: "list-branch-commits",
      title: "List Branch Commits",
      description: "List all commits within a specific branch of a repository",
      params: [
        {
          attr: {
            regex_pattern: null,
            input_type: "string",
            secret: false,
            required: true,
          },
          key: "repoName",
          placeholder: "Enter repository name",
          value: [""],
          title: "Repository Name",
          description: "The name of the repository to fetch commits from",
        },
        {
          attr: {
            regex_pattern: null,
            input_type: "string",
            secret: false,
            required: true,
          },
          key: "branch",
          placeholder: "Enter branch name",
          value: [""],
          title: "Branch Name",
          description: "The name of the branch to fetch commits from",
        },
      ],
    },

    {
      name: "list-commit-modifications",
      title: "Get Commit Modifications",
      description:
        "List all files that have been modified within a specific commit",
      params: [
        {
          attr: {
            regex_pattern: null,
            input_type: "string",
            secret: false,
            required: true,
          },
          key: "repoName",
          placeholder: "Enter repository name",
          value: [""],
          title: "Repository Name",
          description:
            "The name of the repository to fetch commit modifications from",
        },
        {
          attr: {
            regex_pattern: null,
            input_type: "string",
            secret: false,
            required: true,
          },
          key: "commitSha",
          placeholder: "Enter commit SHA",
          value: [""],
          title: "Commit SHA",
          description: "The SHA of the commit to fetch modifications for",
        },
        {
          attr: {
            regex_pattern: null,
            input_type: "checkbox",
            secret: false,
            required: false,
          },
          key: "includeContent",
          placeholder: "Include diff content",
          value: [false],
          title: "Include Content (Only for BitBucket)",
          description: "Include the actual diff content in the response",
        },
      ],
    },

    {
      name: "get-commit-details",
      title: "Get Commit Details",
      description:
        "Retrieve detailed information about a specific commit including stats, author details, and verification status",
      params: [
        {
          attr: {
            regex_pattern: null,
            input_type: "string",
            secret: false,
            required: true,
          },
          key: "repoName",
          placeholder: "Enter repository name",
          value: [""],
          title: "Repository Name",
          description: "The name of the repository containing the commit",
        },
        {
          attr: {
            regex_pattern: null,
            input_type: "string",
            secret: false,
            required: true,
          },
          key: "commitSha",
          placeholder: "Enter full commit SHA",
          value: [""],
          title: "Commit SHA",
          description: "The full SHA hash of the commit to retrieve",
        },
      ],
    },

    {
      name: "commits-diff",
      title: "Compare Commits (Diff)",
      description: "Compare two commits and get their differences",
      params: [
        {
          attr: {
            regex_pattern: null,
            input_type: "string",
            secret: false,
            required: true,
          },
          key: "repoName",
          placeholder: "Enter repository name",
          value: [""],
          title: "Repository Name",
          description: "The name of the repository to compare commits from",
        },
        {
          attr: {
            regex_pattern: null,
            input_type: "string",
            secret: false,
            required: true,
          },
          key: "baseCommit",
          placeholder: "Enter base commit hash (previous commit in the past)",
          value: [""],
          title: "Base Commit",
          description: "The base commit hash to compare from",
        },
        {
          attr: {
            regex_pattern: null,
            input_type: "string",
            secret: false,
            required: true,
          },
          key: "headCommit",
          placeholder: "Enter head commit hash",
          value: [""],
          title: "Head Commit",
          description: "The head commit hash to compare to (current hash)",
        },
        {
          attr: {
            regex_pattern: null,
            input_type: "string",
            secret: false,
            required: false,
          },
          key: "filePath",
          placeholder: "Enter file path (optional)",
          value: [""],
          title: "File Path",
          description:
            "Optional: Specific file path to compare between commits",
        },
      ],
    },

    {
      name: "comment-prs",
      title: "Comment on Pull Requests",
      description: "Create a new comment on a specific pull request",
      params: [
        {
          attr: {
            regex_pattern: null,
            input_type: "string",
            secret: false,
            required: true,
          },
          key: "repoName",
          placeholder: "Enter repository name",
          value: [""],
          title: "Repository Name",
          description: "The name of the repository containing the pull request",
        },
        {
          attr: {
            regex_pattern: null,
            input_type: "string",
            secret: false,
            required: true,
          },
          key: "prNumber",
          placeholder: "Enter PR number",
          value: [""],
          title: "Pull Request Number",
          description: "The number of the pull request to comment on",
        },
        {
          attr: {
            regex_pattern: null,
            input_type: "string",
            secret: false,
            required: true,
          },
          key: "comment",
          placeholder: "Enter your comment",
          value: [""],
          title: "Comment",
          description: "The comment text to add to the pull request",
        },
      ],
    },

    {
      name: "list-pipelines",
      title: "List Pipelines",
      description:
        "List all pipelines (GitHub Methods workflows) in a repository",
      params: [
        {
          attr: {
            regex_pattern: null,
            input_type: "string",
            secret: false,
            required: true,
          },
          key: "repoName",
          placeholder: "Enter repository name",
          value: [""],
          title: "Repository Name",
          description: "The name of the repository to list pipelines from",
        },
      ],
    },

    {
      name: "list-deployments",
      title: "List Deployments",
      description: "List all deployments for a repository",
      params: [
        {
          attr: {
            regex_pattern: null,
            input_type: "string",
            secret: false,
            required: true,
          },
          key: "repoName",
          placeholder: "Enter repository name",
          value: [""],
          title: "Repository Name",
          description: "The name of the repository to list deployments from",
        },
      ],
    },

    // End of list of methods configs
  ],
};
