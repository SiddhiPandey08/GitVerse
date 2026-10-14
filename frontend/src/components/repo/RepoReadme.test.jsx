import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import RepoReadme from "./RepoReadme";

const mockLoadFile = vi.fn().mockResolvedValue("# Safe README");
const mockCommitsState = {
    commits: [{ files: ["repo/commit/README.md"] }],
    loading: false,
    error: "",
    reload: vi.fn(),
};
vi.mock("../../hooks/useCommits", () => ({
  default: () => mockCommitsState,
}));
vi.mock("../../hooks/useRepoFile", () => ({
  default: () => ({ load: mockLoadFile }),
}));

describe("RepoReadme", () => {
  it("renders markdown README content", async () => {
    render(<RepoReadme repoId="repo-1" name="demo" description="" />);
    expect(await screen.findByText("Safe README")).toBeInTheDocument();
  });
});
