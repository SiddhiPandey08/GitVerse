import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi, describe, it, expect } from "vitest";
import RequireAuth from "./RequireAuth";

vi.mock("../../authContext", () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from "../../authContext";

describe("RequireAuth", () => {
  it("shows a loading status while auth initializes", () => {
    useAuth.mockReturnValue({ currUser: null, loading: true });
    render(<MemoryRouter><RequireAuth><span>Private</span></RequireAuth></MemoryRouter>);
    expect(screen.getByRole("status")).toHaveTextContent("Loading GitVerse");
  });

  it("redirects unauthenticated users to auth", () => {
    useAuth.mockReturnValue({ currUser: null, loading: false });
    render(<MemoryRouter initialEntries={["/dashboard"]}><RequireAuth><span>Private</span></RequireAuth></MemoryRouter>);
    expect(screen.queryByText("Private")).not.toBeInTheDocument();
  });

  it("renders children for authenticated users", () => {
    useAuth.mockReturnValue({ currUser: { id: "user-1" }, loading: false });
    render(<MemoryRouter><RequireAuth><span>Private</span></RequireAuth></MemoryRouter>);
    expect(screen.getByText("Private")).toBeInTheDocument();
  });
});
