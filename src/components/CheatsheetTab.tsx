import React from "react";
import { TANGLISH_KEYWORDS } from "../data/cheatsheet";
import { BookOpen, Copy, Check } from "lucide-react";

interface CheatsheetTabProps {
  onInsertExample: (code: string) => void;
}

export const CheatsheetTab: React.FC<CheatsheetTabProps> = ({ onInsertExample }) => {
  const [copiedKw, setCopiedKw] = React.useState<string | null>(null);

  const handleCopy = (code: string, kw: string) => {
    onInsertExample(code);
    setCopiedKw(kw);
    setTimeout(() => setCopiedKw(null), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col h-full shadow-lg overflow-hidden">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-semibold text-amber-400">
            Tanglish Language Reference & Keyword Cheatsheet
          </h3>
        </div>
        <span className="text-[11px] text-slate-400">Click any example to load into Editor</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
        {TANGLISH_KEYWORDS.map((item) => (
          <div
            key={item.keyword}
            className="p-3 bg-slate-950 border border-slate-800/90 rounded-lg hover:border-amber-500/40 transition flex flex-col md:flex-row md:items-center justify-between gap-3"
          >
            <div className="space-y-1 max-w-md">
              <div className="flex items-center gap-2">
                <code className="text-amber-300 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 text-sm">
                  {item.keyword}
                </code>
                <span className="text-slate-200 font-semibold text-sm font-sans">{item.tamil}</span>
                <span className="text-slate-400 text-xs">({item.english})</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">{item.description}</p>
            </div>

            <div className="bg-slate-900 p-2.5 rounded border border-slate-800 font-mono text-xs flex items-center justify-between gap-3 min-w-[220px]">
              <pre className="text-slate-300 whitespace-pre-wrap">{item.example}</pre>
              <button
                onClick={() => handleCopy(item.example, item.keyword)}
                className="text-amber-400 hover:text-amber-300 p-1 bg-amber-500/10 hover:bg-amber-500/20 rounded border border-amber-500/20 transition flex items-center gap-1 shrink-0 text-[11px]"
              >
                {copiedKw === item.keyword ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKw === item.keyword ? "Loaded!" : "Try It"}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
