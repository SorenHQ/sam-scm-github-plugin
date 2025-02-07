import axios from "axios";
import ConfigManager from "../../core/ConfigManager.js";
import BaseProvider from "../base.provider.js";
import githubConfig from "../../config/github.config.js";
import AppError from "../../core/errors/AppError.js";

export default class GithubProvider extends BaseProvider {
  constructor() {
    super(githubConfig);
    this.client = null;
    this.owner = "";
  }

  async init() {
    try {
      const configs = ConfigManager.getConfig("github_config");
      const token =
        configs?.params?.find((par) => par?.key === "token")?.value[0] || "";
      this.owner =
        configs?.params?.find((par) => par?.key === "owner")?.value[0] || "";

      if (!token) {
        throw new AppError(
          "GitHub token not found in configurations",
          401,
          "AUTH_FAILED"
        );
      }

      if (!this.owner) {
        throw new AppError(
          "GitHub owner (account username) not found in configurations",
          401,
          "AUTH_FAILED"
        );
      }

      await this.createClient(token);
    } catch (error) {
      if (
        error.statusCode === "401" ||
        error.response?.status === 401 ||
        error.statusCode === 401
      ) {
        throw error;
      }
      throw new AppError("Failed to initialize GitHub provider", 500);
    }
  }

  async createClient(token) {
    try {
      // Guard Clause: If there is no error neither provider or cached, there is authentication issue
      if (!token)
        throw new AppError("GitHub authentication failed", 401, "AUTH_FAILED");

      this.client = axios.create({
        baseURL: this.config.apiBaseUrl,
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": this.config.apiVersion,
        },
      });

      const { data } = await this.client.get("/user");

      return data;
    } catch (error) {
      throw error;
    }
  }

  async actionUpdatePluginConfig(options = {}) {
    try {
      const newConfigs = options.configs;

      // Save the entire new configuration
      await ConfigManager.saveConfigs(newConfigs);

      // Reinitialize the provider since configs changed
      await this.init();

      return {
        message: "Configuration updated successfully",
        configs: newConfigs,
      };
    } catch (error) {
      throw new AppError(
        "Failed to update plugin configuration",
        500,
        "CONFIG_UPDATE_FAILED"
      );
    }
  }

  async actionListRepos(options = {}) {
    try {
      options = options?.configs?.params || [];
      const visibility =
        options?.find((par) => par.key === "visibility")?.value[0] || "all";
      const sort =
        options?.find((par) => par.key === "sort")?.value[0] || "updated";
      const page = options?.find((par) => par.key === "page")?.value[0] || 1;

      const { data } = await this.client.get("/user/repos", {
        params: {
          visibility: visibility,
          sort: sort,
          per_page: 50,
          page: page,
        },
      });

      return data;
    } catch (error) {
      if (error.response?.status === 404 || error.statusCode === 404) {
        throw new AppError("Resources not found", 404, "RESOURCE_NOT_FOUND");
      }
      if (error.response?.status === 400 || error.statusCode === 400) {
        throw error;
      }
      throw new AppError(
        "Failed to fetch repositories",
        500,
        "FETCH_REPOS_FAILED"
      );
    }
  }

  async actionGetRepo(options = {}) {
    try {
      options = options?.configs?.params || [];
      const repoName =
        options?.find((par) => par.key === "repoName")?.value[0]?.trim() || "";

      if (!repoName) {
        throw new AppError(
          "Repository name is required",
          400,
          "MISSING_REQUIRED_PARAMS"
        );
      }

      const { data } = await this.client.get(
        `/repos/${this.owner}/${repoName}`
      );

      return data;
    } catch (error) {
      if (error.response?.status === 404 || error.statusCode === 404) {
        throw new AppError("Repository not found", 404, "REPOSITORY_NOT_FOUND");
      }
      if (error.response?.status === 400 || error.statusCode === 400) {
        throw error;
      }
      throw new AppError(
        "Failed to fetch repository",
        500,
        "FETCH_REPO_FAILED"
      );
    }
  }

  async actionListRepoContents(options = {}) {
    try {
      options = options?.configs?.params || [];
      const repoName =
        options?.find((par) => par.key === "repoName")?.value[0]?.trim() || "";
      const path =
        options?.find((par) => par.key === "path")?.value[0]?.trim() || "";
      const ref =
        options?.find((par) => par.key === "ref")?.value[0]?.trim() || "";

      if (!repoName) {
        throw new AppError(
          "Repository name is required",
          400,
          "MISSING_REQUIRED_PARAMS"
        );
      }

      const params = {
        ref: ref || undefined,
      };

      const { data } = await this.client.get(
        `/repos/${this.owner}/${repoName}/contents/${path}`,
        {
          params,
        }
      );

      return data;
    } catch (error) {
      if (error.response?.status === 404 || error.statusCode === 404) {
        throw new AppError(
          "Repository path or reference not found",
          404,
          "RESOURCE_NOT_FOUND"
        );
      }
      if (error.response?.status === 400 || error.statusCode === 400) {
        throw error;
      }
      throw new AppError(
        "Failed to fetch repository contents",
        500,
        "FETCH_CONTENTS_FAILED"
      );
    }
  }

  async actionGetRepoFileContent(options = {}) {
    try {
      options = options?.configs?.params || [];
      const repoName =
        options?.find((par) => par.key === "repoName")?.value[0]?.trim() || "";
      const path =
        options?.find((par) => par.key === "path")?.value[0]?.trim() || "";
      const ref =
        options?.find((par) => par.key === "ref")?.value[0]?.trim() || "";

      if (!repoName || !path) {
        throw new AppError(
          "Repository name and file path are required",
          400,
          "MISSING_REQUIRED_PARAMS"
        );
      }

      const params = {
        ref: ref || undefined,
      };

      const { data } = await this.client.get(
        `/repos/${this.owner}/${repoName}/contents/${path}`,
        {
          params,
        }
      );

      return data;
    } catch (error) {
      if (error.response?.status === 404 || error.statusCode === 404) {
        throw new AppError(
          "File not found or inaccessible",
          404,
          "RESOURCE_NOT_FOUND"
        );
      }
      if (error.response?.status === 400 || error.statusCode === 400) {
        throw error;
      }
      throw new AppError(
        "Failed to fetch file content",
        500,
        "FETCH_CONTENT_FAILED"
      );
    }
  }

  async actionListBranches(options = {}) {
    try {
      options = options?.configs?.params || [];
      const repoName =
        options?.find((par) => par.key === "repoName")?.value[0]?.trim() || "";

      if (!repoName) {
        throw new AppError(
          "Repository name is required",
          400,
          "MISSING_REQUIRED_PARAMS"
        );
      }

      const { data } = await this.client.get(
        `/repos/${this.owner}/${repoName}/branches`
      );

      return data;
    } catch (error) {
      if (error.response?.status === 404 || error.statusCode === 404) {
        throw new AppError("Repository not found", 404, "REPOSITORY_NOT_FOUND");
      }
      if (error.response?.status === 400 || error.statusCode === 400) {
        throw error;
      }
      throw new AppError(
        "Failed to fetch branches",
        500,
        "FETCH_BRANCHES_FAILED"
      );
    }
  }

  async actionListBranchCommits(options = {}) {
    try {
      options = options?.configs?.params || [];
      const repoName =
        options?.find((par) => par.key === "repoName")?.value[0]?.trim() || "";
      const branch =
        options?.find((par) => par.key === "branch")?.value[0]?.trim() || "";

      if (!repoName) {
        throw new AppError(
          "Repository name is required",
          400,
          "MISSING_REQUIRED_PARAMS"
        );
      }

      const params = {
        sha: branch || undefined,
      };

      const { data } = await this.client.get(
        `/repos/${this.owner}/${repoName}/commits`,
        {
          params,
        }
      );

      return data;
    } catch (error) {
      if (error.response?.status === 404 || error.statusCode === 404) {
        throw new AppError(
          "Branch or repository not found",
          404,
          "RESOURCE_NOT_FOUND"
        );
      }
      if (error.response?.status === 400 || error.statusCode === 400) {
        throw error;
      }
      throw new AppError(
        "Failed to fetch commits",
        500,
        "FETCH_COMMITS_FAILED"
      );
    }
  }

  async actionListCommitModifications(options = {}) {
    try {
      options = options?.configs?.params || [];
      const repoName =
        options?.find((par) => par.key === "repoName").value[0].trim() || "";
      const commitSha =
        options?.find((par) => par.key === "commitSha").value[0].trim() || "";
      const includeContent =
        options?.find((par) => par.key === "includeContent")?.value[0] || false;

      if (!repoName || !commitSha) {
        throw new AppError(
          "Repository name and commit SHA are required",
          400,
          "MISSING_REQUIRED_PARAMS"
        );
      }

      const { data } = await this.client.get(
        `/repos/${this.owner}/${repoName}/commits/${commitSha}`
      );

      if (!includeContent) {
        return data.files.map((file) => ({
          filename: file.filename,
          status: file.status,
          additions: file.additions,
          deletions: file.deletions,
          changes: file.changes,
        }));
      }

      return data.files;
    } catch (error) {
      if (error.response?.status === 404 || error.statusCode === 404) {
        throw new AppError(
          "Commit or repository not found",
          404,
          "RESOURCE_NOT_FOUND"
        );
      }
      if (error.response?.status === 400 || error.statusCode === 400) {
        throw error;
      }
      throw new AppError(
        "Failed to fetch commit modifications",
        500,
        "FETCH_MODIFICATIONS_FAILED"
      );
    }
  }

  async actionGetCommitDetails(options = {}) {
    try {
      options = options?.configs?.params || [];
      const repoName =
        options?.find((par) => par.key === "repoName")?.value[0]?.trim() || "";
      const commitSha =
        options?.find((par) => par.key === "commitSha")?.value[0]?.trim() || "";

      if (!repoName || !commitSha) {
        throw new AppError(
          "Repository name and commit SHA are required",
          400,
          "MISSING_REQUIRED_PARAMS"
        );
      }

      const { data } = await this.client.get(
        `/repos/${this.owner}/${repoName}/commits/${commitSha}`
      );

      return {
        sha: data.sha,
        author: data.author,
        committer: data.committer,
        commit: {
          message: data.commit.message,
          author: data.commit.author,
          committer: data.commit.committer,
          verification: data.commit.verification,
        },
        stats: data.stats,
        files: data.files,
        parents: data.parents,
        html_url: data.html_url,
      };
    } catch (error) {
      if (error.response?.status === 404 || error.statusCode === 404) {
        throw new AppError(
          "Commit or repository not found",
          404,
          "RESOURCE_NOT_FOUND"
        );
      }
      if (error.response?.status === 400 || error.statusCode === 400) {
        throw error;
      }
      throw new AppError(
        "Failed to fetch commit details",
        500,
        "FETCH_COMMIT_DETAILS_FAILED"
      );
    }
  }

  async actionCommitsDiff(options = {}) {
    try {
      options = options?.configs?.params || [];
      const repoName =
        options?.find((par) => par.key === "repoName")?.value[0]?.trim() || "";
      const baseCommit =
        options?.find((par) => par.key === "baseCommit")?.value[0]?.trim() ||
        "";
      const headCommit =
        options?.find((par) => par.key === "headCommit")?.value[0]?.trim() ||
        "";
      const filePath = options
        ?.find((par) => par.key === "filePath")
        ?.value[0]?.trim();

      if (!repoName || !baseCommit || !headCommit) {
        throw new AppError(
          "Repository name, base commit and head commit are required",
          400,
          "MISSING_REQUIRED_PARAMS"
        );
      }

      const { data } = await this.client.get(
        `/repos/${this.owner}/${repoName}/compare/${baseCommit}...${headCommit}`,
        {
          params: {
            path: filePath || undefined,
          },
        }
      );

      return data;
    } catch (error) {
      if (error.response?.status === 404 || error.statusCode === 404) {
        throw new AppError(
          "Repository or commits not found",
          404,
          "RESOURCE_NOT_FOUND"
        );
      }
      if (error.response?.status === 400 || error.statusCode === 400) {
        throw error;
      }
      throw new AppError(
        "Failed to compare commits",
        500,
        "COMPARE_COMMITS_FAILED"
      );
    }
  }

  async actionCommentPrs(options = {}) {
    try {
      options = options?.configs?.params || [];
      const repoName =
        options?.find((par) => par.key === "repoName")?.value[0]?.trim() || "";
      const prNumber =
        options?.find((par) => par.key === "prNumber")?.value[0]?.trim() || "";
      const comment =
        options?.find((par) => par.key === "comment")?.value[0]?.trim() || "";

      if (!repoName || !prNumber || !comment) {
        throw new AppError(
          "Repository name, PR number and comment text are required",
          400,
          "MISSING_REQUIRED_PARAMS"
        );
      }

      const { data } = await this.client.post(
        `/repos/${this.owner}/${repoName}/issues/${prNumber}/comments`,
        { body: comment }
      );

      return data;
    } catch (error) {
      if (error.response?.status === 404 || error.statusCode === 404) {
        throw new AppError(
          "Pull request or repository not found",
          404,
          "RESOURCE_NOT_FOUND"
        );
      }
      if (error.response?.status === 400 || error.statusCode === 400) {
        throw error;
      }
      throw new AppError(
        "Failed to create PR comment",
        500,
        "CREATE_COMMENT_FAILED"
      );
    }
  }

  async actionListPipelines(options = {}) {
    try {
      options = options?.configs?.params || [];
      const repoName =
        options?.find((par) => par.key === "repoName")?.value[0]?.trim() || "";

      if (!repoName) {
        throw new AppError(
          "Repository name is required",
          400,
          "MISSING_REQUIRED_PARAMS"
        );
      }

      const { data } = await this.client.get(
        `/repos/${this.owner}/${repoName}/methods/workflows`
      );

      return data;
    } catch (error) {
      if (error.response?.status === 404 || error.statusCode === 404) {
        throw new AppError("Repository not found", 404, "RESOURCE_NOT_FOUND");
      }
      if (error.response?.status === 400 || error.statusCode === 400) {
        throw error;
      }
      throw new AppError(
        "Failed to fetch pipelines",
        500,
        "FETCH_PIPELINES_FAILED"
      );
    }
  }

  async actionListDeployments(options = {}) {
    try {
      options = options?.configs?.params || [];
      const repoName =
        options?.find((par) => par.key === "repoName")?.value[0]?.trim() || "";

      if (!repoName) {
        throw new AppError(
          "Repository name is required",
          400,
          "MISSING_REQUIRED_PARAMS"
        );
      }

      const { data } = await this.client.get(
        `/repos/${this.owner}/${repoName}/deployments`
      );

      return data;
    } catch (error) {
      if (error.response?.status === 404 || error.statusCode === 404) {
        throw new AppError("Repository not found", 404, "RESOURCE_NOT_FOUND");
      }
      if (error.response?.status === 400 || error.statusCode === 400) {
        throw error;
      }
      throw new AppError(
        "Failed to fetch deployments",
        500,
        "FETCH_DEPLOYMENTS_FAILED"
      );
    }
  }
}
