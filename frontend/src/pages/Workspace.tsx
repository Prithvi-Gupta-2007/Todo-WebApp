import { useState, useMemo, useCallback } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, ListTodo } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useOceanToast } from "@/hooks/use-ocean-toast";
import OceanBackground from "@/components/OceanBackground";
import ConfirmDeleteButton from "@/components/ConfirmDeleteButton";
import { cn } from "@/lib/utils";

const API_URL = "http://localhost:9889/api";

const fetchTodos = async () => {
  const res = await fetch(`${API_URL}/todos`);
  if (!res.ok) throw new Error("Failed to fetch todos");
  return res.json();
};

const createTodo = async ({ data }: { data: { title: string } }) => {
  const res = await fetch(`${API_URL}/todos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: data.title }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Create todo failed:", err);
    throw new Error("Failed to create todo");
  }

  return res.json();
};

const deleteTodo = async ({ id }: { id: string }) => {
  const res = await fetch(`${API_URL}/todos/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Delete todo failed:", err);
    throw new Error("Failed to delete todo");
  }

  return res.json();
};

export default function Workspace() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [newTodoTitle, setNewTodoTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useOceanToast();

  const cancelConfirm = useCallback(() => setConfirmingId(null), []);

  const { data: todos = [], isLoading } = useQuery({
    queryKey: ["todos"],
    queryFn: fetchTodos,
  });

  const createTodoMutation = useMutation({
    mutationFn: createTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      toast("Todo created successfully");
      setNewTodoTitle("");
      setIsCreating(false);
    },
    onError: (error: any) => {
      toast(error.message || "Failed to create todo");
    },
  });

  const deleteTodoMutation = useMutation({
    mutationFn: deleteTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      toast("Todo deleted successfully");
      setConfirmingId(null);
    },
    onError: (error: any) => {
      toast(error.message || "Failed to delete todo");
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoTitle.trim()) return;
    createTodoMutation.mutate({ data: { title: newTodoTitle } });
  };

  const filteredTodos = useMemo(() => {
    if (!todos || !Array.isArray(todos)) return [];
    if (!searchQuery.trim()) return todos;

    return todos.filter((t: any) =>
      t.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [todos, searchQuery]);

  return (
    <>
      <OceanBackground />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-screen flex flex-col relative z-10">
        
        {/* Header Section */}
        <header className="flex items-center justify-between mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-cyan-400 drop-shadow-[0_0_15px_rgba(76,201,240,0.3)]"
          >
            Workspace
          </motion.h1>

          <div className="flex items-center gap-4">
            {/* Expanding Search Bar */}
            <div className="relative flex items-center justify-end h-12 w-[40px] md:w-[280px]">
              <AnimatePresence>
                {(isSearchOpen || window.innerWidth >= 768) ? (
                  <motion.div
                    initial={{ width: 40, opacity: 0 }}
                    animate={{ width: "100%", opacity: 1 }}
                    exit={{ width: 40, opacity: 0 }}
                    className="absolute right-0 flex items-center bg-white/5 border border-white/10 backdrop-blur-md rounded-full overflow-hidden shadow-inner focus-within:border-cyan-400/50 focus-within:shadow-[0_0_20px_rgba(76,201,240,0.2)] transition-all"
                  >
                    <Search className="w-5 h-5 ml-4 text-muted-foreground" />
                    <input
                      autoFocus={isSearchOpen}
                      placeholder="Search todos..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onBlur={() => { if (!searchQuery) setIsSearchOpen(false); }}
                      className="w-full bg-transparent border-none px-3 py-2.5 text-sm text-white placeholder:text-white/30 outline-none"
                    />
                  </motion.div>
                ) : (
                  <button 
                    onClick={() => setIsSearchOpen(true)}
                    className="absolute right-0 p-2.5 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 text-muted-foreground hover:text-cyan-300 transition-colors"
                  >
                    <Search className="w-5 h-5" />
                  </button>
                )}
              </AnimatePresence>
            </div>

            <button 
              onClick={() => setIsCreating(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-5 py-2.5 rounded-full font-semibold shadow-[0_0_15px_rgba(76,201,240,0.3)] hover:shadow-[0_0_25px_rgba(76,201,240,0.6)] hover:-translate-y-0.5 transition-all duration-300"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">New Todo</span>
            </button>
          </div>
        </header>

        {/* Create Form Overlay */}
        <AnimatePresence>
          {isCreating && (
            <motion.div 
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: 32 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="overflow-hidden"
            >
              <form onSubmit={handleCreate} className="bg-white/5 border border-cyan-500/30 p-6 rounded-2xl backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                <div className="flex gap-4">
                  <input
                    autoFocus
                    placeholder="What do you want to accomplish?"
                    value={newTodoTitle}
                    onChange={(e) => setNewTodoTitle(e.target.value)}
                    className="flex-1 bg-black/20 border border-white/10 rounded-xl px-5 py-3 text-white placeholder:text-white/30 outline-none focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20 transition-all text-lg"
                  />
                  <button 
                    type="submit"
                    disabled={!newTodoTitle.trim() || createTodoMutation.isPending}
                    className="bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 font-bold px-8 py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(76,201,240,0.4)]"
                  >
                    {createTodoMutation.isPending ? "Creating..." : "Create"}
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      setIsCreating(false);
                      setNewTodoTitle("");
                    }}
                    className="px-6 py-3 text-muted-foreground hover:text-white hover:bg-white/5 rounded-xl transition-colors font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content Area */}
        {isLoading ? (
          <div className="flex-1 flex justify-center items-center">
            <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin drop-shadow-[0_0_15px_rgba(76,201,240,0.5)]" />
          </div>
        ) : filteredTodos.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-24 h-24 mb-6 rounded-full bg-cyan-500/10 flex items-center justify-center shadow-[0_0_40px_rgba(76,201,240,0.15)]">
              <ListTodo className="w-10 h-10 text-cyan-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Nothing here yet</h2>
            <p className="text-muted-foreground mb-8 max-w-md">
              {searchQuery ? "No todos matched your search." : "Dive in and create your first todo list to start organizing your oceanic workflow."}
            </p>
            {!searchQuery && (
              <button 
                onClick={() => setIsCreating(true)}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-8 py-3 rounded-full font-semibold shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:shadow-[0_0_30px_rgba(76,201,240,0.2)] hover:-translate-y-1 transition-all duration-300"
              >
                Create todo <Plus className="w-5 h-5 ml-1" />
              </button>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredTodos.map((todo: any, index: number) => {
                const progress = todo.taskCount === 0 ? 0 : Math.round((todo.completedCount / todo.taskCount) * 100);
                const isThisConfirming = confirmingId === todo._id;

                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                    key={todo._id}
                  >
                    <div
                      role="link"
                      tabIndex={0}
                      onClick={() => {
                        if (isThisConfirming) {
                          cancelConfirm();
                          return;
                        }
                        if (confirmingId !== null) {
                          cancelConfirm();
                          return;
                        }
                        navigate(`/todo/${todo._id}`);
                      }}
                      onKeyDown={(e) => e.key === "Enter" && !isThisConfirming && navigate(`/todo/${todo._id}`)}
                      className="block group cursor-pointer"
                    >
                      <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-3xl p-6 h-full flex flex-col justify-between hover:bg-white/10 hover:-translate-y-1.5 transition-all duration-300 hover:border-cyan-500/30 hover:shadow-[0_15px_40px_-10px_rgba(76,201,240,0.25)] relative overflow-hidden">
                        
                        <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] bg-gradient-to-r from-transparent via-white/5 to-transparent transition-transform duration-1000 ease-in-out pointer-events-none" />

                        <div className="flex justify-between items-start mb-6">
                          <div className="pr-4">
                            <h3 className="text-xl font-bold text-white mb-2 leading-tight group-hover:text-cyan-100 transition-colors">
                              {todo.title}
                            </h3>
                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                              <span className="inline-block w-2 h-2 rounded-full bg-cyan-500/50" />
                              {todo.completedCount ?? 0} / {todo.taskCount ?? 0} tasks
                            </p>
                          </div>
                          
                          <div className="flex flex-col items-end gap-3 shrink-0">
                            <ConfirmDeleteButton
                              isConfirming={isThisConfirming}
                              onRequestConfirm={(e) => {
                                e.stopPropagation();
                                setConfirmingId(todo._id);
                              }}
                              onConfirm={(e) => {
                                e.stopPropagation();
                                deleteTodoMutation.mutate({ id: todo._id });
                              }}
                              onCancel={(e) => {
                                e.stopPropagation();
                                cancelConfirm();
                              }}
                            />
                            <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-br from-cyan-300 to-blue-500">
                              {progress}%
                            </div>
                          </div>
                        </div>

                        <div className="w-full h-2.5 bg-black/30 rounded-full overflow-hidden border border-white/5 p-[1px]">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className={cn(
                              "h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 shadow-[0_0_10px_rgba(76,201,240,0.8)] relative",
                              progress === 100 && "from-emerald-400 to-cyan-500"
                            )}
                          >
                            <div className="absolute inset-0 bg-white/20 w-full h-full animate-pulse" />
                          </motion.div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </main>
    </>
  );
}