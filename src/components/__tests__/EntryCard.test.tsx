import { render, screen, fireEvent } from "@testing-library/react";
import EntryCard from "../EntryCard";
import { Entry } from "@/types/database.types";

describe("EntryCard", () => {
  const mockEntry: Entry = {
    id: "123",
    title: "Test Entry",
    content: "This is a test entry content",
    created_at: "2025-11-06T10:00:00Z",
    user_id: "user123",
  };

  const mockOnDelete = jest.fn();
  const mockOnEdit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders entry title and content", () => {
    render(<EntryCard entry={mockEntry} onDelete={mockOnDelete} />);

    expect(screen.getByText("Test Entry")).toBeInTheDocument();
    expect(
      screen.getByText("This is a test entry content")
    ).toBeInTheDocument();
  });

  it("displays formatted date", () => {
    render(<EntryCard entry={mockEntry} onDelete={mockOnDelete} />);

    // The date should be formatted as "November 6, 2025"
    expect(screen.getByText(/November 6, 2025/i)).toBeInTheDocument();
  });

  it("calls onDelete when Remove button is clicked and confirmed", () => {
    // Mock window.confirm to return true
    window.confirm = jest.fn(() => true);

    render(<EntryCard entry={mockEntry} onDelete={mockOnDelete} />);

    const removeButton = screen.getByText("Remove");
    fireEvent.click(removeButton);

    expect(window.confirm).toHaveBeenCalledWith(
      "Are you sure you want to delete this entry?"
    );
    expect(mockOnDelete).toHaveBeenCalledWith("123");
  });

  it("does not call onDelete when Remove button is clicked but not confirmed", () => {
    // Mock window.confirm to return false
    window.confirm = jest.fn(() => false);

    render(<EntryCard entry={mockEntry} onDelete={mockOnDelete} />);

    const removeButton = screen.getByText("Remove");
    fireEvent.click(removeButton);

    expect(window.confirm).toHaveBeenCalled();
    expect(mockOnDelete).not.toHaveBeenCalled();
  });

  it("renders Edit button when onEdit prop is provided", () => {
    render(
      <EntryCard
        entry={mockEntry}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
      />
    );

    expect(screen.getByText("Edit")).toBeInTheDocument();
  });

  it("does not render Edit button when onEdit prop is not provided", () => {
    render(<EntryCard entry={mockEntry} onDelete={mockOnDelete} />);

    expect(screen.queryByText("Edit")).not.toBeInTheDocument();
  });

  it("calls onEdit when Edit button is clicked", () => {
    render(
      <EntryCard
        entry={mockEntry}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
      />
    );

    const editButton = screen.getByText("Edit");
    fireEvent.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledWith("123");
  });
});
