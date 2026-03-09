import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import TaskCard from "./TaskCard";
import { mockItems, createMockItem } from "../test/mock-data";

describe("TaskCard", () => {
  const defaultProps = {
    item: mockItems.simple,
    onDelete: vi.fn(),
    onEdit: vi.fn(),
    onDragStart: vi.fn(),
  };

  it("renders task name", () => {
    render(<TaskCard {...defaultProps} />);
    expect(screen.getByText(mockItems.simple.name)).toBeInTheDocument();
  });

  it("renders task description when provided", () => {
    render(<TaskCard {...defaultProps} item={mockItems.withDescription} />);
    expect(
      screen.getByText(mockItems.withDescription.description),
    ).toBeInTheDocument();
  });

  it("does not render description when empty", () => {
    const itemWithoutDesc = { ...mockItems.simple, description: "" };
    render(<TaskCard {...defaultProps} item={itemWithoutDesc} />);

    // Only the name should be visible
    expect(screen.getByText(itemWithoutDesc.name)).toBeInTheDocument();
    const taskCard = screen.getByTestId(`task-${itemWithoutDesc.id}`);
    expect(taskCard.querySelectorAll("p").length).toBe(0);
  });

  it("renders tags when present", () => {
    render(<TaskCard {...defaultProps} item={mockItems.withTags} />);

    mockItems.withTags.tags.forEach((tag) => {
      expect(screen.getByText(tag.name)).toBeInTheDocument();
    });
  });

  it("does not render tags section when no tags", () => {
    render(<TaskCard {...defaultProps} item={mockItems.simple} />);

    const taskCard = screen.getByTestId(`task-${mockItems.simple.id}`);
    const tagContainer = taskCard.querySelector(".flex.flex-wrap.gap-1\\.5");
    expect(tagContainer).not.toBeInTheDocument();
  });

  it("renders delete button", () => {
    render(<TaskCard {...defaultProps} />);
    expect(
      screen.getByTestId(`delete-task-${mockItems.simple.id}`),
    ).toBeInTheDocument();
  });

  it("renders edit button", () => {
    render(<TaskCard {...defaultProps} />);
    expect(
      screen.getByTestId(`edit-task-${mockItems.simple.id}`),
    ).toBeInTheDocument();
  });

  it("calls onEdit when edit button is clicked", async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();

    render(<TaskCard {...defaultProps} onEdit={onEdit} />);

    const editButton = screen.getByTestId(`edit-task-${mockItems.simple.id}`);
    await user.click(editButton);

    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onEdit).toHaveBeenCalledWith(mockItems.simple);
  });

  it("calls onDelete when delete button is clicked", async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();

    render(<TaskCard {...defaultProps} onDelete={onDelete} />);

    const deleteButton = screen.getByTestId(
      `delete-task-${mockItems.simple.id}`,
    );
    await user.click(deleteButton);

    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledWith(mockItems.simple.id);
  });

  it("is draggable", () => {
    render(<TaskCard {...defaultProps} />);
    const taskCard = screen.getByTestId(`task-${mockItems.simple.id}`);
    expect(taskCard).toHaveAttribute("draggable", "true");
  });

  it("calls onDragStart when drag starts", () => {
    const onDragStart = vi.fn();
    render(<TaskCard {...defaultProps} onDragStart={onDragStart} />);

    const taskCard = screen.getByTestId(`task-${mockItems.simple.id}`);
    const dragEvent = new Event("dragstart", { bubbles: true });

    taskCard.dispatchEvent(dragEvent);

    expect(onDragStart).toHaveBeenCalledTimes(1);
    expect(onDragStart).toHaveBeenCalledWith(
      expect.any(Object),
      mockItems.simple,
    );
  });

  it("has correct styling classes", () => {
    render(<TaskCard {...defaultProps} />);
    const taskCard = screen.getByTestId(`task-${mockItems.simple.id}`);

    expect(taskCard).toHaveClass("group");
    expect(taskCard).toHaveClass("rounded-lg");
    expect(taskCard).toHaveClass("cursor-grab");
  });

  describe("due date display", () => {
    it("does not render due date when not set", () => {
      render(<TaskCard {...defaultProps} item={mockItems.simple} />);
      expect(
        screen.queryByTestId(`task-due-date-${mockItems.simple.id}`),
      ).not.toBeInTheDocument();
    });

    it("renders due date when set", () => {
      const itemWithDueDate = createMockItem({
        id: 10,
        due_date: "2099-12-31",
      });
      render(<TaskCard {...defaultProps} item={itemWithDueDate} />);
      expect(
        screen.getByTestId(`task-due-date-${itemWithDueDate.id}`),
      ).toBeInTheDocument();
    });

    it("applies green color when due date is more than 3 days away", () => {
      const future = new Date();
      future.setDate(future.getDate() + 10);
      const dueDateStr = future.toISOString().slice(0, 10);
      const item = createMockItem({ id: 11, due_date: dueDateStr });
      render(<TaskCard {...defaultProps} item={item} />);
      const el = screen.getByTestId(`task-due-date-${item.id}`);
      expect(el).toHaveClass("text-green-600");
    });

    it("applies orange color when due date is between 1 and 3 days away", () => {
      const future = new Date();
      future.setDate(future.getDate() + 2);
      const dueDateStr = future.toISOString().slice(0, 10);
      const item = createMockItem({ id: 12, due_date: dueDateStr });
      render(<TaskCard {...defaultProps} item={item} />);
      const el = screen.getByTestId(`task-due-date-${item.id}`);
      expect(el).toHaveClass("text-orange-500");
    });

    it("applies red color when due date has passed", () => {
      const past = new Date();
      past.setDate(past.getDate() - 1);
      const dueDateStr = past.toISOString().slice(0, 10);
      const item = createMockItem({ id: 13, due_date: dueDateStr });
      render(<TaskCard {...defaultProps} item={item} />);
      const el = screen.getByTestId(`task-due-date-${item.id}`);
      expect(el).toHaveClass("text-red-600");
    });

    it("applies red color when due date is today (less than 1 day away)", () => {
      const today = new Date();
      const dueDateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
      const item = createMockItem({ id: 14, due_date: dueDateStr });
      render(<TaskCard {...defaultProps} item={item} />);
      const el = screen.getByTestId(`task-due-date-${item.id}`);
      expect(el).toHaveClass("text-red-600");
    });
  });
});
