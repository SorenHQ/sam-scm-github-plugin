export default [
  {
    name: "github",
    title: "GitHub",
    description: "GitHub cloud repository and CI/CD service provider",
    baseUrl: "https://api.github.com",
    isEnabled: true,
    features: ["repository", "cicd", "issues", "pullRequests"],
  },
  {
    name: "gitlab",
    title: "GitLab",
    description: "GitLab cloud repository and CI/CD service provider",
    baseUrl: "https://gitlab.com/api/v4",
    isEnabled: false,
    features: ["repository", "cicd", "issues", "mergeRequests"],
  },
  {
    name: "bitbucket",
    title: "Bitbucket",
    description: "Bitbucket cloud repository and CI/CD service provider",
    baseUrl: "https://api.bitbucket.org/2.0",
    isEnabled: false,
    features: ["repository", "cicd", "issues", "pullRequests"],
  },
];
