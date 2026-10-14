import client from "./client";

export const login = (credentials) => client.post("/users/login", credentials);
export const signUp = (payload) => client.post("/users/signup", payload);
export const getUserProfile = (userId) =>
  client.get(`/users/userProfile/${userId}`);
export const updateUserProfile = (userId, payload) =>
  client.put(`/users/updateProfile/${userId}`, payload);
