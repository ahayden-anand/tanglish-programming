import React, { useRef, useState, useEffect, useMemo } from "react";
import { FileCode, Wand2, Info, ChevronRight, Check } from "lucide-react";
import { tokenizeTanglish, KEYWORDS, BOOLEANS, Token } from "../utils/tanglishTokenizer";
import { formatTanglishCode } from "../utils/tanglishFormatter";

interface VsCodeEditorProps {
  fileName: string;
  code: string;
  setCode: (code: string) => void;
  onRun: () => void;
  onSave: () => void;
  onCursorChange?: (line: number, col: number) => void;
}

interface CompletionOption {
  label: string;
  kind: "keyword" | "function" | "variable";
  detail?: string;
}

export const VsCodeEditor: React.FC<VsCodeEditorProps> = ({
  fileName,
  code,
  setCode,
  onRun,
  onSave,
  onCursorChange
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);

  const [activeLine, setActiveLine] = useState(1);
  const [activeCol, setActiveCol] = useState(1);
  const [formatSuccess, setFormatSuccess] = useState(false);

  // Autocomplete state
  const [completionOpen, setCompletionOpen] = useState(false);
  const [completionIndex, setCompletionIndex] = useState(0);
  const [completionWord, setCompletionWord] = useState("");
  const [completionPos, setCompletionPos] = useState({ top: 0, left: 0 });

  // Tokenize & lint code
  const { tokens, syntaxErrors, symbols } = useMemo(() => {
    return tokenizeTanglish(code);
  }, [code]);

  const lines = useMemo(() => code.split("\n"), [code]);
  const lineCount = lines.length;

  // Build Autocomplete Options
  const completionOptions = useMemo<CompletionOption[]>(() => {
    if (!completionWord.trim()) return [];

    const query = completionWord.toLowerCase();
    const list: CompletionOption[] = [];

    // Keywords
    Array.from(KEYWORDS).forEach((kw) => {
      if (kw.toLowerCase().startsWith(query)) {
        list.push({ label: kw, kind: "keyword", detail: "Tanglish Keyword" });
      }
    });

    // Booleans
    Array.from(BOOLEANS).forEach((bool) => {
      if (bool.toLowerCase().startsWith(query)) {
        list.push({ label: bool, kind: "keyword", detail: "Boolean Literal" });
      }
    });

    // Symbols (variables / functions)
    Array.from(symbols).forEach((symItem) => {
      const sym = String(symItem);
      if (sym.toLowerCase().startsWith(query) && !KEYWORDS.has(sym) && !BOOLEANS.has(sym)) {
        list.push({ label: sym, kind: "variable", detail: "Identifier" });
      }
    });

    return list.slice(0, 8);
  }, [completionWord, symbols]);

  // Handle cursor position updates & autocomplete trigger
  const updateCursorPosition = () => {
    if (!textareaRef.current) return;
    const { selectionStart, value } = textareaRef.current;

    const textUpToCursor = value.substring(0, selectionStart);
    const lineNum = textUpToCursor.split("\n").length;
    const lastLineBreak = textUpToCursor.lastIndexOf("\n");
    const colNum = selectionStart - (lastLineBreak === -1 ? 0 : lastLineBreak + 1) + 1;

    setActiveLine(lineNum);
    setActiveCol(colNum);

    if (onCursorChange) {
      onCursorChange(lineNum, colNum);
    }

    // Check current word under cursor for autocomplete
    const currentLineText = lines[lineNum - 1] || "";
    const colInLine = colNum - 1;
    const match = currentLineText.substring(0, colInLine).match(/[a-zA-Z_][a-zA-Z0-9_]*$/);

    if (match && match[0].length >= 1) {
      const word = match[0];
      setCompletionWord(word);
      setCompletionOpen(true);
      setCompletionIndex(0);

      // Estimate pixel position for autocomplete popup
      const topPx = (lineNum - 1) * 22 + 36;
      const leftPx = Math.min(colNum * 8.2 + 50, 320);
      setCompletionPos({ top: topPx, left: leftPx });
    } else {
      setCompletionOpen(false);
    }
  };

  // Format Document Action
  const handleFormatDocument = () => {
    const formatted = formatTanglishCode(code);
    setCode(formatted);
    setFormatSuccess(true);
    setTimeout(() => setFormatSuccess(false), 2000);
  };

  // Apply Selected Completion Option
  const applyCompletion = (option: CompletionOption) => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const textUpToCursor = code.substring(0, start);
    const match = textUpToCursor.match(/[a-zA-Z_][a-zA-Z0-9_]*$/);

    if (match) {
      const wordStart = start - match[0].length;
      const newCode = code.substring(0, wordStart) + option.label + code.substring(start);
      setCode(newCode);

      setTimeout(() => {
        if (textareaRef.current) {
          const newPos = wordStart + option.label.length;
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = newPos;
          updateCursorPosition();
        }
      }, 0);
    }
    setCompletionOpen(false);
  };

  // Key Down Events (Formatting, Indentation, Auto-Closing Brackets, Autocomplete)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement;
    const start = target.selectionStart;
    const end = target.selectionEnd;

    // 1. Format Document Shortcut: Shift + Alt + F
    if (e.shiftKey && e.altKey && (e.key === "F" || e.key === "f")) {
      e.preventDefault();
      handleFormatDocument();
      return;
    }

    // 2. Run Shortcut: Ctrl/Cmd + Enter
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      onRun();
      return;
    }

    // 3. Save/Download Shortcut: Ctrl/Cmd + S
    if ((e.ctrlKey || e.metaKey) && (e.key === "s" || e.key === "S")) {
      e.preventDefault();
      onSave();
      return;
    }

    // 4. Toggle Line Comment: Ctrl/Cmd + /
    if ((e.ctrlKey || e.metaKey) && e.key === "/") {
      e.preventDefault();
      const textUpToCursor = code.substring(0, start);
      const currentLineIndex = textUpToCursor.split("\n").length - 1;
      const codeLines = code.split("\n");
      const targetLine = codeLines[currentLineIndex];

      if (targetLine.trimStart().startsWith("#")) {
        codeLines[currentLineIndex] = targetLine.replace("# ", "").replace("#", "");
      } else if (targetLine.trimStart().startsWith("//")) {
        codeLines[currentLineIndex] = targetLine.replace("// ", "").replace("//", "");
      } else {
        codeLines[currentLineIndex] = "# " + targetLine;
      }

      setCode(codeLines.join("\n"));
      setTimeout(updateCursorPosition, 0);
      return;
    }

    // 5. Autocomplete Dropdown Navigation
    if (completionOpen && completionOptions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setCompletionIndex((prev) => (prev + 1) % completionOptions.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setCompletionIndex((prev) => (prev - 1 + completionOptions.length) % completionOptions.length);
        return;
      }
      if (e.key === "Tab" || e.key === "Enter") {
        e.preventDefault();
        applyCompletion(completionOptions[completionIndex]);
        return;
      }
      if (e.key === "Escape") {
        setCompletionOpen(false);
        return;
      }
    }

    // 6. Tab key -> 4 spaces indentation
    if (e.key === "Tab") {
      e.preventDefault();
      const newCode = code.substring(0, start) + "    " + code.substring(end);
      setCode(newCode);

      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 4;
          updateCursorPosition();
        }
      }, 0);
      return;
    }

    // 7. Auto-closing Brackets & Quotes
    const autoPairs: Record<string, string> = {
      "(": ")",
      "{": "}",
      "[": "]",
      '"': '"',
      "'": "'"
    };

    if (autoPairs[e.key] && start === end) {
      const closingChar = autoPairs[e.key];
      // Skip over if next char is identical quote/bracket
      if ((e.key === '"' || e.key === "'") && code[start] === e.key) {
        e.preventDefault();
        textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 1;
        updateCursorPosition();
        return;
      }

      e.preventDefault();
      const newCode = code.substring(0, start) + e.key + closingChar + code.substring(end);
      setCode(newCode);

      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 1;
          updateCursorPosition();
        }
      }, 0);
      return;
    }

    // Skip over closing bracket if typed
    if ((")" === e.key || "}" === e.key || "]" === e.key) && code[start] === e.key && start === end) {
      e.preventDefault();
      textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 1;
      updateCursorPosition();
      return;
    }

    // 8. Smart Enter key -> Auto-indentation & Block opening
    if (e.key === "Enter" && start === end) {
      const textUpToCursor = code.substring(0, start);
      const currentLineText = textUpToCursor.split("\n").pop() || "";
      const matchIndent = currentLineText.match(/^[\t ]*/);
      const baseIndent = matchIndent ? matchIndent[0] : "";

      const charBefore = code[start - 1];
      const charAfter = code[start];

      // Enter pressed directly between `{` and `}`
      if (charBefore === "{" && charAfter === "}") {
        e.preventDefault();
        const innerIndent = baseIndent + "    ";
        const insertion = `\n${innerIndent}\n${baseIndent}`;
        const newCode = code.substring(0, start) + insertion + code.substring(start);
        setCode(newCode);

        setTimeout(() => {
          if (textareaRef.current) {
            const cursorTarget = start + 1 + innerIndent.length;
            textareaRef.current.selectionStart = textareaRef.current.selectionEnd = cursorTarget;
            updateCursorPosition();
          }
        }, 0);
        return;
      }

      // Enter pressed on line ending with `{` or block keyword
      if (currentLineText.trimEnd().endsWith("{") || /\b(enna_na|illena|suththu|seyal)\b$/.test(currentLineText.trim())) {
        e.preventDefault();
        const nextIndent = baseIndent + "    ";
        const insertion = `\n${nextIndent}`;
        const newCode = code.substring(0, start) + insertion + code.substring(start);
        setCode(newCode);

        setTimeout(() => {
          if (textareaRef.current) {
            const cursorTarget = start + insertion.length;
            textareaRef.current.selectionStart = textareaRef.current.selectionEnd = cursorTarget;
            updateCursorPosition();
          }
        }, 0);
        return;
      }

      // Standard Enter preserving current indentation
      if (baseIndent.length > 0) {
        e.preventDefault();
        const insertion = `\n${baseIndent}`;
        const newCode = code.substring(0, start) + insertion + code.substring(start);
        setCode(newCode);

        setTimeout(() => {
          if (textareaRef.current) {
            const cursorTarget = start + insertion.length;
            textareaRef.current.selectionStart = textareaRef.current.selectionEnd = cursorTarget;
            updateCursorPosition();
          }
        }, 0);
        return;
      }
    }
  };

  const handleScroll = () => {
    if (textareaRef.current && preRef.current) {
      preRef.current.scrollTop = textareaRef.current.scrollTop;
      preRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  // Render Token-based VS Code Highlighting Spans
  const renderTokens = () => {
    return tokens.map((t, idx) => {
      let colorClass = "text-[#d4d4d4]"; // default VS Code fg

      switch (t.type) {
        case "keyword":
          colorClass = "text-[#c586c0] font-medium"; // VS Code Keyword Purple
          break;
        case "boolean":
          colorClass = "text-[#569cd6] font-medium"; // VS Code Blue
          break;
        case "functionDecl":
        case "functionCall":
          colorClass = "text-[#dcdcaa]"; // VS Code Function Yellow
          break;
        case "identifier":
          colorClass = "text-[#9cdcfe]"; // VS Code Variable Light Cyan
          break;
        case "number":
          colorClass = "text-[#b5cea8]"; // VS Code Number Mint
          break;
        case "string":
          colorClass = "text-[#ce9178]"; // VS Code String Reddish Salmon
          break;
        case "comment":
          colorClass = "text-[#6a9955] italic"; // VS Code Comment Muted Green
          break;
        case "operator":
          colorClass = "text-[#d4d4d4]";
          break;
        case "punctuation":
          colorClass = "text-[#ffd700]"; // VS Code Gold Brackets
          break;
        case "error":
          colorClass = "text-rose-400 underline decoration-wavy decoration-rose-500";
          break;
      }

      return (
        <span key={idx} className={colorClass}>
          {t.text}
        </span>
      );
    });
  };

  return (
    <div className="bg-[#1e1e1e] flex flex-col h-full w-full overflow-hidden select-none font-mono">
      {/* Editor Header Bar */}
      <div className="h-9 bg-[#181818] border-b border-[#2d2d2d] flex items-center justify-between px-2 shrink-0">
        <div className="flex items-center gap-2 bg-[#1e1e1e] border-t-2 border-emerald-500 px-3 py-1.5 text-xs text-slate-200 font-mono border-r border-[#2d2d2d]">
          <FileCode className="w-3.5 h-3.5 text-emerald-400" />
          <span>{fileName}</span>
        </div>

        <div className="flex items-center gap-2">
          {syntaxErrors.length > 0 && (
            <div
              title={syntaxErrors[0].message}
              className="flex items-center gap-1 text-[11px] text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded"
            >
              <span>Line {syntaxErrors[0].line}: {syntaxErrors[0].message}</span>
            </div>
          )}

          <button
            onClick={handleFormatDocument}
            title="Format Document (Shift+Alt+F)"
            className="flex items-center gap-1 px-2.5 py-1 text-xs text-slate-300 hover:text-white bg-[#2d2d2d] hover:bg-[#383838] rounded transition cursor-pointer"
          >
            {formatSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Formatted</span>
              </>
            ) : (
              <>
                <Wand2 className="w-3.5 h-3.5 text-purple-400" />
                <span>Format</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main VS Code Editor Workspace */}
      <div className="flex-1 flex overflow-hidden relative text-xs md:text-sm leading-6">
        {/* Line Numbers Sidebar */}
        <div className="bg-[#1e1e1e] text-[#858585] py-3 text-right select-none font-mono border-r border-[#2d2d2d] min-w-[48px] px-2 shrink-0">
          {Array.from({ length: lineCount }, (_, i) => i + 1).map((num) => {
            const isCurrent = num === activeLine;
            const hasErr = syntaxErrors.some((e) => e.line === num);

            return (
              <div
                key={num}
                className={`h-6 px-1 flex items-center justify-end ${
                  isCurrent ? "text-slate-100 font-bold bg-[#282828] rounded-sm" : ""
                } ${hasErr ? "text-rose-400 font-bold" : ""}`}
              >
                {num}
              </div>
            );
          })}
        </div>

        {/* Editor Editing Area */}
        <div className="flex-1 relative overflow-hidden bg-[#1e1e1e]">
          {/* Syntax Highlighted Overlay Layer */}
          <pre
            ref={preRef}
            aria-hidden="true"
            className="absolute inset-0 p-3 font-mono text-xs md:text-sm leading-6 whitespace-pre pointer-events-none overflow-x-auto text-[#d4d4d4]"
            style={{
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
              fontSize: "13px",
              lineHeight: "24px",
              tabSize: 4
            }}
          >
            {renderTokens()}
            {"\n"}
          </pre>

          {/* Editable Textarea Layer */}
          <textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={handleKeyDown}
            onClick={updateCursorPosition}
            onKeyUp={updateCursorPosition}
            onScroll={handleScroll}
            placeholder="// Write your Tanglish code here..."
            spellCheck={false}
            className="absolute inset-0 p-3 font-mono text-xs md:text-sm leading-6 bg-transparent text-transparent caret-emerald-400 resize-none focus:outline-none whitespace-pre overflow-x-auto selection:bg-[#264f78]"
            style={{
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
              fontSize: "13px",
              lineHeight: "24px",
              tabSize: 4,
              WebkitTextFillColor: "transparent"
            }}
          />

          {/* Autocomplete Intellisense Popup */}
          {completionOpen && completionOptions.length > 0 && (
            <div
              style={{
                top: `${completionPos.top}px`,
                left: `${completionPos.left}px`
              }}
              className="absolute z-30 w-56 bg-[#252526] border border-[#454545] rounded shadow-xl overflow-hidden text-xs font-sans text-slate-200"
            >
              <div className="px-2 py-1 bg-[#1e1e1e] border-b border-[#333] text-[10px] text-slate-400 uppercase font-bold tracking-wider flex justify-between">
                <span>Suggestions</span>
                <span>Tab / Enter</span>
              </div>

              <div className="max-h-40 overflow-y-auto py-1">
                {completionOptions.map((opt, idx) => {
                  const isSelected = idx === completionIndex;
                  return (
                    <div
                      key={opt.label}
                      onClick={() => applyCompletion(opt)}
                      className={`px-3 py-1.5 flex items-center justify-between cursor-pointer font-mono ${
                        isSelected ? "bg-[#04395e] text-white" : "hover:bg-[#2a2d2e] text-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] px-1 rounded ${
                            opt.kind === "keyword"
                              ? "bg-purple-500/20 text-purple-300"
                              : "bg-blue-500/20 text-blue-300"
                          }`}
                        >
                          {opt.kind === "keyword" ? "kw" : "var"}
                        </span>
                        <span>{opt.label}</span>
                      </div>
                      <span className="text-[10px] text-slate-500">{opt.detail}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
