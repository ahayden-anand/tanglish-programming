import React from "react";
import { RunResult } from "../types";
import { Terminal, CheckCircle2, AlertTriangle, Clock } from "lucide-react";

interface OutputConsoleProps {
  result: RunResult | null;
  isRunning: boolean;
  onClear: () => void;
}

export const OutputConsole: React.FC<OutputConsoleProps> = ({
  result,
  isRunning,
  onClear
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl flex flex-col h-full shadow-lg overflow-hidden font-mono">
      {/* Header */}
      <div className="bg-slate-950/80 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-slate-300 font-semibold">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span>Execution Console</span>
        </div>

        {result && (
          <div className="flex items-center gap-3 text-[11px]">
            {result.executionTimeMs !== undefined && (
              <span className="text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {result.executionTimeMs} ms
              </span>
            )}
            {result.success ? (
              <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded flex items-center gap-1 font-semibold">
                <CheckCircle2 className="w-3 h-3" /> Success
              </span>
            ) : (
              <span className="text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded flex items-center gap-1 font-semibold">
                <AlertTriangle className="w-3 h-3" /> Error
              </span>
            )}
          </div>
        )}
      </div>

      {/* Output Content */}
      <div className="flex-1 p-4 overflow-y-auto text-xs font-mono space-y-3 bg-slate-950">
        {isRunning && (
          <div className="text-amber-400 flex items-center gap-2 animate-pulse">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            Executing Tanglish program on Python interpreter...
          </div>
        )}

        {!isRunning && !result && (
          <div className="text-slate-500 italic py-8 text-center">
            Click "▶ Run Code" or press Ctrl+Enter to execute your Tanglish program.
          </div>
        )}

        {!isRunning && result && (
          <>
            {/* Standard Output Logs */}
            {result.output ? (
              <pre className="text-slate-200 whitespace-pre-wrap leading-relaxed font-mono">
                {result.output}
              </pre>
            ) : result.success ? (
              <div className="text-slate-400 italic">Program finished cleanly with no output.</div>
            ) : null}

            {/* Formatted Error Banner */}
            {!result.success && result.error && (
              <div className="mt-3 p-3 rounded bg-red-950/40 border border-red-800/80 text-red-200 font-mono space-y-1 text-xs">
                <div className="font-bold text-red-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span>{result.error_type || "Tanglish Execution Error"}</span>
                </div>
                <pre className="text-red-300 whitespace-pre-wrap font-mono mt-1 pt-1 border-t border-red-900/50">
                  {result.error}
                </pre>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
