import { Home, CheckCircle2, Target, StickyNote, Settings } from "lucide-react";

export default function TabsNav({ activeTab, onChange }) {
  const tabs = [
    { key: "tasks", label: "Tasks", icon: Home },
    { key: "completed", label: "Completed", icon: CheckCircle2 },
    { key: "goals", label: "Goals", icon: Target },
    { key: "notes", label: "Notes", icon: StickyNote },
    { key: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <nav className="w-full flex items-center justify-between gap-2 rounded-xl bg-white/70 dark:bg-zinc-900/60 p-2 shadow-sm ring-1 ring-black/5 backdrop-blur">
      {tabs.map(({ key, label, icon: Icon }) => {
        const isActive = activeTab === key;
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`flex-1 flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400/60 ${
              isActive
                ? "bg-blue-600 text-white shadow"
                : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
            }`}
          >
            <Icon size={18} />
            <span>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
