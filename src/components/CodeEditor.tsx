import React, { useRef, useEffect } from "react";
import { PRESET_TEMPLATES } from "../data/cheatsheet";
import { Code, KeyRound, MessageSquareCode } from "lucide-react";

interface CodeEditorProps {
  code: string;
  setCode: (code: string) => void;
  inputs: string;
  setInputs: (inputs: string) => void;
  onRun: () => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  setCode,
  inputs,
  setInputs,
  onRun
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const lineCount = code.split("\n").length;
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      onRun();
    }
    // Tab key indentation support
    if (e.key === "Tab") {
      e.preventDefault();
      const target = e.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const newCode = code.substring(0, start) + "    " + code.substring(end);
      setCode(newCode);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 4;
        }
      }, 0);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl flex flex-col h-full shadow-lg overflow-hidden">
      {/* Editor Top Bar */}
      <div className="bg-slate-950/80 px-4 py-2.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-slate-300 font-semibold">
          <Code className="w-4 h-4 text-amber-400" />
          <span>Tanglish Source Editor (.tgl)</span>
        </div>

        {/* Templates Selector */}
        <div className="flex items-center gap-2">
          <label htmlFor="template-select" className="text-slate-400 hidden sm:inline">
            Examples:
          </label>
          <select
            id="template-select"
            onChange={(e) => {
              const selected = PRESET_TEMPLATES.find((t) => t.id === e.target.value);
              if (selected) {
                setCode(selected.code);
              }
            }}
            defaultValue=""
            className="bg-slate-800 border border-slate-700 text-slate-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="" disabled>
              Select Example Program...
            </option>
            {PRESET_TEMPLATES.map((tmpl) => (
              <option key={tmpl.id} value={tmpl.id}>
                {tmpl.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Editor Body with Line Numbers */}
      <div className="flex-1 flex overflow-hidden relative font-mono text-sm">
        {/* Line Numbers Column */}
        <div className="bg-slate-950 text-slate-600 px-3 py-3 select-none text-right font-mono text-xs border-r border-slate-800/80 min-w-[40px]">
          {lineNumbers.map((num) => (
            <div key={num} className="leading-6">
              {num}
            </div>
          ))}
        </div>

        {/* Code Textarea */}
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="// Type your Tanglish code here... (e.g. sollu('Vanakkam'))"
          spellCheck={false}
          className="flex-1 bg-slate-900 text-amber-100 p-3 leading-6 focus:outline-none resize-none font-mono selection:bg-amber-500/30 selection:text-white"
        />
      </div>

      {/* Inputs (ketu) Section */}
      <div className="bg-slate-950 border-t border-slate-800 p-3">
        <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold mb-1.5">
          <MessageSquareCode className="w-3.5 h-3.5" />
          <span>Interactive Program Inputs (ketu)</span>
          <span className="text-slate-500 text-[10px] font-normal">
            (Pre-provided answers for input calls, separated by newlines)
          </span>
        </div>
        <input
          type="text"
          value={inputs}
          onChange={(e) => setInputs(e.target.value)}
          placeholder="e.g. Arun (press enter or separate multiple inputs with newlines)"
          className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
        />
      </div>

      {/* Keyword Legend Bar */}
      <div className="bg-slate-950/60 px-3 py-1.5 border-t border-slate-800/80 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400">
        <span className="text-amber-400 font-medium">Keywords:</span>
        <code>vai</code> (var)
        <code>sollu</code> (print)
        <code>ketu</code> (input)
        <code>enna_na</code> (if)
        <code>illena</code> (else)
        <code>suththu</code> (while)
        <code>seyal</code> (fn)
        <code>thiruppu</code> (return)
      </div>
    </div>
  );
};
