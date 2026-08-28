import { useEffect, useRef, useState } from 'react'

const THEME_STORAGE_KEY = 'aether-theme:v1'

const themes = {
  cyan: {
    name: 'Cyan Cyber',
    border: 'border-cyan-500/30',
    glow: 'bg-gradient-to-r from-cyan-500/10 via-purple-600/15 to-indigo-600/10',
    accentColor: '#22d3ee',
    selection: 'selection:bg-cyan-500 selection:text-black',
  },
  green: {
    name: 'Matrix Green',
    border: 'border-emerald-500/30',
    glow: 'bg-gradient-to-r from-emerald-500/10 via-green-600/15 to-teal-600/10',
    accentColor: '#34d399',
    selection: 'selection:bg-emerald-500 selection:text-black',
  },
  amber: {
    name: 'Amber Terminal',
    border: 'border-amber-500/30',
    glow: 'bg-gradient-to-r from-amber-500/10 via-orange-600/15 to-yellow-600/10',
    accentColor: '#fbbf24',
    selection: 'selection:bg-amber-500 selection:text-black',
  },
  crimson: {
    name: 'Crimson Red',
    border: 'border-rose-500/30',
    glow: 'bg-gradient-to-r from-rose-500/10 via-red-600/15 to-pink-600/10',
    accentColor: '#fb7185',
    selection: 'selection:bg-rose-500 selection:text-black',
  },
}

const initialFileSystem = {
  root: {
    type: 'directory',
    content: {
      'sys_core.dat': {
        type: 'file',
        content:
          'AETHER_BROWSER_SIM_v1.0\nMODE: LOCAL INTERACTIVE DEMO\nBOUNDARY: NO DEVICE OR NETWORK ACCESS',
      },
      'user_profile.txt': {
        type: 'file',
        content:
          'USER: ABDELAZIZ\nROLE: INDUSTRIAL ENGINEER & WEB SYSTEMS DEVELOPER\nWORKSPACE: PORTFOLIO SIMULATION',
      },
      'network_map.cfg': {
        type: 'file',
        content:
          'DATA_SOURCE: GENERATED IN BROWSER\nNODES: 3_SIMULATED\nNETWORK_ACCESS: NONE',
      },
      logs: {
        type: 'directory',
        content: {
          'boot.log': {
            type: 'file',
            content:
              '[00:00:01] Browser simulation initialized\n[00:00:02] Local demo state ready',
          },
          'error.log': {
            type: 'file',
            content: 'NO APPLICATION ERRORS RECORDED IN THIS DEMO SESSION.',
          },
        },
      },
    },
  },
}

const networkNodes = [
  { name: 'NODE_01 / CORE', status: 'SIMULATED · ONLINE', latency: '0.2 ms' },
  { name: 'NODE_02 / RELAY', status: 'SIMULATED · STABLE', latency: '0.8 ms' },
  { name: 'NODE_03 / GUARD', status: 'SIMULATED · READY', latency: '0.4 ms' },
]

function resolveDirectory(fsRoot, path) {
  const segments = path.split('/').filter(Boolean)
  let pointer = fsRoot.root.content

  if (segments.length === 1 && segments[0] === 'root') return pointer

  for (let index = 1; index < segments.length; index += 1) {
    const segment = segments[index]
    if (pointer[segment]?.type !== 'directory') return null
    pointer = pointer[segment].content
  }

  return pointer
}

function getSavedTheme() {
  try {
    const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)
    return themes[savedTheme] ? savedTheme : 'cyan'
  } catch {
    return 'cyan'
  }
}

function cloneFileSystem(fileSystem) {
  return JSON.parse(JSON.stringify(fileSystem))
}

export default function App() {
  const canvasRef = useRef(null)
  const logsEndRef = useRef(null)
  const audioContextRef = useRef(null)
  const pulseTimeoutRef = useRef(null)

  const [consoleOpen, setConsoleOpen] = useState(true)
  const [inputVal, setInputVal] = useState('')
  const [fileSystem, setFileSystem] = useState(initialFileSystem)
  const [currentPath, setCurrentPath] = useState('/root')
  const [commandHistory, setCommandHistory] = useState([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [currentTheme, setCurrentTheme] = useState(getSavedTheme)
  const [matrixMode, setMatrixMode] = useState(false)
  const [activeTab, setActiveTab] = useState('terminal')
  const [selectedFile, setSelectedFile] = useState(null)
  const [selectedFilePath, setSelectedFilePath] = useState('/root')
  const [editorContent, setEditorContent] = useState('')
  const [editorStatus, setEditorStatus] = useState('')
  const [pulseActive, setPulseActive] = useState(false)
  const [systemStats, setSystemStats] = useState({
    cpu: 16,
    ram: 44.2,
    uptime: 0,
  })
  const [logs, setLogs] = useState([
    'SIMULATION READY // AETHER_OS browser demo',
    'LOCAL FILE BUFFER, GENERATED TELEMETRY & VISUAL MESH LOADED.',
    "TYPE 'help' TO EXPLORE. THIS DEMO HAS NO DEVICE OR NETWORK ACCESS.",
  ])

  const theme = themes[currentTheme]

  useEffect(() => {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, currentTheme)
    } catch {
      // The simulation still works when storage is unavailable.
    }
  }, [currentTheme])

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    logsEndRef.current?.scrollIntoView({
      behavior: reducedMotion ? 'auto' : 'smooth',
    })
  }, [logs])

  useEffect(() => {
    const interval = window.setInterval(() => {
      setSystemStats((previous) => ({
        cpu: Math.floor(Math.random() * 20) + 12,
        ram: Number((42 + Math.random() * 8).toFixed(1)),
        uptime: previous.uptime + 1,
      }))
    }, 2000)

    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return undefined

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    let animationFrameId
    let width = window.innerWidth
    let height = window.innerHeight

    const resize = () => {
      width = window.innerWidth
      height = window.innerHeight
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.floor(width * pixelRatio)
      canvas.height = Math.floor(height * pixelRatio)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
    }

    resize()

    const particles = Array.from(
      { length: reducedMotion ? 22 : matrixMode ? 80 : 50 },
      () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: reducedMotion ? 0 : (Math.random() - 0.5) * 0.8,
        vy: reducedMotion
          ? 0
          : matrixMode
            ? Math.random() * 4 + 2
            : (Math.random() - 0.5) * 0.8,
        radius: Math.random() * 2 + 1,
        char: String.fromCharCode(0x30a0 + Math.floor(Math.random() * 96)),
      }),
    )

    const mouse = { x: -1000, y: -1000 }
    const handleMouseMove = (event) => {
      mouse.x = event.clientX
      mouse.y = event.clientY
    }

    const render = () => {
      context.clearRect(0, 0, width, height)

      if (matrixMode) {
        context.fillStyle = 'rgba(52, 211, 153, 0.28)'
        context.font = '14px ui-monospace, monospace'
        particles.forEach((particle) => {
          particle.y += particle.vy
          if (particle.y > height) particle.y = 0
          context.fillText(particle.char, particle.x, particle.y)
        })
      } else {
        particles.forEach((particle, index) => {
          particle.x += particle.vx
          particle.y += particle.vy
          if (particle.x < 0 || particle.x > width) particle.vx *= -1
          if (particle.y < 0 || particle.y > height) particle.vy *= -1

          context.beginPath()
          context.arc(
            particle.x,
            particle.y,
            particle.radius,
            0,
            Math.PI * 2,
          )
          context.fillStyle = theme.accentColor
          context.fill()

          const mouseX = mouse.x - particle.x
          const mouseY = mouse.y - particle.y
          const mouseDistance = Math.hypot(mouseX, mouseY)
          if (mouseDistance < 180) {
            context.strokeStyle = theme.accentColor
            context.globalAlpha = 1 - mouseDistance / 180
            context.beginPath()
            context.moveTo(particle.x, particle.y)
            context.lineTo(mouse.x, mouse.y)
            context.stroke()
            context.globalAlpha = 1
          }

          for (
            let secondIndex = index + 1;
            secondIndex < particles.length;
            secondIndex += 1
          ) {
            const secondParticle = particles[secondIndex]
            const distance = Math.hypot(
              particle.x - secondParticle.x,
              particle.y - secondParticle.y,
            )
            if (distance >= 120) continue

            context.strokeStyle = theme.accentColor
            context.globalAlpha = 0.15 * (1 - distance / 120)
            context.beginPath()
            context.moveTo(particle.x, particle.y)
            context.lineTo(secondParticle.x, secondParticle.y)
            context.stroke()
            context.globalAlpha = 1
          }
        })
      }

      if (!reducedMotion) animationFrameId = requestAnimationFrame(render)
    }

    window.addEventListener('resize', resize, { passive: true })
    if (!reducedMotion) {
      window.addEventListener('mousemove', handleMouseMove, { passive: true })
    }
    render()

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouseMove)
      if (animationFrameId) cancelAnimationFrame(animationFrameId)
    }
  }, [matrixMode, theme.accentColor])

  useEffect(
    () => () => {
      if (pulseTimeoutRef.current) window.clearTimeout(pulseTimeoutRef.current)
      audioContextRef.current?.close()
    },
    [],
  )

  const playSound = (type) => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext
      if (!AudioContext) return

      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        audioContextRef.current = new AudioContext()
      }

      const context = audioContextRef.current
      if (context.state === 'suspended') void context.resume()

      const oscillator = context.createOscillator()
      const gain = context.createGain()
      oscillator.connect(gain)
      gain.connect(context.destination)

      const duration = type === 'keystroke' ? 0.03 : 0.1
      const volume = type === 'keystroke' ? 0.012 : 0.035
      oscillator.frequency.setValueAtTime(
        type === 'keystroke' ? 600 + Math.random() * 200 : 440,
        context.currentTime,
      )
      if (type === 'exec') {
        oscillator.frequency.exponentialRampToValueAtTime(
          880,
          context.currentTime + duration,
        )
      }
      gain.gain.setValueAtTime(volume, context.currentTime)
      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        context.currentTime + duration,
      )
      oscillator.start()
      oscillator.stop(context.currentTime + duration)
    } catch {
      // Some browsers disable audio; all core interactions remain available.
    }
  }

  const triggerProtocol = () => {
    playSound('exec')
    setLogs((previous) => [
      ...previous,
      `[SIM] LOCAL VISUAL PULSE AT ${new Date().toLocaleTimeString()}`,
    ])
    setPulseActive(false)
    window.requestAnimationFrame(() => setPulseActive(true))
    if (pulseTimeoutRef.current) window.clearTimeout(pulseTimeoutRef.current)
    pulseTimeoutRef.current = window.setTimeout(() => {
      setPulseActive(false)
    }, 700)
  }

  const openFile = (fileName, switchToEditor) => {
    const targetDirectory = resolveDirectory(fileSystem, currentPath)
    const file = targetDirectory?.[fileName]
    if (file?.type !== 'file') return false

    setSelectedFile(fileName)
    setSelectedFilePath(currentPath)
    setEditorContent(file.content)
    setEditorStatus('')
    if (switchToEditor) setActiveTab('editor')
    return true
  }

  const getCommands = () => ({
    help: {
      description: 'List available simulation commands.',
      execute: () => {
        let output = 'AVAILABLE SIMULATION COMMANDS:\n'
        Object.entries(getCommands()).forEach(([command, data]) => {
          output += `  ${command.padEnd(15)} - ${data.description}\n`
        })
        return output
      },
    },
    status: {
      description: 'Show generated demo telemetry.',
      execute: () =>
        `SIMULATION STATUS: RUNNING\n  CPU LOAD: ${systemStats.cpu}% (GENERATED)\n  RAM USAGE: ${systemStats.ram}% (GENERATED)\n  ACTIVE THEME: ${theme.name}\n  DEVICE ACCESS: NONE`,
    },
    theme: {
      description: 'Change theme: theme <cyan|green|amber|crimson>.',
      execute: (args) => {
        const themeName = args[1]?.toLowerCase()
        if (!themes[themeName]) {
          return 'ERROR: Available themes: cyan, green, amber, crimson'
        }
        setCurrentTheme(themeName)
        return `THEME SWITCHED TO: ${themes[themeName].name}`
      },
    },
    ls: {
      description: 'List the current in-memory directory.',
      execute: () => {
        const targetDirectory = resolveDirectory(fileSystem, currentPath)
        if (!targetDirectory) return 'ERROR: Path not found'

        let output = `Simulated directory: ${currentPath}\n`
        Object.entries(targetDirectory).forEach(([name, data]) => {
          output += `  ${data.type === 'directory' ? '[DIR] ' : '[FILE]'} ${name}\n`
        })
        return output
      },
    },
    cd: {
      description: 'Navigate the in-memory file tree: cd <directory|..>.',
      execute: (args) => {
        const target = args[1]
        if (!target || target === '.') return currentPath
        if (target === '..') {
          if (currentPath === '/root') return 'ALREADY AT SIMULATED ROOT.'
          const segments = currentPath.split('/').filter(Boolean)
          segments.pop()
          const nextPath = `/${segments.join('/')}`
          setCurrentPath(nextPath)
          return `Moved to ${nextPath}`
        }

        const targetDirectory = resolveDirectory(fileSystem, currentPath)
        if (targetDirectory?.[target]?.type !== 'directory') {
          return `ERROR: DIRECTORY '${target}' NOT FOUND`
        }

        const nextPath =
          currentPath === '/root' ? `/root/${target}` : `${currentPath}/${target}`
        setCurrentPath(nextPath)
        return `Moved to ${nextPath}`
      },
    },
    cat: {
      description: 'Read a simulated text file: cat <filename>.',
      execute: (args) => {
        const fileName = args[1]
        if (!fileName) return 'ERROR: Usage: cat <filename>'
        if (!openFile(fileName, false)) return `ERROR: FILE '${fileName}' NOT FOUND`

        const file = resolveDirectory(fileSystem, currentPath)?.[fileName]
        return `--- ${currentPath}/${fileName} ---\n${file.content}\n[LOCAL BUFFER LOADED INTO EDITOR]`
      },
    },
    edit: {
      description: 'Open a simulated text file: edit <filename>.',
      execute: (args) => {
        const fileName = args[1]
        if (!fileName || !openFile(fileName, true)) {
          return 'ERROR: FILE NOT FOUND FOR EDITING.'
        }
        return `OPENED '${fileName}' IN LOCAL BUFFER EDITOR.`
      },
    },
    mkdir: {
      description: 'Create an in-memory directory: mkdir <name>.',
      execute: (args) => {
        const directoryName = args[1]
        if (!directoryName) return 'ERROR: Directory name missing.'

        const nextFileSystem = cloneFileSystem(fileSystem)
        const targetDirectory = resolveDirectory(nextFileSystem, currentPath)
        if (!targetDirectory) return 'ERROR: Path not found'
        if (targetDirectory[directoryName]) {
          return `ERROR: '${directoryName}' already exists`
        }

        targetDirectory[directoryName] = { type: 'directory', content: {} }
        setFileSystem(nextFileSystem)
        return `IN-MEMORY DIRECTORY '${directoryName}' CREATED.`
      },
    },
    touch: {
      description: 'Create an in-memory file: touch <filename>.',
      execute: (args) => {
        const fileName = args[1]
        if (!fileName) return 'ERROR: Filename missing.'

        const nextFileSystem = cloneFileSystem(fileSystem)
        const targetDirectory = resolveDirectory(nextFileSystem, currentPath)
        if (!targetDirectory) return 'ERROR: Path not found'
        if (targetDirectory[fileName]) return `ERROR: '${fileName}' already exists`

        targetDirectory[fileName] = { type: 'file', content: 'NEW_LOCAL_BUFFER' }
        setFileSystem(nextFileSystem)
        return `IN-MEMORY FILE '${fileName}' CREATED.`
      },
    },
    rm: {
      description: 'Remove an item from this session only: rm <name>.',
      execute: (args) => {
        const name = args[1]
        if (!name) return 'ERROR: Name missing.'

        const nextFileSystem = cloneFileSystem(fileSystem)
        const targetDirectory = resolveDirectory(nextFileSystem, currentPath)
        if (!targetDirectory?.[name]) return `ERROR: '${name}' not found`

        delete targetDirectory[name]
        setFileSystem(nextFileSystem)
        return `REMOVED '${name}' FROM THIS BROWSER SESSION.`
      },
    },
    matrix: {
      description: 'Toggle the local matrix canvas effect.',
      execute: () => {
        setMatrixMode((active) => !active)
        return matrixMode ? 'MATRIX EFFECT DISABLED.' : 'MATRIX EFFECT ENABLED.'
      },
    },
    sudo: {
      description: 'Explain the simulation privilege boundary.',
      execute: () =>
        'SIMULATION ONLY: no real privileges, shell, files, device, or account access.',
    },
    coffee: {
      description: 'Run the fictional coffee routine.',
      execute: () => '☕ [SIM_BREW] Virtual Arabic coffee is ready.',
    },
    whoami: {
      description: 'Show the simulated session identity.',
      execute: () => 'demo_user (BROWSER-ONLY AETHER SIMULATION)',
    },
    pulse: {
      description: 'Play a local visual pulse.',
      execute: () => {
        triggerProtocol()
        return 'LOCAL VISUAL PULSE COMPLETE. NO SIGNAL WAS BROADCAST.'
      },
    },
    clear: {
      description: 'Clear the visible terminal log.',
      execute: () => 'CLEAR_CONSOLE',
    },
  })

  const handleCommandSubmit = (event) => {
    event.preventDefault()
    if (!inputVal.trim()) return

    playSound('exec')
    const trimmedInput = inputVal.trim()
    setCommandHistory((previous) => [...previous, trimmedInput])
    setHistoryIndex(-1)

    const args = trimmedInput.split(/\s+/)
    const command = args[0].toLowerCase()
    setLogs((previous) => [...previous, `> ${trimmedInput}`])

    const activeCommands = getCommands()
    const response = activeCommands[command]
      ? activeCommands[command].execute(args)
      : `UNKNOWN COMMAND: '${command}'. TYPE 'help' FOR AVAILABLE COMMANDS.`

    if (response === 'CLEAR_CONSOLE') {
      setLogs(['SIMULATION CONSOLE CLEARED.'])
    } else {
      setLogs((previous) => [...previous, response])
    }
    setInputVal('')
  }

  const handleKeyDown = (event) => {
    if (event.key.length === 1) playSound('keystroke')

    if (event.key === 'Tab') {
      event.preventDefault()
      const inputParts = inputVal.trim().split(/\s+/)
      if (inputParts.length <= 1) {
        const command = Object.keys(getCommands()).find((name) =>
          name.startsWith(inputParts[0] || ''),
        )
        if (command) setInputVal(command)
      } else {
        const targetDirectory = resolveDirectory(fileSystem, currentPath)
        const fileName = Object.keys(targetDirectory || {}).find((name) =>
          name.startsWith(inputParts[1] || ''),
        )
        if (fileName) setInputVal(`${inputParts[0]} ${fileName}`)
      }
      return
    }

    if (commandHistory.length === 0) return

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      const nextIndex =
        historyIndex === -1
          ? commandHistory.length - 1
          : Math.max(historyIndex - 1, 0)
      setHistoryIndex(nextIndex)
      setInputVal(commandHistory[nextIndex])
    } else if (event.key === 'ArrowDown') {
      event.preventDefault()
      if (historyIndex === -1) return

      const nextIndex = historyIndex + 1
      if (nextIndex >= commandHistory.length) {
        setHistoryIndex(-1)
        setInputVal('')
      } else {
        setHistoryIndex(nextIndex)
        setInputVal(commandHistory[nextIndex])
      }
    }
  }

  const saveFileContent = () => {
    if (!selectedFile) return

    const nextFileSystem = cloneFileSystem(fileSystem)
    const targetDirectory = resolveDirectory(nextFileSystem, selectedFilePath)
    if (!targetDirectory?.[selectedFile]) {
      setEditorStatus('Unable to find the selected local buffer.')
      return
    }

    targetDirectory[selectedFile].content = editorContent
    setFileSystem(nextFileSystem)
    setEditorStatus(`Saved ${selectedFile} in this browser session.`)
  }

  const tabButtonClass = (tabName) =>
    `rounded-xl px-4 py-2 text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--aether-accent)] ${
      activeTab === tabName
        ? 'bg-white/10 text-white shadow'
        : 'text-gray-400 hover:text-white'
    }`

  return (
    <div
      className={`relative min-h-screen overflow-x-hidden bg-[#020205] font-sans text-white ${theme.selection}`}
      style={{ '--aether-accent': theme.accentColor }}
    >
      <a className="skip-link" href="#workspace">
        Skip to workspace
      </a>
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed inset-0 z-0"
        aria-hidden="true"
      />
      <div
        className={`quantum-core-glow pointer-events-none fixed left-1/2 top-1/2 z-0 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[160px] ${theme.glow}`}
        data-pulsing={pulseActive}
        aria-hidden="true"
      />

      <header
        className={`relative z-50 border-b bg-black/50 px-4 py-4 backdrop-blur-2xl sm:px-8 ${theme.border}`}
      >
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <span
              className="h-3 w-3 shrink-0 animate-pulse rounded-full shadow-[0_0_15px_var(--aether-accent)]"
              style={{ backgroundColor: theme.accentColor }}
              aria-hidden="true"
            />
            <span
              className="truncate font-mono text-xs font-bold tracking-widest"
              style={{ color: theme.accentColor }}
            >
              AETHER_OS // BROWSER SIMULATION
            </span>
          </div>

          <div
            className="order-3 flex w-full items-center justify-center gap-1 rounded-full border border-white/10 bg-white/[0.03] p-1 sm:order-none sm:w-auto"
            aria-label="Color theme"
          >
            {Object.keys(themes).map((themeKey) => (
              <button
                key={themeKey}
                type="button"
                onClick={() => setCurrentTheme(themeKey)}
                aria-pressed={currentTheme === themeKey}
                className="rounded-full px-2.5 py-1 font-mono text-[10px] text-gray-400 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--aether-accent)] aria-pressed:bg-white/15 aria-pressed:text-white"
              >
                {themeKey}
              </button>
            ))}
          </div>

          <div className="hidden items-center gap-5 font-mono text-[10px] tracking-wider text-gray-400 xl:flex">
            <span>SIM CPU: {systemStats.cpu}%</span>
            <span>SIM RAM: {systemStats.ram}%</span>
            <span>SESSION: {systemStats.uptime}s</span>
          </div>

          <button
            type="button"
            onClick={() => setConsoleOpen((open) => !open)}
            aria-expanded={consoleOpen}
            aria-controls="terminal-panel"
            className={`aether-soft-button rounded-xl border px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider backdrop-blur-md ${theme.border}`}
          >
            {consoleOpen ? 'Hide Console' : 'Show Console'}
          </button>
        </div>
      </header>

      <main
        id="workspace"
        className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12"
      >
        <div className="mb-8 flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <div
              className={`mb-4 inline-flex items-center gap-2 rounded-full border bg-black/45 px-3 py-1 font-mono text-[10px] ${theme.border}`}
              style={{ color: theme.accentColor }}
            >
              <span aria-hidden="true">✦</span>
              INTERACTIVE PORTFOLIO DEMO // NO DEVICE OR NETWORK ACCESS
            </div>
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
              Neural Command Center
              <span style={{ color: theme.accentColor }}>.</span>
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-400 sm:text-base">
              A browser-only operating-system simulation exploring interface
              design, canvas graphics, local state, command parsing, and
              accessible interaction.
            </p>
          </div>

          <div
            className="flex w-full gap-2 overflow-x-auto rounded-2xl border border-white/10 bg-black/60 p-1.5 font-mono backdrop-blur-md lg:w-auto"
            role="tablist"
            aria-label="Aether workspaces"
          >
            <button
              id="terminal-tab"
              type="button"
              role="tab"
              aria-selected={activeTab === 'terminal'}
              aria-controls="terminal-panel"
              onClick={() => setActiveTab('terminal')}
              className={tabButtonClass('terminal')}
            >
              Terminal
            </button>
            <button
              id="editor-tab"
              type="button"
              role="tab"
              aria-selected={activeTab === 'editor'}
              aria-controls="editor-panel"
              onClick={() => setActiveTab('editor')}
              className={tabButtonClass('editor')}
            >
              Buffer Editor
            </button>
            <button
              id="network-tab"
              type="button"
              role="tab"
              aria-selected={activeTab === 'network'}
              aria-controls="network-panel"
              onClick={() => setActiveTab('network')}
              className={tabButtonClass('network')}
            >
              Mesh Simulation
            </button>
          </div>
        </div>

        {activeTab === 'terminal' && (
          <section
            id="terminal-panel"
            role="tabpanel"
            aria-labelledby="terminal-tab"
            className={`quantum-card mb-8 overflow-hidden rounded-2xl border bg-black/85 shadow-2xl backdrop-blur-2xl ${theme.border}`}
          >
            {consoleOpen ? (
              <>
                <div className="flex items-center justify-between gap-4 border-b border-white/10 bg-white/[0.03] px-4 py-3">
                  <span
                    className="font-mono text-xs font-bold"
                    style={{ color: theme.accentColor }}
                  >
                    LOCAL TERMINAL // {currentPath}
                  </span>
                  <div className="flex gap-2" aria-hidden="true">
                    <span className="h-3 w-3 rounded-full bg-red-500/60" />
                    <span className="h-3 w-3 rounded-full bg-yellow-500/60" />
                    <span className="h-3 w-3 rounded-full bg-green-500/60" />
                  </div>
                </div>
                <div
                  className="flex h-80 flex-col space-y-2 overflow-y-auto p-5 font-mono text-xs sm:p-6"
                  style={{ color: theme.accentColor }}
                  role="log"
                  aria-live="polite"
                  aria-label="Terminal output"
                >
                  {logs.map((log, index) => (
                    <div key={`${index}-${log}`} className="whitespace-pre-wrap leading-relaxed">
                      {log}
                    </div>
                  ))}
                  <div ref={logsEndRef} />
                </div>
                <form
                  onSubmit={handleCommandSubmit}
                  className="flex flex-col border-t border-white/10 bg-black/50 sm:flex-row"
                >
                  <label className="sr-only" htmlFor="aether-command">
                    Simulation command
                  </label>
                  <span
                    className="flex items-center px-4 pt-3 font-mono text-xs font-bold sm:py-3"
                    style={{ color: theme.accentColor }}
                    aria-hidden="true"
                  >
                    demo@aether:{currentPath}$
                  </span>
                  <input
                    id="aether-command"
                    type="text"
                    value={inputVal}
                    onChange={(event) => setInputVal(event.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Try: help, status, edit user_profile.txt, theme green"
                    autoComplete="off"
                    spellCheck="false"
                    className="min-w-0 flex-1 bg-transparent px-4 py-3 font-mono text-xs text-white outline-none placeholder:text-gray-600 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--aether-accent)]"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="border-t border-white/10 px-6 py-3 font-mono text-xs font-bold transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--aether-accent)] sm:border-s sm:border-t-0"
                    style={{ color: theme.accentColor }}
                  >
                    Execute
                  </button>
                </form>
              </>
            ) : (
              <div className="p-10 text-center">
                <p className="font-mono text-sm text-gray-300">Console paused.</p>
                <p className="mt-2 text-xs text-gray-500">
                  Use “Show Console” to resume the local simulation.
                </p>
              </div>
            )}
          </section>
        )}

        {activeTab === 'editor' && (
          <section
            id="editor-panel"
            role="tabpanel"
            aria-labelledby="editor-tab"
            className={`quantum-card mb-8 overflow-hidden rounded-2xl border bg-black/85 p-5 shadow-2xl backdrop-blur-2xl sm:p-6 ${theme.border}`}
          >
            <div className="mb-4 flex flex-col justify-between gap-4 border-b border-white/10 pb-4 sm:flex-row sm:items-center">
              <div>
                <p
                  className="font-mono text-xs font-bold"
                  style={{ color: theme.accentColor }}
                >
                  LOCAL BUFFER EDITOR
                </p>
                <p className="mt-1 font-mono text-[10px] text-gray-500">
                  {selectedFile
                    ? `${selectedFilePath}/${selectedFile}`
                    : "Use 'edit <filename>' in the terminal to select a file."}
                </p>
              </div>
              {selectedFile ? (
                <button
                  type="button"
                  onClick={saveFileContent}
                  className="rounded-lg border border-emerald-500/30 bg-emerald-500/20 px-4 py-2 font-mono text-xs font-bold text-emerald-300 transition hover:bg-emerald-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
                >
                  Save local session
                </button>
              ) : null}
            </div>
            <label className="sr-only" htmlFor="aether-editor">
              Selected simulated file contents
            </label>
            <textarea
              id="aether-editor"
              value={editorContent}
              onChange={(event) => {
                setEditorContent(event.target.value)
                setEditorStatus('')
              }}
              disabled={!selectedFile}
              placeholder="No local buffer selected."
              className="h-72 w-full resize-none rounded-xl border border-white/10 bg-black/60 p-4 font-mono text-xs leading-6 text-white outline-none placeholder:text-gray-600 focus-visible:ring-2 focus-visible:ring-[var(--aether-accent)] disabled:cursor-not-allowed disabled:opacity-60"
            />
            <p className="mt-3 min-h-5 font-mono text-[10px] text-emerald-300" role="status">
              {editorStatus}
            </p>
          </section>
        )}

        {activeTab === 'network' && (
          <section
            id="network-panel"
            role="tabpanel"
            aria-labelledby="network-tab"
            className={`quantum-card mb-8 overflow-hidden rounded-2xl border bg-black/85 p-5 shadow-2xl backdrop-blur-2xl sm:p-6 ${theme.border}`}
          >
            <div className="mb-6 border-b border-white/10 pb-5">
              <div className="flex flex-wrap items-center gap-3">
                <p
                  className="font-mono text-xs font-bold"
                  style={{ color: theme.accentColor }}
                >
                  MESH VISUALIZATION
                </p>
                <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-1 font-mono text-[9px] text-amber-300">
                  SIMULATED DATA
                </span>
              </div>
              <p className="mt-3 max-w-2xl text-xs leading-6 text-gray-500">
                These values are generated for interface demonstration. Aether
                does not inspect your connection, device, or local network.
              </p>
            </div>
            <div className="grid gap-4 font-mono text-xs md:grid-cols-3">
              {networkNodes.map((node) => (
                <article
                  key={node.name}
                  className="space-y-3 rounded-xl border border-white/10 bg-white/[0.03] p-5"
                >
                  <p className="text-gray-400">{node.name}</p>
                  <p className="font-bold text-emerald-400">{node.status}</p>
                  <p className="text-[10px] text-gray-500">
                    Generated latency: {node.latency}
                  </p>
                </article>
              ))}
            </div>
          </section>
        )}

        <footer className="mt-12 flex flex-col justify-between gap-3 border-t border-white/10 py-6 font-mono text-[10px] tracking-wide text-gray-600 sm:flex-row">
          <p>AETHER_OS · INTERACTIVE FRONTEND CASE STUDY</p>
          <p>Browser-only simulation · Session data is not uploaded</p>
        </footer>
      </main>
    </div>
  )
}
