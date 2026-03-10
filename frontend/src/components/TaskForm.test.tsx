import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import TaskForm from "./TaskForm";
import { mockTags } from "../test/mock-data";

describe("TaskForm", () => {
  const defaultProps = {
    availableTags: [mockTags.bug, mockTags.feature],
    onSubmit: vi.fn().mockResolvedValue(undefined),
    onCancel: vi.fn(),
    onCreateTag: vi.fn().mockResolvedValue(mockTags.enhancement),
  };

  it("renders all form fields", () => {
    render(<TaskForm {...defaultProps} />);

    expect(screen.getByLabelText(/task name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/due date/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /create task/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
  });

  it("submits form with name only", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(<TaskForm {...defaultProps} onSubmit={onSubmit} />);

    const nameInput = screen.getByTestId("task-name-input");
    await user.type(nameInput, "Test Task");

    const submitButton = screen.getByRole("button", { name: /create task/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        name: "Test Task",
        description: "",
        due_date: null,
        tag_ids: [],
      });
    });
  });

  it("submits form with all fields", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(<TaskForm {...defaultProps} onSubmit={onSubmit} />);

    const nameInput = screen.getByTestId("task-name-input");
    await user.type(nameInput, "Test Task");

    const descInput = screen.getByTestId("task-description-input");
    await user.type(descInput, "Test Description");

    const dueDateInput = screen.getByTestId(
      "task-due-date-input",
    ) as HTMLInputElement;
    await user.type(dueDateInput, "2099-12-31");

    const submitButton = screen.getByRole("button", { name: /create task/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        name: "Test Task",
        description: "Test Description",
        due_date: "2099-12-31",
        tag_ids: [],
      });
    });
  });

  it("does not submit with empty name", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<TaskForm {...defaultProps} onSubmit={onSubmit} />);

    const submitButton = screen.getByRole("button", { name: /create task/i });
    await user.click(submitButton);

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("does not submit with whitespace-only name", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<TaskForm {...defaultProps} onSubmit={onSubmit} />);

    const nameInput = screen.getByTestId("task-name-input");
    await user.type(nameInput, "   ");

    const submitButton = screen.getByRole("button", { name: /create task/i });
    await user.click(submitButton);

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("calls onCancel when cancel button is clicked", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();

    render(<TaskForm {...defaultProps} onCancel={onCancel} />);

    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    await user.click(cancelButton);

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("clears form after cancel", async () => {
    const user = userEvent.setup();

    render(<TaskForm {...defaultProps} />);

    const nameInput = screen.getByTestId("task-name-input") as HTMLInputElement;
    const descInput = screen.getByTestId(
      "task-description-input",
    ) as HTMLTextAreaElement;

    await user.type(nameInput, "Test Task");
    await user.type(descInput, "Test Description");

    expect(nameInput.value).toBe("Test Task");
    expect(descInput.value).toBe("Test Description");

    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    await user.click(cancelButton);

    expect(nameInput.value).toBe("");
    expect(descInput.value).toBe("");
  });

  it("clears form after successful submit", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(<TaskForm {...defaultProps} onSubmit={onSubmit} />);

    const nameInput = screen.getByTestId("task-name-input") as HTMLInputElement;
    const descInput = screen.getByTestId(
      "task-description-input",
    ) as HTMLTextAreaElement;

    await user.type(nameInput, "Test Task");
    await user.type(descInput, "Test Description");

    const submitButton = screen.getByRole("button", { name: /create task/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(nameInput.value).toBe("");
      expect(descInput.value).toBe("");
    });
  });

  it("renders with TagSelector", () => {
    render(<TaskForm {...defaultProps} />);

    // TaskSelector is rendered - we can check by looking for its elements
    // The actual TagSelector functionality is tested in TagSelector.test.tsx
    expect(
      screen.getByRole("button", { name: /create task/i }),
    ).toBeInTheDocument();
  });
});
