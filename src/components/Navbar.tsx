import React from "react";
import { Play, RotateCcw, Download, BookOpen, Terminal, Code2, TestTube2, Sparkles } from "lucide-react";

interface NavbarProps {
  onRun: () => void;
  isRunning: boolean;
  onClear: () => void;
  onDownload: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onRun,
  isRunning,
  onClear,
  onDownload,
  activeTab,
  setActiveTab
}) => {
  return (
    <header id="main-navbar" className="bg-slate-900 border-b border-slate-800 text-white px-4 py-3 sticky top-0 z-20">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Title / Logo */}
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-2 rounded-xl text-slate-950 font-bold shadow-md flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-amber-400 font-sans">
                Tanglish <span className="text-slate-100 font-normal text-sm">v1.0</span>
              </h1>
              <span className="bg-amber-500/10 text-amber-400 text-xs px-2 py-0.5 rounded-full border border-amber-500/20 font-mono">
                Tamil Programming Language
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Beginner-Friendly Programming with Tamil Words in English Script • Built with Python Lexer/Parser/Interpreter
            </p>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            id="run-code-btn"
            onClick={onRun}
            disabled={isRunning}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition shadow-md disabled:opacity-50 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            {isRunning ? "Running..." : "Run Code (Ctrl+Enter)"}
          </button>

          <button
            id="clear-output-btn"
            onClick={onClear}
            title="Clear Console Output"
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            id="download-tgl-btn"
            onClick={onDownload}
            title="Download .tgl Source File"
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition flex items-center gap-1.5 text-xs font-medium"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Download .tgl</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="max-w-7xl mx-auto flex items-center gap-1 mt-3 pt-2 border-t border-slate-800/80 overflow-x-auto text-xs font-medium text-slate-400">
        <button
          id="tab-console"
          onClick={() => setActiveTab("console")}
          className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition whitespace-nowrap ${
            activeTab === "console" ? "bg-amber-500/20 text-amber-300 font-semibold" : "hover:text-slate-200 hover:bg-slate-800/60"
          }`}
        >
          <Terminal className="w-3.5 h-3.5" /> Output Console
        </button>

        <button
          id="tab-tokens"
          onClick={() => setActiveTab("tokens")}
          className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition whitespace-nowrap ${
            activeTab === "tokens" ? "bg-amber-500/20 text-amber-300 font-semibold" : "hover:text-slate-200 hover:bg-slate-800/60"
          }`}
        >
          <Code2 className="w-3.5 h-3.5" /> Tokens (Lexer)
        </button>

        <button
          id="tab-ast"
          onClick={() => setActiveTab("ast")}
          className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition whitespace-nowrap ${
            activeTab === "ast" ? "bg-amber-500/20 text-amber-300 font-semibold" : "hover:text-slate-200 hover:bg-slate-800/60"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" /> AST Tree (Parser)
        </button>

        <button
          id="tab-python"
          onClick={() => setActiveTab("python")}
          className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition whitespace-nowrap ${
            activeTab === "python" ? "bg-amber-500/20 text-amber-300 font-semibold" : "hover:text-slate-200 hover:bg-slate-800/60"
          }`}
        >
          <Code2 className="w-3.5 h-3.5" /> Python Engine Source
        </button>

        <button
          id="tab-cheatsheet"
          onClick={() => setActiveTab("cheatsheet")}
          className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition whitespace-nowrap ${
            activeTab === "cheatsheet" ? "bg-amber-500/20 text-amber-300 font-semibold" : "hover:text-slate-200 hover:bg-slate-800/60"
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" /> Keyword Cheatsheet
        </button>

        <button
          id="tab-tests"
          onClick={() => setActiveTab("tests")}
          className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition whitespace-nowrap ${
            activeTab === "tests" ? "bg-amber-500/20 text-amber-300 font-semibold" : "hover:text-slate-200 hover:bg-slate-800/60"
          }`}
        >
          <TestTube2 className="w-3.5 h-3.5" /> Python Unit Tests
        </button>
      </div>
    </header>
  );
};
