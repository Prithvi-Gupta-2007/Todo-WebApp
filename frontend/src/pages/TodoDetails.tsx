import { useState, useRef } from "react";
import { useRoute, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, CheckCircle2, Circle, X, Edit2 } from "lucide-react";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import OceanBackground from "@/components/OceanBackground";
import { cn } from "@/lib/utils";

const API_URL = "http://localhost:9889/api";

const fetchTodo = async (id: string) => {
  const res = await fetch(`${API_URL}/todos/${id}`);
  if (!res.ok) throw new Error("Failed to fetch todo");
  return res.json();
};

const createTask = async ({ id, task }: { id: string; task: string }) => {
  const res = await fetch(`${API_URL}/todos/${id}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ task }),
  });
  if (!res.ok) throw new Error("Failed to create task");
  return res.json();
};

const updateTask = async ({ id, taskId }: { id: string; taskId: string }) => {
  const res = await fetch(`${API_URL}/todos/${id}/tasks/${taskId}`, {
    method: "PATCH",
  });
  if (!res.ok) throw new Error("Failed to update task");
  return res.json();
};

const deleteTask = async ({ id, taskId }: { id: string; taskId: string }) => {
  const res = await fetch(`${API_URL}/todos/${id}/tasks/${taskId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete task");
  return res.json();
};

const updateTodoTitle = async ({ id, title }: { id: string; title: string }) => {
  const res = await fetch(`${API_URL}/todos/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error("Failed to update title");
  return res.json();
};

export default function TodoDetails() {
  const [, params] = useRoute("/todo/:id");
  const todoId = params?.id || "";

  const [newTaskText, setNewTaskText] = useState("");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["todo", todoId] });
    queryClient.invalidateQueries({ queryKey: ["todos"] });
  };

  const { data: todoData, isLoading, isError } = useQuery({
    queryKey: ["todo", todoId],
    queryFn: () => fetchTodo(todoId),
    enabled: !!todoId,
  });

  // FIX: moved side-effects into mutationFn callbacks via the mutate() call,
  // or kept in onSuccess — but critically, onSuccess IS supported in useMutation
  // options in both v4 and v5. The real fixes are below.

  const createTaskMutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      invalidate();
      setNewTaskText("");
      inputRef.current?.focus();
    },
  });

  const toggleTaskMutation = useMutation({
    mutationFn: updateTask,
    // FIX: Use onSettled instead of onSuccess so the UI always re-syncs,
    // even if the server returns a non-2xx that was swallowed, and add
    // optimistic invalidation so the toggle feels instant.
    onMutate: async ({ taskId }) => {
      await queryClient.cancelQueries({ queryKey: ["todo", todoId] });
      const previous = queryClient.getQueryData(["todo", todoId]);
      queryClient.setQueryData(["todo", todoId], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          tasks: old.tasks.map((t: any) =>
            t._id === taskId ? { ...t, completed: !t.completed } : t
          ),
        };
      });
      return { previous };
    },
    onError: (_err, _vars, context: any) => {
      // Roll back on error
      if (context?.previous) {
        queryClient.setQueryData(["todo", todoId], context.previous);
      }
    },
    onSettled: () => {
      invalidate();
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      invalidate();
    },
  });

  const updateTitleMutation = useMutation({
    mutationFn: updateTodoTitle,
    onSuccess: () => {
      invalidate();
      setIsEditingTitle(false);
    },
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    createTaskMutation.mutate({ id: todoId, task: newTaskText.trim() });
  };

  const toggleTask = (taskId: string) => {
    // FIX: Guard against firing a new toggle while one is already in-flight
    if (toggleTaskMutation.isPending) return;
    toggleTaskMutation.mutate({ id: todoId, taskId });
  };

  const handleTitleEdit = () => {
    if (!todoData) return;
    setNewTitle(todoData.title);
    setIsEditingTitle(true);
    setTimeout(() => titleInputRef.current?.focus(), 10);
  };

  const saveTitle = () => {
    const trimmed = newTitle.trim();
    if (!trimmed) {
      // Don't save an empty title — just cancel
      setIsEditingTitle(false);
      return;
    }
    if (trimmed !== todoData?.title) {
      updateTitleMutation.mutate({ id: todoId, title: trimmed });
    } else {
      setIsEditingTitle(false);
    }
  };

  // FIX: Separate keydown handler so Enter saves and Escape cancels,
  // without the blur event racing against the keydown.
  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault(); // prevent any parent form submission
      saveTitle();
    } else if (e.key === "Escape") {
      setIsEditingTitle(false);
    }
  };

  // FIX: onBlur should only save if we're not already mid-mutation
  const handleTitleBlur = () => {
    if (!updateTitleMutation.isPending) {
      saveTitle();
    }
  };

  if (isLoading) {
    return (
      <>
        <OceanBackground />
        <div className="min-h-screen flex justify-center items-center relative z-10">
          <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
        </div>
      </>
    );
  }

  if (isError || !todoData) {
    return (
      <>
        <OceanBackground />
        <div className="min-h-screen flex flex-col justify-center items-center relative z-10 text-center px-4">
          <h1 className="text-3xl font-bold text-white mb-4">Todo not found</h1>
          <Link href="/" className="text-cyan-400 hover:text-cyan-300 underline flex items-center gap-2">
            <ArrowLeft size={18} /> Return to Workspace
          </Link>
        </div>
      </>
    );
  }

  const tasks = todoData.tasks || [];
  const completedCount = tasks.filter((t: any) => t.completed).length;
  const progress = tasks.length === 0 ? 0 : Math.round((completedCount / tasks.length) * 100);

  return (
    <>
      <OceanBackground />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12 min-h-screen flex flex-col relative z-10">
        <header className="mb-8 flex flex-col gap-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors self-start py-2 px-3 hover:bg-cyan-500/10 rounded-xl"
          >
            <ArrowLeft size={20} />
            <span className="font-semibold">Back to Workspace</span>
          </Link>

          {/* Editable Title */}
          <div className="bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-md">
            {isEditingTitle ? (
              <input
                ref={titleInputRef}
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onBlur={handleTitleBlur}         // FIX: use safe blur handler
                onKeyDown={handleTitleKeyDown}   // FIX: use dedicated keydown handler
                className="w-full bg-transparent text-4xl font-extrabold text-white outline-none border-b border-cyan-400 pb-1"
                autoFocus
              />
            ) : (
              <div
                className="group flex items-center gap-3 cursor-pointer"
                onClick={handleTitleEdit}
              >
                <h1 className="text-4xl font-extrabold text-white tracking-tight">
                  {todoData.title}
                </h1>
                <Edit2 size={20} className="text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            )}

            <div className="flex items-center gap-4 text-muted-foreground mt-3">
              <span>{completedCount} of {tasks.length} completed</span>
              <span>•</span>
              <span>{progress}%</span>
            </div>

            <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden mt-4">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className={cn(
                  "h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500",
                  progress === 100 && "from-emerald-400 to-cyan-500"
                )}
              />
            </div>
          </div>
        </header>

        <div className="flex-1 bg-black/20 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-md">
          <div className="mb-8">
            {tasks.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center opacity-70">
                <CheckCircle2 className="w-12 h-12 text-cyan-500/50 mb-4" />
                <p className="text-lg text-white">No tasks yet</p>
                <p className="text-sm text-muted-foreground">Add your first task below</p>
              </div>
            ) : (
              <ul className="space-y-3">
                <AnimatePresence>
                  {tasks.map((task: any) => (
                    <motion.li
                      key={task._id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className={cn(
                        "group flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all border",
                        task.completed
                          ? "bg-white/5 border-white/10"
                          : "bg-white/10 border-white/20 hover:border-cyan-500/30"
                      )}
                      onClick={() => toggleTask(task._id)}
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="text-cyan-400">
                          {task.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                        </div>
                        <span
                          className={cn(
                            "text-lg transition-all",
                            task.completed && "line-through text-white/50"
                          )}
                        >
                          {task.task}
                        </span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteTaskMutation.mutate({ id: todoId, taskId: task._id });
                        }}
                        className="text-red-400 hover:text-red-300 p-1 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <X size={20} />
                      </button>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            )}
          </div>

          {/* Add New Task */}
          <form onSubmit={handleCreateTask} className="flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              placeholder="Add a new task..."
              className="flex-1 bg-white/10 border border-white/20 rounded-2xl px-5 py-3.5 text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-400"
            />
            <button
              type="submit"
              disabled={!newTaskText.trim() || createTaskMutation.isPending}
              className="bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 px-6 py-3.5 rounded-2xl font-semibold flex items-center gap-2 transition-all"
            >
              <Plus size={20} />
              Add
            </button>
          </form>
        </div>
      </main>
    </>
  );
}