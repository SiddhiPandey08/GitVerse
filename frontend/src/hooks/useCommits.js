import { useCallback, useEffect, useState } from "react";
import { getRepositoryCommits } from "../api/repositories";

export default function useCommits(repoId, shared) {
  const [state, setState] = useState({ commits: [], loading: true, error: "" });

  const load = useCallback(async () => {
    if (!repoId) {
      setState({ commits: [], loading: false, error: "Repository not found." });
      return;
    }

    setState((current) => ({ ...current, loading: true, error: "" }));
    try {
      const response = await getRepositoryCommits(repoId);
      setState({
        commits: response.data.commits || [],
        loading: false,
        error: "",
      });
    } catch (error) {
      setState({
        commits: [],
        loading: false,
        error:
          error.response?.status === 403
            ? "Only the repository owner can view its files."
            : "Couldn't load repository history. Please try again.",
      });
    }
  }, [repoId]);

  useEffect(() => {
    if (!shared) load();
  }, [load, shared]);

  return shared || { ...state, reload: load };
}
