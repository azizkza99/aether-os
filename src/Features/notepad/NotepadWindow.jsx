import { useEffect, useState } from "react";

export function NotepadWindow() {
  const [note, setNote] = useState(() => {
    return localStorage.getItem("aether_scratchpad") || "// اكتب ملاحظاتك السرية هنا...\n// يتم الحفظ تلقائياً في الذاكرة المحلية.";
  });

  useEffect(() => {
    localStorage.setItem("aether_scratchpad", note);
  }, [note]);

  return (
    <div className="h-full flex flex-col p-4 bg-black/60 font-mono">
      <div className="flex justify-between items-center mb-2 pb-2 border-b border-white/10 text-xs text-white/50">
        <span>SCRATCHPAD_BUFFER.txt</span>
        <span>AUTOSAVE ACTIVE</span>
      </div>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="flex-1 bg-transparent text-white resize-none outline-none focus:ring-0 border-none text-sm leading-relaxed"
        placeholder="بدء تدفق الأفكار..."
      />
    </div>
  );
}
