// src/commands.js
export const commands = {
  help: {
    description: "عرض قائمة الأوامر المتاحة",
    execute: () => "AVAILABLE: status, pulse, clear, date, system-info, ls, cat <file>, theme <color>"
  },
  status: {
    description: "فحص حالة النظام",
    execute: () => "SYSTEM STATUS: 100% SECURE. MESH SYNAPSE STABLE. RAM: 45%. CPU: 12%."
  },
  ls: {
    description: "استعراض ملفات النظام",
    execute: () => "DIR /root/ \n ├── system.sys \n ├── user.data \n └── neural_mesh.config"
  },
  date: {
    description: "عرض الوقت",
    execute: () => new Date().toLocaleString()
  },
  // يمكنك إضافة 50 أمر هنا بسهولة!
};
