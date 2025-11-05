import { useState } from "react";
import { Trash2, Moon, Sun } from "lucide-react";

export default function UtilityPanels({ activeTab, notes, setNotes, settings, setSettings }) {
  if (activeTab === "notes") return (
    <NotesPanel notes={notes} setNotes={setNotes} />
  );
  if (activeTab === "settings") return (
    <SettingsPanel settings={settings} setSettings={setSettings} />
  );
  return null;
}

function NotesPanel({ notes, setNotes }) {
  const [text, setText] = useState("");

  const addNote = () => {
    const content = text.trim();
    if (!content) return;
    setNotes(prev => [{ id: crypto.randomUUID(), content, updatedAt: Date.now() }, ...prev]);
    setText("");
  };

  const removeNote = (id) => setNotes(prev => prev.filter(n => n.id !== id));

  const updateNote = (id, content) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, content, updatedAt: Date.now() } : n));
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-white dark:bg-zinc-900 p-4 shadow-sm ring-1 ring-black/5">
        <h2 className="text-lg font-semibold mb-3">Personal Notes</h2>
        <div className="flex gap-2">
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Write a quick note..."
            className="flex-1 h-20 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2"
          />
          <button onClick={addNote} className="self-start rounded-lg bg-blue-600 text-white px-3 py-2 hover:bg-blue-700">Add</button>
        </div>
      </div>
      <div className="rounded-xl bg-white dark:bg-zinc-900 p-4 shadow-sm ring-1 ring-black/5">
        <h3 className="text-md font-semibold mb-3">Your Notes</h3>
        <div className="grid gap-3 md:grid-cols-2">
          {notes.length === 0 && <p className="text-sm text-zinc-500">No notes yet.</p>}
          {notes.map(n => (
            <div key={n.id} className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-3">
              <textarea
                value={n.content}
                onChange={e => updateNote(n.id, e.target.value)}
                className="w-full min-h-[100px] bg-transparent focus:outline-none"
              />
              <div className="mt-2 flex items-center justify-between text-xs text-zinc-500">
                <span>{new Date(n.updatedAt).toLocaleString()}</span>
                <button onClick={() => removeNote(n.id)} className="inline-flex items-center gap-1 text-red-600"><Trash2 size={14}/> Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SettingsPanel({ settings, setSettings }) {
  const toggleDark = () => setSettings(s => ({ ...s, darkMode: !s.darkMode }));
  const toggleCarry = () => setSettings(s => ({ ...s, carryOver: !s.carryOver }));
  const toggleMotivation = () => setSettings(s => ({ ...s, motivation: !s.motivation }));

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-white dark:bg-zinc-900 p-4 shadow-sm ring-1 ring-black/5">
        <h2 className="text-lg font-semibold mb-3">Settings</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border border-zinc-200 dark:border-zinc-800 p-3">
            <div>
              <div className="font-medium">Dark Mode</div>
              <div className="text-sm text-zinc-500">Toggle the app theme</div>
            </div>
            <button onClick={toggleDark} className={`inline-flex items-center gap-2 rounded-full px-3 py-1 ring-1 ring-black/5 ${settings.darkMode ? "bg-zinc-900 text-white" : "bg-zinc-100"}`}>
              {settings.darkMode ? <Moon size={16}/> : <Sun size={16}/>} {settings.darkMode ? "On" : "Off"}
            </button>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-zinc-200 dark:border-zinc-800 p-3">
            <div>
              <div className="font-medium">Carry Over Unfinished</div>
              <div className="text-sm text-zinc-500">Show unfinished tasks from previous days</div>
            </div>
            <button onClick={toggleCarry} className={`inline-flex items-center gap-2 rounded-full px-3 py-1 ring-1 ring-black/5 ${settings.carryOver ? "bg-amber-500 text-white" : "bg-zinc-100"}`}>
              {settings.carryOver ? "Enabled" : "Disabled"}
            </button>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-zinc-200 dark:border-zinc-800 p-3">
            <div>
              <div className="font-medium">Motivational Popups</div>
              <div className="text-sm text-zinc-500">Get a cheer when you finish everything</div>
            </div>
            <button onClick={toggleMotivation} className={`inline-flex items-center gap-2 rounded-full px-3 py-1 ring-1 ring-black/5 ${settings.motivation ? "bg-green-600 text-white" : "bg-zinc-100"}`}>
              {settings.motivation ? "Enabled" : "Disabled"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
