import { useEffect, useMemo, useState } from "react";
import Dialog from "./components/Dialog";
import Header from "./components/Header";
import Board from "./components/Board";
import TaskForm from "./components/TaskForm";
import Footer from "./components/Footer";
import type {
  Column,
  ColumnKey,
  Item,
  StatusMap,
  Tag as TagType,
  TagCreateData,
} from "./types";

const API_URL = "http://localhost:8000";
const STORAGE_KEY = "taskStatusMap";
const COLUMNS: Column[] = [
  { key: "todo", title: "To Do" },
  { key: "inprogress", title: "In Progress" },
  { key: "done", title: "Done" },
];

function App() {
  const [items, setItems] = useState<Item[]>([]);
  const [tags, setTags] = useState<TagType[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [apiStatus, setApiStatus] = useState<string>("checking...");
  const [statusMap, setStatusMap] = useState<StatusMap>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  // Check API health on mount
  useEffect(() => {
    fetch(`${API_URL}/health`)
      .then((res) => res.json())
      .then((data: { status: string }) => setApiStatus(data.status))
      .catch(() => setApiStatus("disconnected"));
  }, []);

  // Fetch items from API
  const fetchItems = async () => {
    try {
      const response = await fetch(`${API_URL}/items/`);
      const data: Item[] = await response.json();
      setItems(data);
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  };

  // Fetch tags from API
  const fetchTags = async () => {
    try {
      const response = await fetch(`${API_URL}/tags/`);
      const data: TagType[] = await response.json();
      setTags(data);
    } catch (error) {
      console.error("Error fetching tags:", error);
    }
  };

  // Load items and tags on mount
  useEffect(() => {
    const loadData = async () => {
      await fetchItems();
      await fetchTags();
    };
    loadData();
  }, []);

  // Create a new item
  const createItem = async (data: {
    name: string;
    description: string;
    due_date: string | null;
    tag_ids: number[];
  }) => {
    try {
      const response = await fetch(`${API_URL}/items/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          description: data.description || "Created from React frontend",
          due_date: data.due_date || null,
          tag_ids: data.tag_ids,
        }),
      });

      if (response.ok) {
        setIsCreateDialogOpen(false);
        fetchItems();
      }
    } catch (error) {
      console.error("Error creating item:", error);
    }
  };

  // Create a new tag
  const createTag = async (tagData: TagCreateData): Promise<TagType> => {
    const response = await fetch(`${API_URL}/tags/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(tagData),
    });

    if (!response.ok) {
      throw new Error("Failed to create tag");
    }

    const newTag: TagType = await response.json();
    await fetchTags();
    return newTag;
  };

  // Delete an item
  const deleteItem = async (itemId: number) => {
    try {
      await fetch(`${API_URL}/items/${itemId}`, {
        method: "DELETE",
      });
      setStatusMap((prev) => {
        const next = { ...prev };
        delete next[itemId];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });
      fetchItems();
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  // Update an item
  const updateItem = async (data: {
    name: string;
    description: string;
    due_date: string | null;
    tag_ids: number[];
  }) => {
    if (!editingItem) return;

    try {
      const response = await fetch(`${API_URL}/items/${editingItem.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          description: data.description,
          due_date: data.due_date || null,
          tag_ids: data.tag_ids,
        }),
      });

      if (response.ok) {
        setIsEditDialogOpen(false);
        setEditingItem(null);
        fetchItems();
      }
    } catch (error) {
      console.error("Error updating item:", error);
    }
  };

  // Handle edit button click
  const handleEdit = (item: Item) => {
    setEditingItem(item);
    setIsEditDialogOpen(true);
  };

  // Persist status map
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(statusMap));
    } catch (e) {
      // ignore persistence errors in localStorage
      // ensure block is non-empty to satisfy linting
      void e;
    }
  }, [statusMap]);

  // Derived columns
  const columnsData = useMemo(() => {
    const byCol: Record<ColumnKey, Item[]> = {
      todo: [],
      inprogress: [],
      done: [],
    };
    for (const item of items) {
      const status = statusMap[item.id] || "todo";
      byCol[status]?.push(item);
    }
    return byCol;
  }, [items, statusMap]);

  // Drag & drop handlers
  const onDragStart = (e: React.DragEvent<HTMLElement>, item: Item) => {
    e.dataTransfer.setData("text/plain", String(item.id));
  };

  const onDrop = (e: React.DragEvent<HTMLElement>, columnKey: ColumnKey) => {
    const idStr = e.dataTransfer.getData("text/plain");
    if (!idStr) return;
    const id = Number(idStr);
    setStatusMap((prev) => ({ ...prev, [id]: columnKey }));
  };

  const handleSync = () => {
    fetchItems();
    fetchTags();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header apiStatus={apiStatus} onSync={handleSync} />

      {/* Compose */}
      <section className="mx-auto max-w-7xl w-full px-6 py-6">
        <button
          data-testid="add-task-button"
          onClick={() => setIsCreateDialogOpen(true)}
          className="rounded-md bg-indigo-600 text-white px-4 py-2 text-sm font-medium hover:bg-indigo-500"
        >
          New Task
        </button>
      </section>

      {/* Create Item Dialog */}
      <Dialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        title="Create New Task"
      >
        <TaskForm
          availableTags={tags}
          onSubmit={createItem}
          onCancel={() => setIsCreateDialogOpen(false)}
          onCreateTag={createTag}
          mode="create"
        />
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setEditingItem(null);
        }}
        title="Edit Task"
      >
        <TaskForm
          availableTags={tags}
          onSubmit={updateItem}
          onCancel={() => {
            setIsEditDialogOpen(false);
            setEditingItem(null);
          }}
          onCreateTag={createTag}
          mode="edit"
          initialData={editingItem || undefined}
        />
      </Dialog>

      <Board
        columns={COLUMNS}
        columnsData={columnsData}
        onDragStart={onDragStart}
        onDrop={onDrop}
        onDelete={deleteItem}
        onEdit={handleEdit}
      />

      <Footer />
    </div>
  );
}

export default App;
