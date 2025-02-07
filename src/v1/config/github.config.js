export default {
  apiBaseUrl: "https://api.github.com",
  apiVersion: "2022-11-28",
  auth: {
    tokenType: "bearer",
    scope: ["repo", "read:user", "read:org"],
  },
  rateLimit: {
    enabled: true,
    maxRequests: 5000,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
  storage: {
    dir: "./storage/github-cache",
  },
};
