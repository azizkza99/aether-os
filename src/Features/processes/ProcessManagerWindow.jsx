import { useState } from "react";

export function ProcessManagerWindow() {
  const [processes, setProcesses] = useState([
    { id: 1, name: "system_kernel", status: "running", mem: "128MB" },
    { id: 2, name: "desktop_renderer", status: "running", mem: "256MB" },
    { id: 3, name: "audio_driver", status: "idle", mem: "32MB" },
  ]);

  const killProcess = (id) => {
    setProcesses(processes.filter(p => p.id !== id));
  };

  return (
    <div className="p-4 font-mono text-xs text-white">
      <div className="flex justify-between pb-2 border-b border-white/10 mb-2">
        <span>PID // NAME</span>
        <span>STATUS</span>
      </div>
      {processes.map((proc) => (
        <div key={proc.id} className="flex justify-between py-2 border-b border-white/5 hover:bg-white/5">
          <span>{proc.id} // {proc.name}</span>
          <div className="flex gap-4">
            <span className="text-[var(--accent)]">{proc.status}</span>
            <button onClick={() => killProcess(proc.id)} className="text-red-400 hover:text-red-300">
              [KILL]
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
