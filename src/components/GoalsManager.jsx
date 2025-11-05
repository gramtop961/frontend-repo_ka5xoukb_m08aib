import { useMemo, useState } from "react";
import { Plus, Check, ChevronRight } from "lucide-react";

export default function GoalsManager({ goals, setGoals, onProgress }) {
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newPhaseTitle, setNewPhaseTitle] = useState("");
  const [selectedGoalId, setSelectedGoalId] = useState(null);

  const currentPhases = useMemo(() => {
    return goals.map(g => ({
      id: g.id,
      title: g.title,
      currentIndex: g.currentIndex || 0,
      currentPhase: g.phases?.[g.currentIndex || 0] || null,
    }));
  }, [goals]);

  const addGoal = () => {
    const title = newGoalTitle.trim();
    if (!title) return;
    const goal = {
      id: crypto.randomUUID(),
      title,
      phases: [],
      currentIndex: 0,
      createdAt: Date.now(),
    };
    setGoals(prev => [goal, ...prev]);
    setNewGoalTitle("");
    onProgress?.("New goal added! Keep pushing forward.");
  };

  const addPhase = () => {
    if (!selectedGoalId) return;
    const title = newPhaseTitle.trim();
    if (!title) return;
    setGoals(prev => prev.map(g => {
      if (g.id !== selectedGoalId) return g;
      return {
        ...g,
        phases: [...g.phases, { id: crypto.randomUUID(), title, completed: false }],
      };
    }));
    setNewPhaseTitle("");
  };

  const completeCurrentPhase = (goalId) => {
    setGoals(prev => prev.map(g => {
      if (g.id !== goalId) return g;
      const idx = g.currentIndex || 0;
      if (!g.phases[idx]) return g;
      const newPhases = g.phases.slice();
      newPhases[idx] = { ...newPhases[idx], completed: true };
      const nextIndex = idx + 1 < newPhases.length ? idx + 1 : idx; // stay if no next
      const progressed = idx + 1 < newPhases.length;
      if (progressed) {
        onProgress?.("Phase complete! Next phase unlocked.");
      }
      return { ...g, phases: newPhases, currentIndex: nextIndex };
    }));
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-white dark:bg-zinc-900 p-4 shadow-sm ring-1 ring-black/5">
        <h2 className="text-lg font-semibold mb-3">Create a Goal / Mission</h2>
        <div className="flex gap-2">
          <input
            value={newGoalTitle}
            onChange={e => setNewGoalTitle(e.target.value)}
            placeholder="Goal title (e.g., Learn Spanish)"
            className="flex-1 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button onClick={addGoal} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 text-white px-3 py-2 hover:bg-blue-700">
            <Plus size={16}/> Add
          </button>
        </div>
      </div>

      <div className="rounded-xl bg-white dark:bg-zinc-900 p-4 shadow-sm ring-1 ring-black/5">
        <h3 className="text-md font-semibold mb-3">Add Phases</h3>
        <div className="flex gap-2 mb-3">
          <select
            value={selectedGoalId || ""}
            onChange={e => setSelectedGoalId(e.target.value || null)}
            className="flex-1 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2"
          >
            <option value="">Select a goal</option>
            {goals.map(g => (
              <option key={g.id} value={g.id}>{g.title}</option>
            ))}
          </select>
          <input
            value={newPhaseTitle}
            onChange={e => setNewPhaseTitle(e.target.value)}
            placeholder="Phase title"
            className="flex-1 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2"
          />
          <button onClick={addPhase} className="rounded-lg bg-amber-500 text-white px-3 py-2 hover:bg-amber-600">
            Add Phase
          </button>
        </div>

        <div className="space-y-4">
          {goals.length === 0 && (
            <p className="text-sm text-zinc-500">No goals yet. Add one above.</p>
          )}
          {goals.map(g => (
            <div key={g.id} className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-3">
              <div className="flex items-center justify-between">
                <div className="font-medium">{g.title}</div>
                {g.phases.length > 0 && (
                  <button
                    onClick={() => completeCurrentPhase(g.id)}
                    className="inline-flex items-center gap-1 rounded-md bg-green-600 text-white px-2 py-1 text-sm hover:bg-green-700"
                  >
                    <Check size={14}/> Complete current phase
                  </button>
                )}
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {g.phases.map((p, i) => (
                  <span key={p.id} className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs border ${p.completed ? "bg-green-100 text-green-700 border-green-200" : i === (g.currentIndex || 0) ? "bg-yellow-100 text-yellow-800 border-yellow-200" : "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700"}`}>
                    {p.title}
                    {i === (g.currentIndex || 0) && !p.completed && <ChevronRight size={12}/>}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl bg-white dark:bg-zinc-900 p-4 shadow-sm ring-1 ring-black/5">
        <h3 className="text-md font-semibold mb-3">Current Phases</h3>
        <div className="space-y-2">
          {currentPhases.filter(c => !!c.currentPhase).length === 0 && (
            <p className="text-sm text-zinc-500">No phases to show yet.</p>
          )}
          {currentPhases.filter(c => !!c.currentPhase).map(c => (
            <div key={c.id} className="rounded-lg border border-blue-200 bg-blue-50 text-blue-900 px-3 py-2">
              <span className="font-medium">{c.title}:</span> {c.currentPhase?.title}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function getCurrentGoalPhases(goals) {
  return goals
    .map(g => ({
      id: g.id,
      title: g.title,
      currentPhase: g.phases?.[g.currentIndex || 0] || null,
    }))
    .filter(x => x.currentPhase);
}
