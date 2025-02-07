export default {
  apiBaseUrl: "https://gitlab.com/api/v4",
  auth: {
    tokenType: "private",
    scope: ["api", "read_repository", "write_repository", "read_api"],
  },
  rateLimit: {
    enabled: true,
    maxRequests: 2000,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
  storage: {
    dir: "./storage/gitlab-cache",
  },
};
