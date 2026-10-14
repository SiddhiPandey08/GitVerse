import client from "./client";

export const normalizeVisibility = (visibility) =>
  visibility === true ||
  String(visibility).toLowerCase() === "true" ||
  String(visibility).toLowerCase() === "public";

export const normalizeRepository = (repository) =>
  repository
    ? { ...repository, visibility: normalizeVisibility(repository.visibility) }
    : repository;

const normalizeResponse = (response) => {
  const data = response.data;
  if (Array.isArray(data)) {
    return { ...response, data: data.map(normalizeRepository) };
  }
  if (data?.repositories) {
    return {
      ...response,
      data: {
        ...data,
        repositories: data.repositories.map(normalizeRepository),
      },
    };
  }
  if (data?.repository) {
    return {
      ...response,
      data: { ...data, repository: normalizeRepository(data.repository) },
    };
  }
  return { ...response, data: normalizeRepository(data) };
};

export const getAllRepositories = () =>
  client.get("/repositories/all").then(normalizeResponse);
export const getRepositoriesByOwner = (userId) =>
  client.get(`/repositories/owner/${userId}`).then(normalizeResponse);
export const getRepositoriesForUser = (userId) =>
  client.get(`/repositories/user/${userId}`).then(normalizeResponse);
export const getRepository = (repoId) =>
  client.get(`/repositories/${repoId}`).then(normalizeResponse);
export const createRepository = (payload) =>
  client.post("/repositories/create", payload).then(normalizeResponse);
export const toggleVisibility = (repoId) =>
  client.patch(`/repositories/toggle-visibility/${repoId}`).then(normalizeResponse);
export const toggleStar = (repoId) =>
  client.patch(`/repositories/toggle-star/${repoId}`).then(normalizeResponse);
export const deleteRepository = (repoId) =>
  client.delete(`/repositories/delete/${repoId}`);
export const getRepositoryCommits = (repoId) =>
  client.get(`/repositories/${repoId}/commits`);
export const getRepositoryFile = (repoId, key, responseType = "json") =>
  client.get(`/repositories/${repoId}/file`, {
    params: { key },
    responseType,
  });
