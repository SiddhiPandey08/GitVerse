import client from "./client";

export const getUserActivity = (userId) => client.get(`/activity/${userId}`);
export const getRepositoryActivity = (repoId) =>
  client.get(`/activity/repo/${repoId}`);
