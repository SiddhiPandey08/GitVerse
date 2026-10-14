import client from "./client";

export const getUserActivity = (userId) => client.get(`/activity/${userId}`);
