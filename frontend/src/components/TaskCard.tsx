import type { Item } from "../types";
import Tag from "./Tag";

interface TaskCardProps {
  item: Item;
  onDelete: (itemId: number) => void;
  onEdit: (item: Item) => void;
  onDragStart: (e: React.DragEvent<HTMLElement>, item: Item) => void;
}

function getDueDateStyle(dueDateStr: string): string {
  const now = new Date();
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const datePart = dueDateStr.slice(0, 10);
  const [year, month, day] = datePart.split("-").map(Number);
  const dueMidnight = new Date(year, month - 1, day);

  const msPerDay = 24 * 60 * 60 * 1000;
  const daysLeft = (dueMidnight.getTime() - todayMidnight.getTime()) / msPerDay;

  if (daysLeft < 1) {
    return "text-red-600";
  } else if (daysLeft <= 3) {
    return "text-orange-500";
  }
  return "text-green-600";
}

function formatDate(dateStr: string): string {
  const datePart = dateStr.slice(0, 10);
  const [year, month, day] = datePart.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function TaskCard({
  item,
  onDelete,
  onEdit,
  onDragStart,
}: TaskCardProps) {
  return (
    <article
      data-testid={`task-${item.id}`}
      className="group rounded-lg border border-slate-200 bg-white p-3 shadow-sm hover:shadow-md cursor-grab"
      draggable
      onDragStart={(e) => onDragStart(e, item)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-slate-800">{item.name}</h3>
          {item.description && (
            <p className="mt-1 text-xs text-slate-500">{item.description}</p>
          )}
          {item.due_date && (
            <p
              data-testid={`task-due-date-${item.id}`}
              className={`mt-1 text-xs font-medium ${getDueDateStyle(item.due_date)}`}
            >
              Due: {formatDate(item.due_date)}
            </p>
          )}
          {item.tags && item.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {item.tags.map((tag) => (
                <Tag key={tag.id} name={tag.name} color={tag.color} />
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <button
            data-testid={`edit-task-${item.id}`}
            onClick={() => onEdit(item)}
            className="opacity-0 group-hover:opacity-100 rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-300"
          >
            Edit
          </button>
          <button
            data-testid={`delete-task-${item.id}`}
            onClick={() => onDelete(item.id)}
            className="opacity-0 group-hover:opacity-100 rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-600 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300"
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}
