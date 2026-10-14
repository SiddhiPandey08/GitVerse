import { useCallback, useEffect, useState } from "react";
import { getRepository } from "../api/repositories";

export default function useRepository(repoId) {
  const [state, setState] = useState({ data: null, loading: true, error: "" });

  const load = useCallback(async () => {
    if (!repoId) {
      setState({ data: null, loading: false, error: "Repository not found." });
      return;
    }

    setState((current) => ({ ...current, loading: true, error: "" }));
    try {
      const response = await getRepository(repoId);
      setState({ data: response.data, loading: false, error: "" });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error:
          error.response?.status === 404
            ? "Repository not found."
            : "Couldn't load this repository. Please try again.",
      });
    }
  }, [repoId]);

  useEffect(() => {
    load();
  }, [load]);

  return { ...state, reload: load };
}
