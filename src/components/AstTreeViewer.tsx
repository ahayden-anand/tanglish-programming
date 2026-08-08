import React, { useState } from "react";
import { Sparkles, ChevronDown, ChevronRight } from "lucide-react";

interface AstTreeViewerProps {
  ast?: Record<string, any>;
}

const JsonNode: React.FC<{ name?: string; value: any; depth?: number }> = ({ name, value, depth = 0 }) => {
  const [isOpen, setIsOpen] = useState(true);

  if (value === null || value === undefined) {
    return (
      <div className="pl-4 py-0.5 text-slate-500 font-mono text-xs">
        {name && <span className="text-purple-400">{name}: </span>}
        <span className="text-slate-500">null</span>
      </div>
    );
  }

  if (typeof value !== "object") {
    let valColor = "text-emerald-400";
    if (typeof value === "number") valColor = "text-amber-400";
    if (typeof value === "boolean") valColor = "text-cyan-400";

    return (
      <div className="pl-4 py-0.5 font-mono text-xs">
        {name && <span className="text-slate-400">{name}: </span>}
        <span className={valColor}>{JSON.stringify(value)}</span>
      </div>
    );
  }

  const isArray = Array.isArray(value);
  const keys = Object.keys(value);

  return (
    <div className="pl-2 py-0.5 font-mono text-xs">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 cursor-pointer hover:bg-slate-800/60 rounded px-1 text-slate-300 font-medium select-none"
      >
        {isOpen ? <ChevronDown className="w-3 h-3 text-slate-500" /> : <ChevronRight className="w-3 h-3 text-slate-500" />}
        {name && <span className="text-amber-400">{name}: </span>}
        <span className="text-blue-400">{value.type || (isArray ? `Array[${value.length}]` : "Object")}</span>
      </div>

      {isOpen && (
        <div className="pl-3 border-l border-slate-800 ml-2 mt-0.5 space-y-0.5">
          {keys.map((key) => (
            <JsonNode key={key} name={key} value={value[key]} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export const AstTreeViewer: React.FC<AstTreeViewerProps> = ({ ast }) => {
  if (!ast) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-500 text-xs">
        <Sparkles className="w-8 h-8 mx-auto mb-2 text-slate-600" />
        Run a program to inspect the Abstract Syntax Tree (AST).
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col h-full overflow-hidden shadow-lg">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
        <h3 className="text-xs font-semibold text-amber-400 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          Abstract Syntax Tree (AST)
        </h3>
        <span className="text-[11px] text-slate-400">Parsed by tanglish/parser.py</span>
      </div>

      <div className="flex-1 overflow-y-auto p-2 bg-slate-950 rounded border border-slate-800">
        <JsonNode name="Program" value={ast} />
      </div>
    </div>
  );
};
