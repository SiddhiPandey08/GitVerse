import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi, describe, it, expect, beforeEach } from "vitest";
import LogIn from "./LogIn";

const setCurrUser = vi.fn();
vi.mock("../../authContext", () => ({
  useAuth: () => ({ currUser: null, setCurrUser }),
}));
vi.mock("../../api/users", () => ({ login: vi.fn() }));

import { login } from "../../api/users";

describe("LogIn", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows validation errors and does not submit invalid credentials", () => {
    render(<MemoryRouter><LogIn /></MemoryRouter>);
    fireEvent.submit(screen.getByRole("button", { name: /sign in/i }).closest("form"));
    expect(screen.getByText("Enter a valid email address.")).toBeInTheDocument();
    expect(login).not.toHaveBeenCalled();
  });

  it("submits valid credentials through the form", async () => {
    login.mockResolvedValue({ data: { token: "token", userId: "user-1" } });
    render(<MemoryRouter><LogIn /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "dev@example.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "password123" } });
    fireEvent.submit(screen.getByRole("button", { name: /sign in/i }).closest("form"));
    await waitFor(() => {
      expect(login).toHaveBeenCalledWith({
        email: "dev@example.com",
        password: "password123",
      });
    });
  });
});
