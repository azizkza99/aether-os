import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

// ==========================================
// AETHER_OS // النسخة النهائية الشاملة (مع الحفظ التلقائي)
// ==========================================

const themes = {
  cyan: {
    name: 'Cyan Cyber',
    primary: 'cyan',
    border: 'border-cyan-500/30',
    text: 'text-cyan-300',
    glow: 'bg-gradient-to-r from-cyan-500/10 via-purple-600/15 to-indigo-600/10',
    accentColor: '#22d3ee',
    selection: 'selection:bg-cyan-500 selection:text-black'
  },
  green: {
    name: 'Matrix Green',
    primary: 'emerald',
    border: 'border-emerald-500/30',
    text: 'text-emerald-300',
    glow: 'bg-gradient-to-r from-emerald-500/10 via-green-600/15 to-teal-600/10',
    accentColor: '#34d399',
    selection: 'selection:bg-emerald-500 selection:text-black'
  },
  amber: {
    name: 'Amber Terminal',
    primary: 'amber',
    border: 'border-amber-500/30',
    text: 'text-amber-300',
    glow: 'bg-gradient-to-r from-amber-500/10 via-orange-600/15 to-yellow-600/10',
    accentColor: '#fbbf24',
    selection: 'selection:bg-amber-500 selection:text-black'
  },
  crimson: {
    name: 'Crimson Red',
    primary: 'rose',
    border: 'border-rose-500/30',
    text: 'text-rose-300',
    glow: 'bg-gradient-to-r from-rose-500/10 via-red-600/15 to-pink-600/10',
    accentColor: '#fb7185',
    selection: 'selection:bg-rose-500 selection:text-black'
  }
};

const initialFileSystem = {
  root: {
    type: 'directory',
    content: {
      'sys_core.dat': { type: 'file', content: 'AETHER_KERNEL_v5.0_FINAL_STABLE\nSTATUS: ALL SYSTEMS OPERATIONAL' },
      'user_profile.txt': { type: 'file', content: 'ACCESS_LEVEL: ADMINISTRATOR\nSTATUS: ACTIVE\nUSER: ABDELAZIZ\nROLE: TRADE ASSISTANT & DEV' },
      'network_map.cfg': { type: 'file', content: 'MESH_FREQ: 5.2GHz\nNODES: 12_ACTIVE\nENCRYPTION: AES-256' },
      logs: {
        type: 'directory',
        content: {
          'boot.log': { type: 'file', content: '[00:01:22] Kernel Initialized\n[00:01:25] Neural Mesh Synced' },
          'error.log': { type: 'file', content: 'NO CRITICAL ERRORS DETECTED.' }
        }
      }
    }
  }
};

const resolveDirectory = (fsRoot, path) => {
  const segments = path.split('/').filter(Boolean);
  let pointer = fsRoot.root.content;
  if (segments.length === 1 && segments[0] === 'root') return pointer;
  for (let i = 1; i < segments.length; i++) {
    const segment = segments[i];
    if (pointer[segment] && pointer[segment].type === 'directory') {
      pointer = pointer[segment].content;
    } else {
      return null;
    }
  }
  return pointer;
};

export default function App() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const logsEndRef = useRef(null);

  const [consoleOpen, setConsoleOpen] = useState(true);
  const [inputVal, setInputVal] = useState("");
  const [fileSystem, setFileSystem] = useState(initialFileSystem);
  const [currentPath, setCurrentPath] = useState('/root');
  
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // استرجاع الثيم المحفوظ مسبقاً من LocalStorage أو استخدام 'cyan' كافتراضي
  const [currentTheme, setCurrentTheme] = useState(() => {
    const savedTheme = localStorage.getItem('aether_theme');
    return themes[savedTheme] ? savedTheme : 'cyan';
  });

  const [matrixMode, setMatrixMode] = useState(false);

  const [activeTab, setActiveTab] = useState('terminal'); // 'terminal' | 'editor' | 'network'
  const [selectedFile, setSelectedFile] = useState(null);
  const [editorContent, setEditorContent] = useState("");

  const [systemStats, setSystemStats] = useState({ cpu: 16, ram: 44.2, uptime: 0 });
  const [logs, setLogs] = useState([
    "SYSTEM INITIALIZED // AETHER_OS v5.0 (ALL ENGINES ACTIVE)",
    "AUDIO, THEME, MESH & EDITOR SUBSYSTEMS LOADED SUCCESSFULLY.",
    "TYPE 'help' IN THE TERMINAL TO VIEW AVAILABLE COMMANDS."
  ]);

  const theme = themes[currentTheme];

  // حفظ الثيم في LocalStorage تلقائياً كلما تغير
  useEffect(() => {
    localStorage.setItem('aether_theme', currentTheme);
  }, [currentTheme]);

  // توليد أصوات تفاعلية عبر Web Audio API
  const playSound = (type) => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'keystroke') {
        osc.frequency.setValueAtTime(600 + Math.random() * 200, ctx.currentTime);
        gain.gain.setValueAtTime(0.015, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.03);
      } else if (type === 'exec') {
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      }
    } catch (e) {
      // متصفحات تمنع الصوت بدون تفاعل مسبق
    }
  };

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSystemStats(prev => ({
        cpu: Math.floor(Math.random() * 20) + 12,
        ram: Number((42 + Math.random() * 8).toFixed(1)),
        uptime: prev.uptime + 1
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // خلفية الكانفاس المتطورة
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    
    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const particles = Array.from({ length: matrixMode ? 80 : 50 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * (matrixMode ? 2 : 0.8),
      vy: matrixMode ? Math.random() * 4 + 2 : (Math.random() - 0.5) * 0.8,
      radius: Math.random() * 2 + 1,
      char: String.fromCharCode(0x30A0 + Math.floor(Math.random() * 96))
    }));

    let mouse = { x: -1000, y: -1000 };
    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      
      if (matrixMode) {
        ctx.fillStyle = 'rgba(0, 255, 0, 0.15)';
        ctx.font = '14px monospace';
        particles.forEach(p => {
          p.y += p.vy;
          if (p.y > height) p.y = 0;
          ctx.fillText(p.char, p.x, p.y);
        });
      } else {
        ctx.fillStyle = theme.accentColor;
        ctx.strokeStyle = theme.accentColor;
        ctx.lineWidth = 1;
        
        particles.forEach((p, i) => {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0 || p.x > width) p.vx *= -1;
          if (p.y < 0 || p.y > height) p.vy *= -1;
          
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = theme.accentColor;
          ctx.fill();

          const dxM = mouse.x - p.x;
          const dyM = mouse.y - p.y;
          const distM = Math.sqrt(dxM * dxM + dyM * dyM);
          if (distM < 180) {
            ctx.strokeStyle = theme.accentColor;
            ctx.globalAlpha = 1 - distM / 180;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
            ctx.globalAlpha = 1.0;
          }

          for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const dx = p.x - p2.x;
            const dy = p.y - p2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 120) {
              ctx.strokeStyle = theme.accentColor;
              ctx.globalAlpha = 0.15 * (1 - dist / 120);
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
              ctx.globalAlpha = 1.0;
            }
          }
        });
      }
      animationFrameId = requestAnimationFrame(render);
    };
    render();

    gsap.fromTo(
      ".quantum-card",
      { y: 40, opacity: 0, scale: 0.98 },
      { y: 0, opacity: 1, scale: 1, duration: 1, stagger: 0.1, ease: "power4.out" }
    );

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [currentTheme, matrixMode]);

  const triggerProtocol = () => {
    playSound('exec');
    setLogs(prev => [...prev, `[EXEC] QUANTUM OVERLOAD SEQUENCE ENGAGED AT ${new Date().toLocaleTimeString()}`]);
    gsap.to(".quantum-core-glow", {
      scale: 1.6,
      opacity: 0.9,
      duration: 0.3,
      yoyo: true,
      repeat: 1,
      ease: "power2.out"
    });
  };

  // تعريف الأوامر الشاملة
  const getCommands = () => ({
    help: {
      description: "عرض قائمة الأوامر المتاحة مع الوصف.",
      execute: () => {
        let output = "AVAILABLE COMMANDS:\n";
        Object.entries(getCommands()).forEach(([cmd, data]) => {
          output += `  ${cmd.padEnd(15)} - ${data.description}\n`;
        });
        return output;
      }
    },
    status: {
      description: "عرض حالة النظام الحية (CPU, RAM).",
      execute: () => `SYSTEM STATUS: SECURE\n  CPU LOAD: ${systemStats.cpu}%\n  RAM USAGE: ${systemStats.ram}%\n  ACTIVE THEME: ${theme.name}`
    },
    theme: {
      description: "تغيير ثيم النظام. الاستخدام: theme <cyan|green|amber|crimson>",
      execute: (args) => {
        const tName = args[1]?.toLowerCase();
        if (themes[tName]) {
          setCurrentTheme(tName);
          return `THEME SUCCESSFULLY SWITCHED TO: ${themes[tName].name}`;
        }
        return `ERROR: Invalid theme. Available: cyan, green, amber, crimson`;
      }
    },
    ls: {
      description: "استعراض محتويات المجلد الحالي.",
      execute: () => {
        const targetDir = resolveDirectory(fileSystem, currentPath);
        if (!targetDir) return `ERROR: Path not found`;
        let output = `Directory: ${currentPath}\n`;
        Object.entries(targetDir).forEach(([name, data]) => {
          output += `  ${data.type === 'directory' ? '[DIR] ' : '[FILE]'} ${name}\n`;
        });
        return output;
      }
    },
    cd: {
      description: "الانتقال بين المجلدات. الاستخدام: cd <directory> أو cd ..",
      execute: (args) => {
        const target = args[1];
        if (!target || target === '.') return currentPath;
        if (target === '..') {
          if (currentPath === '/root') return "ALREADY AT ROOT.";
          const segs = currentPath.split('/').filter(Boolean);
          segs.pop();
          const newPath = '/' + segs.join('/');
          setCurrentPath(newPath);
          return `Moved to ${newPath}`;
        }
        const targetDir = resolveDirectory(fileSystem, currentPath);
        if (targetDir && targetDir[target] && targetDir[target].type === 'directory') {
          const newPath = currentPath === '/root' ? `/root/${target}` : `${currentPath}/${target}`;
          setCurrentPath(newPath);
          return `Moved to ${newPath}`;
        }
        return `ERROR: DIRECTORY '${target}' NOT FOUND`;
      }
    },
    cat: {
      description: "عرض محتوى ملف نصي. الاستخدام: cat <filename>",
      execute: (args) => {
        const fileName = args[1];
        if (!fileName) return "ERROR: Filename missing. Usage: cat <filename>";
        const targetDir = resolveDirectory(fileSystem, currentPath);
        const file = targetDir ? targetDir[fileName] : null;
        if (file && file.type === 'file') {
          setSelectedFile(fileName);
          setEditorContent(file.content);
          return `--- Content of ${currentPath}/${fileName} ---\n${file.content}\n[INFO: File loaded into Neural Editor tab]`;
        }
        return `ERROR: FILE '${fileName}' NOT FOUND`;
      }
    },
    edit: {
      description: "فتح ملف في محرر النصوص المرئي. الاستخدام: edit <filename>",
      execute: (args) => {
        const fileName = args[1];
        const targetDir = resolveDirectory(fileSystem, currentPath);
        const file = targetDir ? targetDir[fileName] : null;
        if (file && file.type === 'file') {
          setSelectedFile(fileName);
          setEditorContent(file.content);
          setActiveTab('editor');
          return `OPENED '${fileName}' IN NEURAL EDITOR.`;
        }
        return `ERROR: FILE NOT FOUND FOR EDITING.`;
      }
    },
    mkdir: {
      description: "إنشاء مجلد جديد. الاستخدام: mkdir <dirname>",
      execute: (args) => {
        const dirName = args[1];
        if (!dirName) return "ERROR: Directory name missing.";
        const newFs = JSON.parse(JSON.stringify(fileSystem));
        const targetDir = resolveDirectory(newFs, currentPath);
        if (!targetDir) return `ERROR: Path not found`;
        if (targetDir[dirName]) return `ERROR: '${dirName}' already exists`;
        targetDir[dirName] = { type: 'directory', content: {} };
        setFileSystem(newFs);
        return `DIRECTORY '${dirName}' CREATED SUCCESSFULLY.`;
      }
    },
    touch: {
      description: "إنشاء ملف جديد. الاستخدام: touch <filename>",
      execute: (args) => {
        const fileName = args[1];
        if (!fileName) return "ERROR: Filename missing.";
        const newFs = JSON.parse(JSON.stringify(fileSystem));
        const targetDir = resolveDirectory(newFs, currentPath);
        if (!targetDir) return `ERROR: Path not found`;
        if (targetDir[fileName]) return `ERROR: '${fileName}' already exists`;
        targetDir[fileName] = { type: 'file', content: 'NEW_BUFFER_DATA' };
        setFileSystem(newFs);
        return `FILE '${fileName}' CREATED SUCCESSFULLY.`;
      }
    },
    rm: {
      description: "حذف ملف أو مجلد. الاستخدام: rm <name>",
      execute: (args) => {
        const name = args[1];
        if (!name) return "ERROR: Name missing.";
        const newFs = JSON.parse(JSON.stringify(fileSystem));
        const targetDir = resolveDirectory(newFs, currentPath);
        if (!targetDir || !targetDir[name]) return `ERROR: '${name}' not found`;
        delete targetDir[name];
        setFileSystem(newFs);
        return `REMOVED '${name}'.`;
      }
    },
    matrix: {
      description: "تفعيل أو إلغاء تأثير المطر الرقمي.",
      execute: () => {
        setMatrixMode(!matrixMode);
        return matrixMode ? "MATRIX RAIN DEACTIVATED." : "MATRIX RAIN ACTIVATED.";
      }
    },
    sudo: {
      description: "تنفيذ صلاحيات الجذر العليا.",
      execute: () => "ACCESS GRANTED: Welcome back, Administrator Abdelaziz. All systems are fully subordinate to your commands."
    },
    coffee: {
      description: "تحضير فنجان قهوة وهمي عبر نظام التشغيل.",
      execute: () => "☕ [BREW_SUCCESS] Hot Arabic coffee is ready. Caffeine levels optimized for maximum development speed!"
    },
    whoami: {
      description: "عرض معلومات المستخدم الحالي.",
      execute: () => "root (ADMINISTRATOR // AETHER_OS SECURE SHELL)"
    },
    pulse: {
      description: "إطلاق نبض تزامن الشبكة الكمومية.",
      execute: () => {
        triggerProtocol();
        return "QUANTUM OVERLOAD SIGNAL BROADCASTED.";
      }
    },
    clear: {
      description: "مسح نافذة التيرمينال.",
      execute: () => "CLEAR_CONSOLE"
    }
  });

  const handleCommandSubmit = (e) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    playSound('exec');
    const trimmedInput = inputVal.trim();
    setCommandHistory(prev => [...prev, trimmedInput]);
    setHistoryIndex(-1);

    const args = trimmedInput.split(/\s+/);
    const cmd = args[0].toLowerCase();
    let response = "";

    setLogs(prev => [...prev, `> ${trimmedInput}`]);

    const activeCommands = getCommands();
    if (activeCommands[cmd]) {
      response = activeCommands[cmd].execute(args);
      if (response === "CLEAR_CONSOLE") {
        setLogs(["SYSTEM CONSOLE CLEARED."]);
        setInputVal("");
        return;
      }
    } else {
      response = `UNKNOWN COMMAND: '${cmd}'. TYPE 'help' FOR AVAILABLE COMMANDS.`;
    }

    setLogs(prev => [...prev, response]);
    setInputVal("");
  };

  const handleKeyDown = (e) => {
    playSound('keystroke');

    if (e.key === 'Tab') {
      e.preventDefault();
      const inputParts = inputVal.trim().split(/\s+/);
      const cmds = Object.keys(getCommands());
      
      if (inputParts.length <= 1) {
        const match = cmds.find(c => c.startsWith(inputParts[0] || ''));
        if (match) setInputVal(match);
      } else {
        const targetDir = resolveDirectory(fileSystem, currentPath);
        if (targetDir) {
          const files = Object.keys(targetDir);
          const match = files.find(f => f.startsWith(inputParts[1] || ''));
          if (match) {
            setInputVal(`${inputParts[0]} ${match}`);
          }
        }
      }
      return;
    }

    if (commandHistory.length === 0) return;

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const nextIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(historyIndex - 1, 0);
      setHistoryIndex(nextIndex);
      setInputVal(commandHistory[nextIndex]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex === -1) return;
      const nextIndex = historyIndex + 1;
      if (nextIndex >= commandHistory.length) {
        setHistoryIndex(-1);
        setInputVal("");
      } else {
        setHistoryIndex(nextIndex);
        setInputVal(commandHistory[nextIndex]);
      }
    }
  };

  const saveFileContent = () => {
    if (!selectedFile) return;
    const newFs = JSON.parse(JSON.stringify(fileSystem));
    const targetDir = resolveDirectory(newFs, currentPath);
    if (targetDir && targetDir[selectedFile]) {
      targetDir[selectedFile].content = editorContent;
      setFileSystem(newFs);
      alert(`File '${selectedFile}' saved successfully!`);
    }
  };

  return (
    <div ref={containerRef} className={`min-h-screen bg-[#020205] text-white font-sans ${theme.selection} overflow-x-hidden relative`}>
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />
      <div className={`quantum-core-glow fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] ${theme.glow} rounded-full blur-[160px] pointer-events-none z-0 transition-all duration-500`} />

      {/* Header */}
      <header className={`relative z-50 flex items-center justify-between px-8 py-5 border-b ${theme.border} backdrop-blur-2xl bg-black/40`}>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full animate-pulse shadow-[0_0_15px]" style={{ backgroundColor: theme.accentColor }} />
          <span className="font-mono tracking-widest text-xs font-bold" style={{ color: theme.accentColor }}>
            AETHER_OS // {theme.name.toUpperCase()} (FULL SUITE)
          </span>
        </div>
        
        {/* الثيمات السريعة */}
        <div className="hidden lg:flex items-center gap-2 bg-white/[0.03] px-3 py-1.5 rounded-full border border-white/10">
          <span className="text-[10px] font-mono text-gray-400">THEME:</span>
          {Object.keys(themes).map(tKey => (
            <button
              key={tKey}
              onClick={() => setCurrentTheme(tKey)}
              className={`px-2 py-0.5 text-[10px] font-mono rounded transition-all ${currentTheme === tKey ? 'bg-white/20 font-bold text-white' : 'text-gray-400 hover:text-white'}`}
            >
              {tKey}
            </button>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-6 text-xs text-gray-400 font-mono tracking-wider">
          <span>CPU: {systemStats.cpu}%</span>
          <span>RAM: {systemStats.ram}%</span>
          <span>UPTIME: {systemStats.uptime}s</span>
        </div>

        <button 
          onClick={() => setConsoleOpen(!consoleOpen)}
          className={`px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider bg-${theme.primary}-500/10 hover:bg-${theme.primary}-500/20 border ${theme.border} rounded-xl transition-all duration-300 backdrop-blur-md cursor-pointer`}
          style={{ color: theme.accentColor }}
        >
          {consoleOpen ? "Hide Console" : "Show Console"}
        </button>
      </header>

      {/* Main Workspace */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-${theme.primary}-500/10 border ${theme.border} text-xs font-mono mb-4`} style={{ color: theme.accentColor }}>
              ✦ FULL SUITE DEPLOYED // TAB AUTOCOMPLETE & AUDIO ENABLED
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight">
              Neural Command Center.
            </h1>
          </div>

          {/* تبديل التبويبات */}
          <div className="flex gap-2 bg-black/60 p-1.5 rounded-2xl border border-white/10 backdrop-blur-md">
            <button
              onClick={() => setActiveTab('terminal')}
              className={`px-4 py-2 text-xs font-mono font-bold rounded-xl transition-all ${activeTab === 'terminal' ? 'bg-white/10 text-white shadow' : 'text-gray-400 hover:text-white'}`}
            >
              Terminal
            </button>
            <button
              onClick={() => setActiveTab('editor')}
              className={`px-4 py-2 text-xs font-mono font-bold rounded-xl transition-all ${activeTab === 'editor' ? 'bg-white/10 text-white shadow' : 'text-gray-400 hover:text-white'}`}
            >
              Neural Editor
            </button>
            <button
              onClick={() => setActiveTab('network')}
              className={`px-4 py-2 text-xs font-mono font-bold rounded-xl transition-all ${activeTab === 'network' ? 'bg-white/10 text-white shadow' : 'text-gray-400 hover:text-white'}`}
            >
              Mesh Nodes
            </button>
          </div>
        </div>

        {/* محتوى التبويبات */}
        {activeTab === 'terminal' && consoleOpen && (
          <div className={`quantum-card mb-8 rounded-2xl bg-black/85 border ${theme.border} backdrop-blur-2xl overflow-hidden shadow-2xl`}>
            <div className="flex items-center justify-between px-4 py-3 bg-white/[0.03] border-b border-white/10">
              <span className="font-mono text-xs font-bold" style={{ color: theme.accentColor }}>TERMINAL // bash - aether_shell ({currentPath})</span>
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
              </div>
            </div>
            <div className="p-6 font-mono text-xs h-80 overflow-y-auto space-y-2 flex flex-col" style={{ color: theme.accentColor }}>
              {logs.map((log, index) => (
                <div key={index} className="whitespace-pre-wrap leading-relaxed">{log}</div>
              ))}
              <div ref={logsEndRef} />
            </div>
            <form onSubmit={handleCommandSubmit} className="flex border-t border-white/10 bg-black/50">
              <span className="px-4 py-3 font-mono text-xs font-bold flex items-center" style={{ color: theme.accentColor }}>root@aether:{currentPath}$</span>
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type 'help', use TAB to autocomplete, or try 'matrix', 'coffee', 'theme green'..."
                className="flex-1 bg-transparent px-2 py-3 font-mono text-xs text-white focus:outline-none"
                autoFocus
              />
              <button type="submit" className="px-6 py-3 font-mono text-xs font-bold border-l border-white/10 transition-colors cursor-pointer" style={{ color: theme.accentColor, backgroundColor: 'rgba(255,255,255,0.05)' }}>
                EXECUTE
              </button>
            </form>
          </div>
        )}

        {activeTab === 'editor' && (
          <div className={`quantum-card mb-8 rounded-2xl bg-black/85 border ${theme.border} backdrop-blur-2xl overflow-hidden shadow-2xl p-6`}>
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
              <span className="font-mono text-xs font-bold" style={{ color: theme.accentColor }}>
                NEURAL EDITOR // Active File: {selectedFile || "No file selected (Use 'edit <filename>' in terminal)"}
              </span>
              {selectedFile && (
                <button
                  onClick={saveFileContent}
                  className="px-4 py-1.5 text-xs font-mono font-bold rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 transition-all cursor-pointer"
                >
                  Save Buffer
                </button>
              )}
            </div>
            <textarea
              value={editorContent}
              onChange={(e) => setEditorContent(e.target.value)}
              placeholder="Select a file via terminal using 'edit filename.txt' or 'cat filename.txt' to view and modify its content here..."
              className="w-full h-64 bg-black/60 border border-white/10 rounded-xl p-4 font-mono text-xs text-white focus:outline-none resize-none"
            />
          </div>
        )}

        {activeTab === 'network' && (
          <div className={`quantum-card mb-8 rounded-2xl bg-black/85 border ${theme.border} backdrop-blur-2xl overflow-hidden shadow-2xl p-6`}>
            <div className="mb-4 pb-4 border-b border-white/10">
              <span className="font-mono text-xs font-bold" style={{ color: theme.accentColor }}>QUANTUM MESH NODES // Active Link Monitor</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
                <div className="text-gray-400">NODE_01 (CORE)</div>
                <div className="text-emerald-400 font-bold">STATUS: ONLINE (5.2 GHz)</div>
                <div className="text-[10px] text-gray-500">Latency: 0.2ms</div>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
                <div className="text-gray-400">NODE_02 (RELAY)</div>
                <div className="text-emerald-400 font-bold">STATUS: STABLE</div>
                <div className="text-[10px] text-gray-500">Latency: 0.8ms</div>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
                <div className="text-gray-400">NODE_03 (SECURITY)</div>
                <div className="text-emerald-400 font-bold">STATUS: ENCRYPTED</div>
                <div className="text-[10px] text-gray-500">Latency: 0.4ms</div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
