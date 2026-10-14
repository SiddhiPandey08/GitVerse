import { useCallback, useState } from "react";
import { getRepositoryFile } from "../api/repositories";

export default function useRepoFile(repoId) {
  const [state, setState] = useState({ loading: false, error: "" });

  const load = useCallback(
    async (key, responseType = "blob") => {
      setState({ loading: true, error: "" });
      try {
        const response = await getRepositoryFile(repoId, key, responseType);
        setState({ loading: false, error: "" });
        return response.data;
      } catch (error) {
        setState({
          loading: false,
          error:
            error.response?.status === 404
              ? "This file no longer exists in storage."
              : "Couldn't load the file. Please try again.",
        });
        throw error;
      }
    },
    [repoId],
  );

  return { ...state, load };
}
