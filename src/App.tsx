import React, { useState, useRef, useEffect } from "react";
import { TitleBar } from "./components/TitleBar";
import { FileExplorer, FileItem } from "./components/FileExplorer";
import { VsCodeEditor } from "./components/VsCodeEditor";
import { TerminalConsole } from "./components/TerminalConsole";
import { StatusBar } from "./components/StatusBar";
import { PRESET_TEMPLATES } from "./data/cheatsheet";

const INITIAL_FILES: FileItem[] = [
  {
    id: "main",
    name: "main.tgl",
    path: "main.tgl",
    content: `# ===================================================
# TANGLISH PROGRAMMING LANGUAGE - QUICK GUIDE FOR BEGINNERS
# ===================================================
# Keywords Cheat Sheet:
#   vai         : Declare a variable (e.g., vai peyar = "Arun")
#   sollu(...)   : Print output to terminal (e.g., sollu("Vanakkam"))
#   ketu(...)    : Ask for user input (e.g., vai peyar = ketu("Name? "))
#   enna_na     : 'if' condition
#   illena_enna : 'else if' condition
#   illena      : 'else' condition
#   suththu     : 'while' loop
#   seyal       : Function definition (e.g., seyal add(a, b))
#   thiruppu    : Return value from function
#   unmai / poi : Boolean true / false
#
# Keyboard Shortcuts:
#   Ctrl + Enter    : Run code
#   Shift + Alt + F : Format code
# ===================================================

# 1. Variables & Output
vai peyar = "Arun"
vai vayasu = 20

sollu("Vanakkam " + peyar + "!")

# 2. Conditional Decision Making
enna_na vayasu >= 18 {
    sollu("Nee adult")
} illena {
    sollu("Nee minor")
}

# 3. Interactive Input Example (uncomment to test):
# vai oor = ketu("Un oor enna? ")
# sollu("Welcome from " + oor)
`,
    isExample: false
  },
  {
    id: "ex_hello",
    name: "hello.tgl",
    path: "examples/hello.tgl",
    content: PRESET_TEMPLATES[0].code,
    isExample: true
  },
  {
    id: "ex_variables",
    name: "variables.tgl",
    path: "examples/variables.tgl",
    content: PRESET_TEMPLATES[1].code,
    isExample: true
  },
  {
    id: "ex_conditions",
    name: "conditions.tgl",
    path: "examples/conditions.tgl",
    content: PRESET_TEMPLATES[2].code,
    isExample: true
  },
  {
    id: "ex_loops",
    name: "loops.tgl",
    path: "examples/loops.tgl",
    content: PRESET_TEMPLATES[3].code,
    isExample: true
  },
  {
    id: "ex_functions",
    name: "functions.tgl",
    path: "examples/functions.tgl",
    content: PRESET_TEMPLATES[4].code,
    isExample: true
  },
  {
    id: "ex_interactive",
    name: "interactive.tgl",
    path: "examples/interactive.tgl",
    content: PRESET_TEMPLATES[6].code,
    isExample: true
  }
];

export default function App() {
  const [files, setFiles] = useState<FileItem[]>(INITIAL_FILES);
  const [activeFileId, setActiveFileId] = useState<string>("main");
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });

  // Resizable split state (Editor width percentage)
  const [editorWidthPercent, setEditorWidthPercent] = useState<number>(60);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // References to trigger run/stop in Terminal
  const runTriggerRef = useRef<(() => void) | null>(null);
  const stopTriggerRef = useRef<(() => void) | null>(null);

  const activeFile = files.find((f) => f.id === activeFileId) || files[0];

  const handleUpdateCode = (newCode: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === activeFile.id ? { ...f, content: newCode } : f))
    );
  };

  const handleSelectFile = (fileId: string) => {
    setActiveFileId(fileId);
  };

  const handleCreateFile = (fileName: string) => {
    const id = "file_" + Date.now();
    const newFile: FileItem = {
      id,
      name: fileName,
      path: fileName,
      content: `# ${fileName}\nsollu("Vanakkam!")\n`,
      isExample: false
    };
    setFiles((prev) => [newFile, ...prev]);
    setActiveFileId(id);
  };

  const handleDeleteFile = (fileId: string) => {
    if (files.length <= 1) return;
    const filtered = files.filter((f) => f.id !== fileId);
    setFiles(filtered);
    if (activeFileId === fileId) {
      setActiveFileId(filtered[0].id);
    }
  };

  const handleRenameFile = (fileId: string, newName: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, name: newName, path: newName } : f))
    );
  };

  const handleRun = () => {
    if (runTriggerRef.current) {
      runTriggerRef.current();
    }
  };

  const handleStop = () => {
    if (stopTriggerRef.current) {
      stopTriggerRef.current();
    }
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const blob = new Blob([activeFile.content], { type: "text/plain" });
    element.href = URL.createObjectURL(blob);
    element.download = activeFile.name.endsWith(".tgl") ? activeFile.name : `${activeFile.name}.tgl`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Drag handler for resizable pane
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const containerWidth = window.innerWidth - (isSidebarOpen ? 220 : 0);
      if (containerWidth > 0) {
        const relativeX = e.clientX - (isSidebarOpen ? 220 : 0);
        let newPercent = (relativeX / containerWidth) * 100;
        if (newPercent < 25) newPercent = 25;
        if (newPercent > 80) newPercent = 80;
        setEditorWidthPercent(newPercent);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, isSidebarOpen]);

  return (
    <div className="h-screen w-screen bg-[#0d1117] text-slate-100 flex flex-col font-sans overflow-hidden select-none">
      {/* Top Title Bar */}
      <TitleBar
        activeFileName={activeFile.name}
        isRunning={isRunning}
        onRun={handleRun}
        onStop={handleStop}
        onDownload={handleDownload}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
      />

      {/* Main Studio Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* File Explorer Sidebar */}
        <FileExplorer
          files={files}
          activeFileId={activeFile.id}
          onSelectFile={handleSelectFile}
          onCreateFile={handleCreateFile}
          onDeleteFile={handleDeleteFile}
          onRenameFile={handleRenameFile}
          isOpen={isSidebarOpen}
        />

        {/* Editor & Terminal Split Panes */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
          {/* Editor Pane */}
          <div
            style={{ width: `${editorWidthPercent}%` }}
            className="h-1/2 md:h-full flex flex-col overflow-hidden shrink-0"
          >
            <VsCodeEditor
              fileName={activeFile.name}
              code={activeFile.content}
              setCode={handleUpdateCode}
              onRun={handleRun}
              onSave={handleDownload}
              onCursorChange={(line, col) => setCursorPos({ line, col })}
            />
          </div>

          {/* Draggable Divider */}
          <div
            onMouseDown={handleMouseDown}
            className="hidden md:block w-1.5 bg-[#21262d] hover:bg-emerald-500 cursor-col-resize transition shrink-0 select-none z-10"
            title="Drag to resize panels"
          />

          {/* Terminal Pane */}
          <div className="flex-1 h-1/2 md:h-full flex flex-col overflow-hidden">
            <TerminalConsole
              activeFileName={activeFile.name}
              code={activeFile.content}
              isRunning={isRunning}
              setIsRunning={setIsRunning}
              registerRunTrigger={(fn) => (runTriggerRef.current = fn)}
              registerStopTrigger={(fn) => (stopTriggerRef.current = fn)}
            />
          </div>
        </div>
      </div>

      {/* Bottom Status Bar */}
      <StatusBar
        cursorLine={cursorPos.line}
        cursorCol={cursorPos.col}
        activeFileName={activeFile.name}
      />
    </div>
  );
}
