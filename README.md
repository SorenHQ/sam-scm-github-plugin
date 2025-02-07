# sam-scm-github-plugin

A Node.js/Express.js plugin that provides Source Control Management (SCM) functionalities for Github. This plugin connects to the Github API to offer operations such as listing repositories, branches, commits, and file content retrieval.

## Features

- Connects to Github API using personal access tokens.
- List and retrieve details of repositories.
- List branches and commits.
- Compare commits.
- Get file contents within a repository.
- Centralized error handling for API operations.
- Easily configurable via JSON configurations.

## Plugin Architecture

The plugin follows a modular architecture designed to run as a standalone service in a Docker container.

### Directory Structure

sam-scm-github-plugin/
├── src/
│   ├── v1/
│   │   ├── methods/        # Methods (actions) to perform SCM operations
│   │   ├── controllers/    # API controllers (e.g., Github controller)
│   │   ├── routes.js       # Express routes configuration
│   │   └── services/
│   │       └── github/     # Github provider related code
│   ├── app.js             # Express app initialization and middleware configuration
│   └── server.js          # Server bootstrapping
├── plugin.configs.json    # Plugin configuration file (Github settings only)
├── README.md              # Plugin documentation
└── plugin-root/          # Documentation

## Prerequisites

- Node.js (v14 or above recommended)
- npm (v6 or above)

## Installation

1. Clone this repository:

```bash
git clone https://github.com/SorenHQ/sam-scm-github-plugin.git
```

2. Change to the project directory:

```bash
cd  sam-scm-github-plugin
```

3. Install the dependencies:

```bash
npm install
```

4. Development & Usage:

```bash
npm start
```

Happy coding and enjoy using sam-scm-github-plugin!
