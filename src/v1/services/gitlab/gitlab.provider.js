import axios from "axios";
import ConfigManager from "../../core/ConfigManager.js";
import BaseProvider from "../base.provider.js";
import gitlabConfig from "../../config/gitlab.config.js";
import AppError from "../../core/errors/AppError.js";

export default class GitlabProvider extends BaseProvider {
  constructor() {
    super(gitlabConfig);
    this.client = null;
    this.owner = "";
  }

  async init() {
    try {
      const configs = ConfigManager.getConfig("gitlab_config");
      const token =
        configs?.params?.find((par) => par?.key === "token")?.value || "";
      this.owner =
        configs?.params?.find((par) => par?.key === "owner")?.value || "";

      if (!token) {
        throw new AppError(
          "GitLab token not found in configurations",
          401,
          "AUTH_FAILED"
        );
      }

      if (!this.owner) {
        throw new AppError(
          "GitLab owner (account username) not found in configurations",
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

      console.error("\n\n", error, "\n\n");

      throw new AppError("Failed to initialize GitLab provider", 500);
    }
  }

  async createClient(token) {
    try {
      if (!token)
        throw new AppError("GitLab authentication failed", 401, "AUTH_FAILED");

      this.client = axios.create({
        baseURL: this.config.apiBaseUrl,
        headers: {
          "PRIVATE-TOKEN": token,
          Accept: "application/json",
        },
      });

      const { data } = await this.client.get("/user");

      return data;
    } catch (error) {
      throw error;
    }
  }

  async actionListGitlabProjects(options = {}) {
    try {
      options = options?.configs?.params || [];
      const visibility =
        options?.find((par) => par.key === "visibility")?.value[0] || "all";
      const page = options?.find((par) => par.key === "page")?.value[0] || 1;
      const membership =
        options?.find((par) => par.key === "membership")?.value[0] || true;

      const { data } = await this.client.get("/projects", {
        params: {
          visibility: visibility === "all" ? undefined : visibility,
          per_page: 50,
          page: page,
          membership: membership,
          order_by: "updated_at",
        },
      });

      return data;
    } catch (error) {
      if (error.response?.status === 400 || error.statusCode === 400) {
        throw error;
      }
      console.error("\nThe error itself: \n", error, "\n");
      throw new AppError(
        "Failed to fetch projects",
        500,
        "FETCH_PROJECTS_FAILED"
      );
    }
  }

  async actionListRepos(options = {}) {
    try {
      options = options?.configs?.params || [];
      const visibility =
        options?.find((par) => par.key === "visibility")?.value[0] || "all";
      //   const sort =
      //     options?.find((par) => par.key === "sort")?.value[0] || "updated";
      const page = options?.find((par) => par.key === "page")?.value[0] || 1;

      const { data } = await this.client.get("/projects", {
        params: {
          visibility: visibility === "all" ? undefined : visibility,
          per_page: 50,
          page: page,
          owned: true,
          //   sort: sort,
        },
      });
      return data;
    } catch (error) {
      if (error.response?.status === 400 || error.statusCode === 400) {
        throw error;
      }
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

      if (!repoName) {
        throw new AppError(
          "Repository name is required",
          400,
          "MISSING_REQUIRED_PARAMS"
        );
      }

      // First get the project details to get the correct path_with_namespace
      // TODO: We need to make this actionListGitlabProject data be available as options for the actionGetRepo in gitlab
      const projects = await this.actionListGitlabProjects();
      const project = projects.find((p) => p.name === repoName);

      if (!project) {
        throw new AppError("Repository not found", 404, "REPOSITORY_NOT_FOUND");
      }

      // Use the full path_with_namespace from the project
      const encodedPath = encodeURIComponent(project.path_with_namespace);
      const { data } = await this.client.get(`/projects/${encodedPath}`);

      return data;
    } catch (error) {
      console.error("\nThe error itself: \n", error, "\n");

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
        options?.find((par) => par.key === "path")?.value[0]?.trim() || "/";
      const ref =
        options?.find((par) => par.key === "ref")?.value[0]?.trim() || "";

      if (!repoName) {
        throw new AppError(
          "Repository name is required",
          400,
          "MISSING_REQUIRED_PARAMS"
        );
      }

      // Get project details for correct path_with_namespace
      const projects = await this.actionListGitlabProjects();
      const project = projects.find((p) => p.name === repoName);

      if (!project) {
        throw new AppError("Repository not found", 404, "REPOSITORY_NOT_FOUND");
      }

      const encodedPath = encodeURIComponent(project.path_with_namespace);

      const { data } = await this.client.get(
        `/projects/${encodedPath}/repository/tree`,
        {
          params: {
            path: path === "/" ? "" : path,
            ref: ref || project.default_branch,
          },
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

      const projects = await this.actionListGitlabProjects();
      const project = projects.find((p) => p.name === repoName);

      if (!project) {
        throw new AppError("Repository not found", 404, "REPOSITORY_NOT_FOUND");
      }

      const encodedPath = encodeURIComponent(project.path_with_namespace);
      const encodedFilePath = encodeURIComponent(path);

      const { data } = await this.client.get(
        `/projects/${encodedPath}/repository/files/${encodedFilePath}`,
        {
          params: {
            ref: ref || project.default_branch,
          },
        }
      );

      return data;
    } catch (error) {
      console.error("\n", " --- Error Log: ", error, "\n");

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

  async actionListRepoBranches(options = {}) {
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

      // Get project details for correct path_with_namespace
      const projects = await this.actionListGitlabProjects();
      const project = projects.find((p) => p.name === repoName);

      if (!project) {
        throw new AppError("Repository not found", 404, "REPOSITORY_NOT_FOUND");
      }

      const encodedPath = encodeURIComponent(project.path_with_namespace);
      const { data } = await this.client.get(
        `/projects/${encodedPath}/repository/branches`
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

      // Get project details for correct path_with_namespace
      const projects = await this.actionListGitlabProjects();
      const project = projects.find((p) => p.name === repoName);

      if (!project) {
        throw new AppError("Repository not found", 404, "REPOSITORY_NOT_FOUND");
      }

      const encodedPath = encodeURIComponent(project.path_with_namespace);
      const { data } = await this.client.get(
        `/projects/${encodedPath}/repository/commits`,
        {
          params: {
            ref_name: branch || project.default_branch,
          },
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
        options?.find((par) => par.key === "repoName")?.value[0]?.trim() || "";
      const commitSha =
        options?.find((par) => par.key === "commitSha")?.value[0]?.trim() || "";
      const includeContent =
        options?.find((par) => par.key === "includeContent")?.value[0] || false;

      if (!repoName || !commitSha) {
        throw new AppError(
          "Repository name and commit SHA are required",
          400,
          "MISSING_REQUIRED_PARAMS"
        );
      }

      const projects = await this.actionListGitlabProjects();
      const project = projects.find((p) => p.name === repoName);

      if (!project) {
        throw new AppError("Repository not found", 404, "REPOSITORY_NOT_FOUND");
      }

      const encodedPath = encodeURIComponent(project.path_with_namespace);

      if (!includeContent) {
        // Get basic file changes info without diff content
        const { data } = await this.client.get(
          `/projects/${encodedPath}/repository/commits/${commitSha}/diff`
        );

        return data.map((file) => ({
          old_path: file.old_path,
          new_path: file.new_path,
          new_file: file.new_file,
          renamed_file: file.renamed_file,
          deleted_file: file.deleted_file,
          changes: file.changes,
        }));
      }

      // Get full diff with content
      const { data } = await this.client.get(
        `/projects/${encodedPath}/repository/commits/${commitSha}/diff`
      );

      return data;
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

      // Get project details for correct path_with_namespace
      const projects = await this.actionListGitlabProjects();
      const project = projects.find((p) => p.name === repoName);

      if (!project) {
        throw new AppError("Repository not found", 404, "REPOSITORY_NOT_FOUND");
      }

      const encodedPath = encodeURIComponent(project.path_with_namespace);
      const { data } = await this.client.get(
        `/projects/${encodedPath}/repository/commits/${commitSha}`
      );

      return {
        sha: data.id,
        author: {
          name: data.author_name,
          email: data.author_email,
        },
        committer: {
          name: data.committer_name,
          email: data.committer_email,
        },
        commit: {
          message: data.message,
          author: {
            name: data.author_name,
            email: data.author_email,
            date: data.authored_date,
          },
          committer: {
            name: data.committer_name,
            email: data.committer_email,
            date: data.committed_date,
          },
        },
        stats: data.stats,
        web_url: data.web_url,
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

      // Get project details for correct path_with_namespace
      const projects = await this.actionListGitlabProjects();
      const project = projects.find((p) => p.name === repoName);

      if (!project) {
        throw new AppError("Repository not found", 404, "REPOSITORY_NOT_FOUND");
      }

      const encodedPath = encodeURIComponent(project.path_with_namespace);
      const { data } = await this.client.get(
        `/projects/${encodedPath}/repository/compare`,
        {
          params: {
            from: baseCommit,
            to: headCommit,
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

      // Get project details for correct path_with_namespace
      const projects = await this.actionListGitlabProjects();
      const project = projects.find((p) => p.name === repoName);

      if (!project) {
        throw new AppError("Repository not found", 404, "REPOSITORY_NOT_FOUND");
      }

      const encodedPath = encodeURIComponent(project.path_with_namespace);
      const { data } = await this.client.post(
        `/projects/${encodedPath}/merge_requests/${prNumber}/notes`,
        { body: comment }
      );

      return data;
    } catch (error) {
      if (error.response?.status === 404 || error.statusCode === 404) {
        throw new AppError(
          "Merge request or repository not found",
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

      // Get project details for correct path_with_namespace
      const projects = await this.actionListGitlabProjects();
      const project = projects.find((p) => p.name === repoName);

      if (!project) {
        throw new AppError("Repository not found", 404, "REPOSITORY_NOT_FOUND");
      }

      const encodedPath = encodeURIComponent(project.path_with_namespace);
      const { data } = await this.client.get(
        `/projects/${encodedPath}/pipelines`
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

      // Get project details for correct path_with_namespace
      const projects = await this.actionListGitlabProjects();
      const project = projects.find((p) => p.name === repoName);

      if (!project) {
        throw new AppError("Repository not found", 404, "REPOSITORY_NOT_FOUND");
      }

      const encodedPath = encodeURIComponent(project.path_with_namespace);
      const { data } = await this.client.get(
        `/projects/${encodedPath}/deployments`
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
