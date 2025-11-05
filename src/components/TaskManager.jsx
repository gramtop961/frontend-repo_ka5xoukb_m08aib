import { useMemo, useState } from "react";
import { Plus, CheckCircle2, Pencil, Trash2 } from "lucide-react";

function todayStr() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

export default function TaskManager({
  tasks,
  setTasks,
  activeTab, // "tasks" or "completed"
  carryOver,
  currentGoalPhases = [],
  onAllDone,
}) {
  const [form, setForm] = useState({ title: "", description: "", date: todayStr() });
  const [editingId, setEditingId] = useState(null);

  const today = todayStr();

  const filtered = useMemo(() => {
    const base = tasks.slice().sort((a, b) => (a.date || "").localeCompare(b.date || ""));
    if (activeTab === "completed") return base.filter(t => t.completed);
    // Active tasks view
    return base.filter(t => {
      if (t.completed) return false;
      if (t.date === today) return true; // today's tasks
      const isUpcoming = t.date > today;
      const isPast = t.date < today;
      if (isUpcoming) return false; // upcoming not shown in main unless requested order - we'll list upcoming section separately
      if (isPast) return carryOver; // show past unfinished only if carryOver enabled
      return false;
    });
  }, [tasks, activeTab, today, carryOver]);

  const upcoming = useMemo(() => tasks.filter(t => !t.completed && t.date > today).sort((a,b)=>a.date.localeCompare(b.date)), [tasks, today]);
  const pendingPast = useMemo(() => tasks.filter(t => !t.completed && t.date < today), [tasks, today]);

  const addTask = () => {
    const title = form.title.trim();
    if (!title) return;
    const t = {
      id: crypto.randomUUID(),
      title,
      description: form.description.trim(),
      date: form.date,
      completed: false,
      createdAt: Date.now(),
    };
    setTasks(prev => [t, ...prev]);
    setForm({ title: "", description: "", date: today });
  };

  const toggleDone = (id) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed, completedAt: !t.completed ? Date.now() : undefined } : t));
  };

  const startEdit = (t) => {
    setEditingId(t.id);
    setForm({ title: t.title, description: t.description || "", date: t.date });
  };
  const saveEdit = () => {
    setTasks(prev => prev.map(t => t.id === editingId ? { ...t, title: form.title.trim() || t.title, description: form.description.trim(), date: form.date } : t));
    setEditingId(null);
    setForm({ title: "", description: "", date: today });
  };
  const removeTask = (id) => setTasks(prev => prev.filter(t => t.id !== id));

  // All done popup trigger
  const allTodayDone = useMemo(() => {
    const todays = tasks.filter(t => t.date === today);
    return todays.length > 0 && todays.every(t => t.completed);
  }, [tasks, today]);

  if (allTodayDone) onAllDone?.();

  const renderTaskItem = (t, accent) => (
    <div key={t.id} className={`flex items-start gap-3 rounded-lg border p-3 ${accent}`}>
      <button
        onClick={() => toggleDone(t.id)}
        className={`mt-0.5 rounded-full p-1 ${t.completed ? "text-green-600" : "text-zinc-500 hover:text-zinc-700"}`}
        title={t.completed ? "Mark as pending" : "Mark as done"}
      >
        <CheckCircle2 />
      </button>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div className="font-medium">{t.title}</div>
          <div className="text-xs text-zinc-500">{t.date}</div>
        </div>
        {t.description && <p className="text-sm text-zinc-600 dark:text-zinc-300">{t.description}</p>}
        <div className="mt-2 flex items-center gap-2">
          <button onClick={() => startEdit(t)} className="text-xs inline-flex items-center gap-1 px-2 py-1 rounded-md border hover:bg-zinc-50 dark:hover:bg-zinc-800"><Pencil size={14}/> Edit</button>
          <button onClick={() => removeTask(t.id)} className="text-xs inline-flex items-center gap-1 px-2 py-1 rounded-md border hover:bg-zinc-50 dark:hover:bg-zinc-800 text-red-600"><Trash2 size={14}/> Delete</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {activeTab !== "completed" && (
        <div className="rounded-xl bg-white dark:bg-zinc-900 p-4 shadow-sm ring-1 ring-black/5">
          <h2 className="text-lg font-semibold mb-3">Add a Task</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <input
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Task title"
              className="md:col-span-1 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2"
            />
            <input
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Description"
              className="md:col-span-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2"
            />
            <input
              type="date"
              value={form.date}
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2"
            />
          </div>
          <div className="mt-3 flex gap-2">
            {editingId ? (
              <>
                <button onClick={saveEdit} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 text-white px-3 py-2 hover:bg-blue-700">
                  Save
                </button>
                <button onClick={() => { setEditingId(null); setForm({ title: "", description: "", date: today }); }} className="rounded-lg px-3 py-2 border">Cancel</button>
              </>
            ) : (
              <button onClick={addTask} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 text-white px-3 py-2 hover:bg-blue-700">
                <Plus size={16}/> Add Task
              </button>
            )}
          </div>
        </div>
      )}

      {activeTab !== "completed" && currentGoalPhases.length > 0 && (
        <div className="rounded-xl p-4 shadow-sm ring-1 ring-black/5 bg-white dark:bg-zinc-900">
          <h3 className="text-md font-semibold mb-2">Current Mission Phases</h3>
          <div className="space-y-2">
            {currentGoalPhases.map(p => (
              <div key={p.id} className="rounded-lg border border-blue-200 bg-blue-50 text-blue-900 px-3 py-2">
                <span className="font-medium">{p.title}:</span> {p.currentPhase.title}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-xl p-4 shadow-sm ring-1 ring-black/5 bg-white dark:bg-zinc-900">
        {activeTab === "completed" ? (
          <>
            <h3 className="text-md font-semibold mb-3">Completed Tasks</h3>
            <div className="space-y-2">
              {tasks.filter(t => t.completed).length === 0 && (
                <p className="text-sm text-zinc-500">No completed tasks yet.</p>
              )}
              {tasks
                .filter(t => t.completed)
                .sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0))
                .map(t => renderTaskItem(t, "bg-green-50 border-green-200 text-green-900"))}
            </div>
          </>
        ) : (
          <>
            <h3 className="text-md font-semibold mb-3">Your Tasks</h3>
            <div className="space-y-3">
              {pendingPast.length > 0 && carryOver && (
                <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                  Showing {pendingPast.length} unfinished tasks from previous days (carry over enabled).
                </div>
              )}
              {filtered.length === 0 && (
                <p className="text-sm text-zinc-500">No tasks to show. Add a task above.</p>
              )}
              {filtered.map(t => {
                const accent = t.completed
                  ? "bg-green-50 border-green-200"
                  : t.date === today
                    ? "bg-yellow-50 border-yellow-200"
                    : "bg-blue-50 border-blue-200";
                return renderTaskItem(t, accent);
              })}
            </div>

            {upcoming.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-semibold mb-2 text-blue-700">Upcoming</h4>
                <div className="space-y-2">
                  {upcoming.map(t => renderTaskItem(t, "bg-blue-50 border-blue-200"))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
