import React from "react";

interface StatusBarProps {
  cursorLine: number;
  cursorCol: number;
  activeFileName: string;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  cursorLine,
  cursorCol,
  activeFileName
}) => {
  return (
    <footer className="h-6 bg-[#161b22] border-t border-[#21262d] text-slate-400 flex items-center justify-between px-3 text-[11px] font-mono shrink-0 select-none">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 text-emerald-400 font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Tanglish</span>
        </div>
        <span className="hidden sm:inline text-slate-500">•</span>
        <span className="hidden sm:inline text-slate-400">UTF-8</span>
      </div>

      <div className="flex items-center gap-4 text-slate-400">
        <span>
          Ln {cursorLine}, Col {cursorCol}
        </span>
        <span className="hidden md:inline">Spaces: 4</span>
        <span className="bg-[#21262d] text-slate-300 px-1.5 py-0.2 rounded text-[10px]">
          {activeFileName.endsWith(".tgl") ? ".tgl" : "Tanglish"}
        </span>
      </div>
    </footer>
  );
};
