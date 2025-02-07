import axios from "axios";
import ConfigManager from "../../core/ConfigManager.js";
import BaseProvider from "../base.provider.js";
import bitbucketConfig from "../../config/bitbucket.config.js";
import AppError from "../../core/errors/AppError.js";

export default class BitbucketProvider extends BaseProvider {
  constructor() {
    super(bitbucketConfig);
    this.client = null;
    this.owner = "";
  }

  async init() {
    try {
      const configs = ConfigManager.getConfig("bitbucket_config");
      const username =
        configs?.params?.find((par) => par?.key === "username")?.value || "";
      const appPassword =
        configs?.params?.find((par) => par?.key === "appPassword")?.value || "";
      this.owner =
        configs?.params?.find((par) => par?.key === "owner")?.value || "";

      if (!username || !appPassword) {
        throw new AppError(
          "Bitbucket credentials not found",
          401,
          "AUTH_FAILED"
        );
      }

      await this.createClient(username, appPassword);
    } catch (error) {
      if (error.response?.status === 401 || error.statusCode === 401)
        throw error;
      throw new AppError("Failed to initialize Bitbucket provider", 500);
    }
  }

  async createClient(username, appPassword) {
    try {
      this.client = axios.create({
        baseURL: this.config.apiBaseUrl,
        auth: {
          username,
          password: appPassword,
        },
        headers: {
          Accept: "application/json",
        },
      });

      const { data } = await this.client.get("/user");
      return data;
    } catch (error) {
      throw new AppError("Bitbucket authentication failed", 401, "AUTH_FAILED");
    }
  }

  async actionListBitbucketWorkspaces(options = {}) {
    try {
      options = options?.configs?.params || [];
      const page = options?.find((par) => par.key === "page")?.value[0] || 1;
      const role =
        options?.find((par) => par.key === "role")?.value[0] || "member";

      const { data } = await this.client.get("/workspaces", {
        params: {
          page: page,
          pagelen: 50,
          role: role,
        },
      });

      return data.values || [];
    } catch (error) {
      if (error.response?.status === 400 || error.statusCode === 400) {
        throw error;
      }
      console.error("\nThe error itself: \n", error, "\n");
      throw new AppError(
        "Failed to fetch workspaces",
        500,
        "FETCH_WORKSPACES_FAILED"
      );
    }
  }

  // Implement method methods following the same pattern as GitLab provider
  async actionListRepos(options = {}) {
    try {
      const { data } = await this.client.get(`/repositories/${this.owner}`, {
        params: {
          sort: options?.sort || "-updated_on",
          page: options?.page || 1,
          pagelen: options?.perPage || 50,
        },
      });
      return data.values;
    } catch (error) {
      throw new AppError(
        "Failed to fetch repositories",
        500,
        "FETCH_REPOS_FAILED"
      );
    }
  }

  async actionListRepos(options = {}) {
    try {
      const { data } = await this.client.get(`/repositories/${this.owner}`, {
        params: {
          sort: options?.sort || "-updated_on",
          page: options?.page || 1,
          pagelen: options?.perPage || 50,
        },
      });

      return data.values;
    } catch (error) {
      console.error("\nThe error itself: \n", error, "\n");
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

      if (!repoName) throw new Error();

      const { data } = await this.client.get(
        `/repositories/${this.owner}/${repoName}`
      );

      return data;
    } catch (error) {
      console.error("\nThe error itself: \n", error, "\n");
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
      // ? Either we need to add config for also getting the methods configs to make
      // ? the configs also customizable or we need to add a comment to tell user
      // ? the ref is equal to commit for Bitbucket provider or
      // ? totally add a new field named commit only for Bitbucket
      const commit =
        options?.find((par) => par.key === "ref")?.value[0]?.trim() || "";

      if (!repoName || !commit)
        throw new AppError(
          "Repository name and commit are required",
          400,
          "MISSING_REQUIRED_PARAMS"
        );

      // TODO : ref === commit and is required for Bitbucket so >>
      // ! need a way to tell user
      const { data } = await this.client.get(
        `/repositories/${this.owner}/${repoName}/src${
          commit ? `/${commit}` : ""
        }/`
      );

      return data.values || data;
    } catch (error) {
      if (
        error.statusCode === "400" ||
        error.response?.status === 400 ||
        error.statusCode === 400
      ) {
        throw error;
      }

      console.error("\n Error Log: \n", error, "\n\n");

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
        options?.find((par) => par.key === "ref")?.value[0]?.trim() || "master";

      if (!repoName || !ref || !path)
        throw new AppError(
          "In order to fetch file/directory contents from Bitbucket please fill all required fields.",
          400
        );

      const { data } = await this.client.get(
        `/repositories/${this.owner}/${repoName}/src${
          ref ? "/" + ref : ""
        }/${path}`
      );

      return data;
    } catch (error) {
      if (
        error.statusCode === "400" ||
        error.response?.status === 400 ||
        error.statusCode === 400
      ) {
        throw error;
      }

      console.error("\n Error Log: \n", error, "\n\n");

      throw new AppError(
        "Failed to fetch file content",
        500,
        "FETCH_CONTENT_FAILED"
      );
    }
  }

  async actionListRepoBranches(options = {}) {
    try {
      options = options?.configs?.params || [];

      const repoName =
        options?.find((par) => par.key === "repoName")?.value[0]?.trim() || "";

      if (!repoName)
        throw new AppError("Please required field (repository name)", 400);

      const { data } = await this.client.get(
        `/repositories/${this.owner}/${repoName}/refs/branches`
      );

      return data.values;
    } catch (error) {
      if (
        error.statusCode === "400" ||
        error.response?.status === 400 ||
        error.statusCode === 400
      ) {
        throw error;
      }

      console.error("\n Error Log: \n", error, "\n\n");

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

      if (!repoName) throw new Error();

      const { data } = await this.client.get(
        `/repositories/${this.owner}/${repoName}/commits/${branch}`
      );

      return data.values;
    } catch (error) {
      console.error("\n Error Log: \n", error, "\n\n");
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
        options?.find((par) => par.key === "repoName")?.value[0]?.trim() || "";
      const commitSha =
        options?.find((par) => par.key === "commitSha")?.value[0]?.trim() || "";
      const includeContent =
        options?.find((par) => par.key === "includeContent")?.value[0] || false;

      if (!repoName || !commitSha)
        throw new AppError(
          "Repository name and commit SHA are required",
          400,
          "MISSING_REQUIRED_PARAMS"
        );

      // Get diff stats
      const { data: statsData } = await this.client.get(
        `/repositories/${this.owner}/${repoName}/diffstat/${commitSha}`
      );

      // If content is requested, get the full diff
      let diffContent = null;
      if (includeContent) {
        const { data: contentData } = await this.client.get(
          `/repositories/${this.owner}/${repoName}/diff/${commitSha}`
        );
        diffContent = contentData;
      }

      // Combine the data
      const enrichedData = statsData.values.map((modification) => ({
        ...modification,
        diffContent: diffContent,
        commitHash: commitSha,
        repository: repoName,
      }));

      return enrichedData;
    } catch (error) {
      if (
        error.statusCode === "400" ||
        error.response?.status === 400 ||
        error.statusCode === 400
      ) {
        throw error;
      }

      console.error("\n Error Log: \n", error, "\n\n");
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

      // First verify the repository exists
      const repoCheck = await this.client.get(
        `/repositories/${this.owner}/${repoName}`
      );

      if (!repoCheck.data) {
        throw new AppError(
          "Repository not found or access denied",
          404,
          "REPOSITORY_NOT_FOUND"
        );
      }

      const { data } = await this.client.get(
        `/repositories/${this.owner}/${repoName}/commit/${commitSha}`
      );

      return {
        hash: data.hash,
        author: data.author,
        message: data.message,
        date: data.date,
        parents: data.parents,
        repository: data.repository,
      };
    } catch (error) {
      if (error.response?.status === 404 || error.statusCode === 404) {
        throw new AppError(
          "Repository or commit not found",
          404,
          "RESOURCE_NOT_FOUND"
        );
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

      if (!repoName || !baseCommit || !headCommit)
        throw new AppError(
          "Repository name, base commit and head commit are required",
          400,
          "MISSING_REQUIRED_PARAMS"
        );

      const { data } = await this.client.get(
        `/repositories/${this.owner}/${repoName}/diff/${baseCommit}..${headCommit}`
      );

      return data || {};
    } catch (error) {
      if (
        error.statusCode === "400" ||
        error.response?.status === 400 ||
        error.statusCode === 400
      ) {
        throw error;
      }

      console.error("\n Error Log: \n", error, "\n\n");
      throw new AppError(
        "Failed to compare commits",
        500,
        "COMPARE_COMMITS_FAILED"
      );
    }
  }

  async actionCommentPRs(options = {}) {
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
        `/repositories/${this.owner}/${repoName}/pullrequests/${prNumber}/comments`,
        {
          content: {
            raw: comment,
          },
        }
      );

      return data;
    } catch (error) {
      if (error.response?.status === 400 || error.statusCode === 400) {
        throw error;
      }

      console.error("\n Error Log: \n", error, "\n\n");
      throw new AppError(
        "Failed to add comment to pull request",
        500,
        "COMMENT_PR_FAILED"
      );
    }
  }

  async actionListPipelines(options = {}) {
    try {
      options = options?.configs?.params || [];

      const repoName =
        options?.find((par) => par.key === "repoName")?.value[0]?.trim() || "";

      if (!repoName)
        throw new AppError(
          "Repository name is required",
          400,
          "MISSING_REQUIRED_PARAMS"
        );

      const { data } = await this.client.get(
        `/repositories/${this.owner}/${repoName}/pipelines/`
      );

      return data.values || [];
    } catch (error) {
      if (
        error.statusCode === "400" ||
        error.response?.status === 400 ||
        error.statusCode === 400
      ) {
        throw error;
      }

      console.error("\n Error Log: \n", error, "\n\n");
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
        `/repositories/${this.owner}/${repoName}/deployments`
      );

      return data.values || [];
    } catch (error) {
      if (error.response?.status === 400 || error.statusCode === 400) {
        throw error;
      }

      console.error("\n Error Log: \n", error, "\n\n");
      throw new AppError(
        "Failed to fetch deployments",
        500,
        "FETCH_DEPLOYMENTS_FAILED"
      );
    }
  }
}
