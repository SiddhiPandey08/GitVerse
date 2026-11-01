// issues.js — API client methods for issue tracking and collaboration requests.
// Talks to: backend issue.router.js via client.js.

import client from "./client";

// Fetches all issues for a repository.
export const getRepoIssues = (repoId) => client.get(`/issues/repo/${repoId}`);

// Creates a new issue, with optional requestCollaboration boolean flag.
export const createIssue = (payload) => client.post("/issues/create", payload);

// Fetches a single issue by its ID.
export const getIssueById = (issueId) => client.get(`/issues/${issueId}`);

// Updates an issue's title, description, or status ("open" | "closed").
export const updateIssue = (issueId, payload) =>
  client.put(`/issues/update/${issueId}`, payload);

// Deletes an issue (author or repo owner only).
export const deleteIssue = (issueId) =>
  client.delete(`/issues/delete/${issueId}`);

// Approves a collaboration request issue, adding the author as collaborator and closing the issue.
export const grantCollaborator = (issueId) =>
  client.post(`/issues/${issueId}/grant-collaborator`);

