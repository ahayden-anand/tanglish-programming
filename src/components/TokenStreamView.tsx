import React from "react";
import { Code2 } from "lucide-react";

interface TokenStreamViewProps {
  tokens?: string[];
}

export const TokenStreamView: React.FC<TokenStreamViewProps> = ({ tokens }) => {
  if (!tokens || tokens.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-500 text-xs">
        <Code2 className="w-8 h-8 mx-auto mb-2 text-slate-600" />
        Run a program to inspect the Lexer token stream.
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col h-full overflow-hidden shadow-lg">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
        <h3 className="text-xs font-semibold text-amber-400 flex items-center gap-2">
          <Code2 className="w-4 h-4 text-amber-400" />
          Lexer Output ({tokens.length} Tokens)
        </h3>
        <span className="text-[11px] text-slate-400">Emitted by tanglish/lexer.py</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1 font-mono text-xs pr-1">
        {tokens.map((tokenStr, idx) => (
          <div
            key={idx}
            className="p-2 rounded bg-slate-950 border border-slate-800/80 hover:border-amber-500/40 transition flex items-center justify-between text-slate-300"
          >
            <span className="text-amber-300 font-mono text-[11px] font-medium">{tokenStr}</span>
            <span className="text-slate-500 text-[10px]">Token #{idx + 1}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
