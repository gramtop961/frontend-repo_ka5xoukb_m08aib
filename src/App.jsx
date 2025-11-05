import { useEffect, useMemo, useState } from "react";
import TabsNav from "./components/TabsNav";
import TaskManager from "./components/TaskManager";
import GoalsManager, { getCurrentGoalPhases } from "./components/GoalsManager";
import UtilityPanels from "./components/UtilityPanels";

function todayStr() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

const LS_KEY = "smart_daily_tasks_v1";

export default function App() {
  const [activeTab, setActiveTab] = useState("tasks");
  const [tasks, setTasks] = useState([]);
  const [goals, setGoals] = useState([]);
  const [notes, setNotes] = useState([]);
  const [settings, setSettings] = useState({ darkMode: false, carryOver: true, motivation: true });
  const [popup, setPopup] = useState(null);
  const [today, setToday] = useState(todayStr());

  // Load from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setTasks(parsed.tasks || []);
        setGoals(parsed.goals || []);
        setNotes(parsed.notes || []);
        setSettings(prev => ({ ...prev, ...(parsed.settings || {}) }));
      }
    } catch {}
  }, []);

  // Persist to localStorage
  useEffect(() => {
    const payload = { tasks, goals, notes, settings };
    localStorage.setItem(LS_KEY, JSON.stringify(payload));
  }, [tasks, goals, notes, settings]);

  // Dark mode class toggle
  useEffect(() => {
    const root = document.documentElement;
    if (settings.darkMode) root.classList.add("dark");
    else root.classList.remove("dark");
  }, [settings.darkMode]);

  // Daily auto refresh
  useEffect(() => {
    const interval = setInterval(() => {
      const t = todayStr();
      if (t !== today) setToday(t);
    }, 60000);
    return () => clearInterval(interval);
  }, [today]);

  // Motivational popup when all today's tasks complete
  const handleAllDone = () => {
    if (!settings.motivation) return;
    const todays = tasks.filter(t => t.date === today);
    if (todays.length > 0 && todays.every(t => t.completed)) {
      setPopup({ type: "motivation", message: "Great job! You’ve completed everything for today!" });
    }
  };

  const currentGoalPhases = useMemo(() => getCurrentGoalPhases(goals), [goals]);

  const progressPopup = (msg) => setPopup({ type: "progress", message: msg });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-zinc-950 dark:to-zinc-900 text-zinc-900 dark:text-zinc-100">
      <div className="mx-auto max-w-4xl px-4 py-6 space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Smart Daily Tasks</h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Plan smarter. Progress daily.</p>
          </div>
          <div className="rounded-lg bg-white/70 dark:bg-zinc-900/60 px-3 py-1.5 text-sm ring-1 ring-black/5 shadow-sm">
            {new Date(today).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
          </div>
        </header>

        <TabsNav activeTab={activeTab} onChange={setActiveTab} />

        {activeTab === "goals" && (
          <GoalsManager goals={goals} setGoals={setGoals} onProgress={progressPopup} />
        )}

        {(activeTab === "tasks" || activeTab === "completed") && (
          <TaskManager
            tasks={tasks}
            setTasks={setTasks}
            activeTab={activeTab}
            carryOver={settings.carryOver}
            currentGoalPhases={currentGoalPhases}
            onAllDone={handleAllDone}
          />
        )}

        {(activeTab === "notes" || activeTab === "settings") && (
          <UtilityPanels
            activeTab={activeTab}
            notes={notes}
            setNotes={setNotes}
            settings={settings}
            setSettings={setSettings}
          />
        )}
      </div>

      {popup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="max-w-md w-full rounded-2xl bg-white dark:bg-zinc-900 p-6 shadow-xl ring-1 ring-black/5">
            <div className="text-lg font-semibold mb-2">
              {popup.type === "motivation" ? "You're on fire!" : "Progress Unlocked"}
            </div>
            <p className="text-zinc-600 dark:text-zinc-300">{popup.message}</p>
            <div className="mt-4 flex justify-end">
              <button onClick={() => setPopup(null)} className="rounded-lg bg-blue-600 text-white px-4 py-2 hover:bg-blue-700">Nice!</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
