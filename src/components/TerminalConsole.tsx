import React, { useState, useEffect, useRef } from "react";
import { Terminal, Trash2, Square } from "lucide-react";

interface TerminalConsoleProps {
  activeFileName: string;
  code: string;
  isRunning: boolean;
  setIsRunning: (running: boolean) => void;
  terminalRef?: React.RefObject<HTMLDivElement>;
  registerRunTrigger?: (trigger: () => void) => void;
  registerStopTrigger?: (trigger: () => void) => void;
}

export const TerminalConsole: React.FC<TerminalConsoleProps> = ({
  activeFileName,
  code,
  isRunning,
  setIsRunning,
  registerRunTrigger,
  registerStopTrigger
}) => {
  const [history, setHistory] = useState<string[]>([]);
  const consoleBottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll terminal
  useEffect(() => {
    consoleBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  // Handle Stop execution
  const stopExecution = () => {
    setIsRunning(false);
    setHistory((prev) => [...prev, "\n^C Process stopped by user.\n"]);
  };

  // Handle Run execution via HTTP API
  const startExecution = () => {
    if (isRunning) return;

    setIsRunning(true);

    // Header banner in terminal
    setHistory((prev) => [
      ...prev,
      `$ tanglish ${activeFileName || "main.tgl"}\n`
    ]);

    fallbackHttpRun();
  };

  // HTTP API run
  const fallbackHttpRun = async () => {
    try {
      const res = await fetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code })
      });

      const text = await res.text();
      let data: any;

      try {
        data = JSON.parse(text);
      } catch (parseError) {
        setHistory((prev) => [
          ...prev,
          `\nExecution Error: Invalid JSON response from /api/run:\n${text}\nProcess exited with code 1\n`
        ]);
        return;
      }

      if (!res.ok) {
        const errText = data.error || data.message || `HTTP ${res.status} ${res.statusText}`;
        setHistory((prev) => [...prev, `${errText}\n`, `\nProcess exited with code 1\n`]);
      } else if (data.success) {
        if (data.output) {
          setHistory((prev) => [...prev, data.output + "\n"]);
        }
        setHistory((prev) => [...prev, `\nProcess exited with code 0\n`]);
      } else {
        const errText = data.error || data.message || "Execution error";
        setHistory((prev) => [...prev, errText + "\n", `\nProcess exited with code 1\n`]);
      }
    } catch (err) {
      setHistory((prev) => [...prev, `\nExecution Error: ${String(err)}\nProcess exited with code 1\n`]);
    } finally {
      setIsRunning(false);
    }
  };

  // Register triggers for parent components
  useEffect(() => {
    if (registerRunTrigger) {
      registerRunTrigger(startExecution);
    }
    if (registerStopTrigger) {
      registerStopTrigger(stopExecution);
    }
  }, [code, isRunning, activeFileName]);

  const handleClear = () => {
    setHistory([]);
  };

  return (
    <div className="bg-[#0d1117] flex flex-col h-full w-full overflow-hidden select-none border-l border-[#21262d]">
      {/* Terminal Header Bar */}
      <div className="h-9 bg-[#161b22] border-b border-[#21262d] flex items-center justify-between px-3 shrink-0 text-xs font-mono text-slate-300">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-semibold text-slate-200">Terminal</span>
        </div>

        <div className="flex items-center gap-2">
          {isRunning && (
            <button
              onClick={stopExecution}
              title="Stop Execution"
              className="px-2 py-0.5 bg-rose-600/20 text-rose-400 hover:bg-rose-600/30 rounded border border-rose-500/30 text-[11px] font-sans flex items-center gap-1 cursor-pointer transition"
            >
              <Square className="w-3 h-3 fill-current" />
              <span>Stop</span>
            </button>
          )}

          <button
            onClick={handleClear}
            title="Clear Terminal Output"
            className="p-1 text-slate-400 hover:text-slate-100 hover:bg-[#21262d] rounded transition cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Terminal Output Body */}
      <div
        className="flex-1 p-3 font-mono text-xs md:text-sm overflow-y-auto bg-[#090d13] text-slate-200 leading-relaxed cursor-text"
      >
        {history.length === 0 && !isRunning && (
          <div className="text-slate-600 select-none italic mb-2">
            Click "Run" or press Ctrl+Enter to execute Tanglish code in terminal...
          </div>
        )}

        {/* Render History Stream */}
        <div className="whitespace-pre-wrap break-words font-mono">
          {history.map((chunk, idx) => {
            const isError = chunk.includes("Pizhai") || chunk.includes("Error:") || chunk.includes("❌");
            const isCommand = chunk.startsWith("$ ");
            const isExit = chunk.includes("Process exited with code");

            if (isCommand) {
              return (
                <span key={idx} className="text-emerald-400 font-bold">
                  {chunk}
                </span>
              );
            }
            if (isError) {
              return (
                <span key={idx} className="text-rose-400">
                  {chunk}
                </span>
              );
            }
            if (isExit) {
              const isSuccess = chunk.includes("code 0");
              return (
                <span key={idx} className={isSuccess ? "text-emerald-500/80 font-medium" : "text-amber-500 font-medium"}>
                  {chunk}
                </span>
              );
            }
            return <span key={idx}>{chunk}</span>;
          })}
        </div>

        <div ref={consoleBottomRef} />
      </div>
    </div>
  );
};
