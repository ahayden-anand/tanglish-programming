import React, { useEffect, useState } from "react";
import { SourceFile } from "../types";
import { FileCode, Layers, RefreshCw } from "lucide-react";

export const PythonCodeInspector: React.FC = () => {
  const [files, setFiles] = useState<SourceFile[]>([]);
  const [activeFile, setActiveFile] = useState<string>("lexer.py");
  const [loading, setLoading] = useState(true);

  const fetchSourceCode = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/source-code");
      const data = await res.json();
      if (data.files) {
        setFiles(data.files);
      }
    } catch (err) {
      console.error("Failed to load source code:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSourceCode();
  }, []);

  const currentFileObj = files.find((f) => f.name === activeFile) || files[0];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col h-full shadow-lg overflow-hidden">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-semibold text-amber-400">
            Python Engine Architecture Inspector
          </h3>
        </div>
        <button
          onClick={fetchSourceCode}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1 bg-slate-800 px-2 py-1 rounded"
        >
          <RefreshCw className="w-3 h-3" /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-slate-500 text-xs">
          Loading Python codebase...
        </div>
      ) : (
        <div className="flex-1 flex flex-col md:flex-row gap-3 overflow-hidden">
          {/* File Selector Sidebar */}
          <div className="w-full md:w-48 bg-slate-950 p-2 rounded border border-slate-800 flex md:flex-col gap-1 overflow-x-auto md:overflow-y-auto text-xs">
            {files.map((file) => (
              <button
                key={file.name}
                onClick={() => setActiveFile(file.name)}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded text-left transition whitespace-nowrap ${
                  activeFile === file.name
                    ? "bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                <FileCode className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{file.name}</span>
              </button>
            ))}
          </div>

          {/* File Code Display */}
          <div className="flex-1 bg-slate-950 p-3 rounded border border-slate-800 overflow-y-auto font-mono text-xs text-slate-200">
            {currentFileObj ? (
              <pre className="whitespace-pre-wrap leading-relaxed">
                {currentFileObj.content}
              </pre>
            ) : (
              <div className="text-slate-500">No file selected</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
