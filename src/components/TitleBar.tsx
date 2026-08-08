import React from "react";
import { Play, Square, Download, Code2, FolderTree } from "lucide-react";

interface TitleBarProps {
  activeFileName: string;
  isRunning: boolean;
  onRun: () => void;
  onStop: () => void;
  onDownload: () => void;
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export const TitleBar: React.FC<TitleBarProps> = ({
  activeFileName,
  isRunning,
  onRun,
  onStop,
  onDownload,
  toggleSidebar,
  isSidebarOpen
}) => {
  return (
    <header className="h-12 bg-[#161b22] border-b border-[#21262d] text-slate-200 px-3 md:px-4 flex items-center justify-between shrink-0 select-none">
      {/* Left branding */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          title={isSidebarOpen ? "Collapse Explorer" : "Expand Explorer"}
          className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-[#21262d] rounded transition cursor-pointer md:hidden"
        >
          <FolderTree className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-emerald-500 rounded flex items-center justify-center text-slate-950 font-extrabold text-sm shadow-sm">
            T
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-slate-100 tracking-tight text-sm md:text-base">
              Tanglish
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono border border-emerald-500/20">
              v1.0
            </span>
            <span className="text-xs text-slate-400 hidden sm:inline ml-1">
              Tanglish Programming Language
            </span>
          </div>
        </div>
      </div>

      {/* Middle File Indicator */}
      <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-400 font-mono bg-[#0d1117] px-3 py-1 rounded border border-[#21262d]">
        <Code2 className="w-3.5 h-3.5 text-emerald-400" />
        <span>{activeFileName}</span>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        {!isRunning ? (
          <button
            onClick={onRun}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded text-xs font-semibold shadow-sm transition cursor-pointer"
            title="Run Code (Ctrl+Enter)"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Run</span>
          </button>
        ) : (
          <button
            onClick={onStop}
            className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 text-white px-3 py-1 rounded text-xs font-semibold shadow-sm transition cursor-pointer"
            title="Stop Execution"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>Stop</span>
          </button>
        )}

        <button
          onClick={onDownload}
          className="flex items-center gap-1.5 bg-[#21262d] hover:bg-[#30363d] text-slate-300 hover:text-white px-2.5 py-1 rounded text-xs font-medium border border-[#30363d] transition cursor-pointer"
          title="Download file (Ctrl+S)"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Download</span>
        </button>
      </div>
    </header>
  );
};
