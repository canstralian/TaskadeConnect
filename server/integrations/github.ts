/**
 * GitHub integration - Implements outbound actions to GitHub API
 */

interface GitHubConfig {
  token: string;
  owner?: string;
  repo?: string;
}

interface CreateIssueParams {
  title: string;
  body?: string;
  labels?: string[];
  assignees?: string[];
}

interface AddCommentParams {
  issueNumber: number;
  body: string;
}

interface CreateIssueResponse {
  number: number;
  html_url: string;
  id: number;
}

interface AddCommentResponse {
  id: number;
  html_url: string;
}

/**
 * Create a new issue in a GitHub repository
 */
export async function createIssue(
  config: GitHubConfig,
  params: CreateIssueParams
): Promise<CreateIssueResponse> {
  const { token, owner, repo } = config;

  if (!owner || !repo) {
    throw new Error("GitHub owner and repo are required");
  }

  const url = `https://api.github.com/repos/${owner}/${repo}/issues`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: params.title,
      body: params.body || "",
      labels: params.labels || [],
      assignees: params.assignees || [],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`GitHub API error: ${response.status} - ${error}`);
  }

  return await response.json();
}

/**
 * Add a comment to an existing GitHub issue
 */
export async function addComment(
  config: GitHubConfig,
  params: AddCommentParams
): Promise<AddCommentResponse> {
  const { token, owner, repo } = config;

  if (!owner || !repo) {
    throw new Error("GitHub owner and repo are required");
  }

  const url = `https://api.github.com/repos/${owner}/${repo}/issues/${params.issueNumber}/comments`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      body: params.body,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`GitHub API error: ${response.status} - ${error}`);
  }

  return await response.json();
}

/**
 * Extract owner and repo from repository configuration
 */
export function parseRepository(repo: string): { owner: string; repo: string } {
  const parts = repo.split("/");
  if (parts.length !== 2) {
    throw new Error(`Invalid repository format: ${repo}. Expected format: owner/repo`);
  }
  return {
    owner: parts[0],
    repo: parts[1],
  };
}
