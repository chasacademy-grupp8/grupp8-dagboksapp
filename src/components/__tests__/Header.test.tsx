import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Header from "../Header";
import { signOut } from "@/lib/supabase/auth";
import { useRouter } from "next/navigation";

// Mock the auth module
jest.mock("@/lib/supabase/auth", () => ({
  signOut: jest.fn(),
}));

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

describe("Header", () => {
  const mockPush = jest.fn();
  const mockSignOut = signOut as jest.MockedFunction<typeof signOut>;
  const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({
      push: mockPush,
    } as any);
  });

  it("renders the Journal title", () => {
    render(<Header />);

    expect(screen.getByText("Journal")).toBeInTheDocument();
  });

  it("renders Sign Out button", () => {
    render(<Header />);

    expect(screen.getByText("Sign Out")).toBeInTheDocument();
  });

  it("calls signOut and redirects to login when Sign Out is clicked", async () => {
    mockSignOut.mockResolvedValueOnce(undefined);

    render(<Header />);

    const signOutButton = screen.getByText("Sign Out");
    fireEvent.click(signOutButton);

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalledTimes(1);
      expect(mockPush).toHaveBeenCalledWith("/login");
    });
  });

  it("handles sign out error gracefully", async () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
    const mockError = new Error("Sign out failed");
    mockSignOut.mockRejectedValueOnce(mockError);

    render(<Header />);

    const signOutButton = screen.getByText("Sign Out");
    fireEvent.click(signOutButton);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error signing out:",
        mockError
      );
    });

    consoleErrorSpy.mockRestore();
  });
});
