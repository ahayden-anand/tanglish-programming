import React, { useState } from "react";
import { Folder, FolderOpen, FileCode, Plus, Trash2, Edit2, ChevronDown, ChevronRight } from "lucide-react";

export interface FileItem {
  id: string;
  name: string;
  path: string;
  content: string;
  isExample?: boolean;
}

interface FileExplorerProps {
  files: FileItem[];
  activeFileId: string;
  onSelectFile: (fileId: string) => void;
  onCreateFile: (fileName: string) => void;
  onDeleteFile: (fileId: string) => void;
  onRenameFile: (fileId: string, newName: string) => void;
  isOpen: boolean;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({
  files,
  activeFileId,
  onSelectFile,
  onCreateFile,
  onDeleteFile,
  onRenameFile,
  isOpen
}) => {
  const [examplesOpen, setExamplesOpen] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [editingFileId, setEditingFileId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const userFiles = files.filter((f) => !f.isExample);
  const exampleFiles = files.filter((f) => f.isExample);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFileName.trim()) {
      let formatted = newFileName.trim();
      if (!formatted.endsWith(".tgl")) {
        formatted += ".tgl";
      }
      onCreateFile(formatted);
      setNewFileName("");
      setIsCreating(false);
    }
  };

  const handleRenameSubmit = (fileId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (editingName.trim()) {
      let formatted = editingName.trim();
      if (!formatted.endsWith(".tgl")) {
        formatted += ".tgl";
      }
      onRenameFile(fileId, formatted);
      setEditingFileId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <aside className="w-56 md:w-60 bg-[#0d1117] border-r border-[#21262d] flex flex-col shrink-0 text-slate-300 font-sans select-none overflow-hidden h-full">
      {/* Explorer Header */}
      <div className="h-9 px-3 border-b border-[#21262d] flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 bg-[#161b22]/50">
        <span>Explorer</span>
        <button
          onClick={() => setIsCreating(true)}
          title="New File (.tgl)"
          className="p-1 hover:text-white hover:bg-[#21262d] rounded transition cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* New File Inline Form */}
      {isCreating && (
        <form onSubmit={handleCreateSubmit} className="p-2 border-b border-[#21262d] bg-[#161b22]">
          <input
            type="text"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            placeholder="filename.tgl"
            autoFocus
            className="w-full bg-[#0d1117] border border-emerald-500 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none font-mono"
            onBlur={() => setIsCreating(false)}
          />
        </form>
      )}

      {/* File Tree */}
      <div className="flex-1 overflow-y-auto py-2 text-xs space-y-1 font-mono">
        {/* Workspace Root Node */}
        <div className="px-3 py-1 flex items-center gap-1.5 text-slate-400 font-sans text-[11px] uppercase font-semibold tracking-wider">
          <FolderOpen className="w-3.5 h-3.5 text-amber-500" />
          <span>TANGLISH</span>
        </div>

        {/* User Files List */}
        <div className="space-y-0.5">
          {userFiles.map((file) => {
            const isActive = file.id === activeFileId;
            const isEditing = editingFileId === file.id;

            return (
              <div key={file.id} className="group relative">
                {isEditing ? (
                  <form
                    onSubmit={(e) => handleRenameSubmit(file.id, e)}
                    className="px-6 py-0.5"
                  >
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      autoFocus
                      className="w-full bg-[#161b22] border border-emerald-500 rounded px-1 py-0.5 text-xs text-slate-100 focus:outline-none font-mono"
                      onBlur={() => setEditingFileId(null)}
                    />
                  </form>
                ) : (
                  <div
                    onClick={() => onSelectFile(file.id)}
                    className={`flex items-center justify-between px-6 py-1.5 cursor-pointer transition ${
                      isActive
                        ? "bg-[#1f242c] text-emerald-400 font-medium border-l-2 border-emerald-500"
                        : "text-slate-300 hover:bg-[#161b22] hover:text-slate-100"
                    }`}
                  >
                    <div className="flex items-center gap-2 overflow-hidden truncate">
                      <FileCode className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate">{file.name}</span>
                    </div>

                    {/* Quick actions for user files */}
                    <div className="hidden group-hover:flex items-center gap-1 shrink-0 text-slate-400">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingFileId(file.id);
                          setEditingName(file.name);
                        }}
                        title="Rename"
                        className="p-0.5 hover:text-white"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      {userFiles.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteFile(file.id);
                          }}
                          title="Delete"
                          className="p-0.5 hover:text-rose-400"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Examples Folder */}
        <div className="pt-2">
          <div
            onClick={() => setExamplesOpen(!examplesOpen)}
            className="px-3 py-1.5 flex items-center gap-1.5 text-slate-400 hover:text-slate-200 cursor-pointer text-xs font-sans font-medium"
          >
            {examplesOpen ? (
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            )}
            <Folder className="w-3.5 h-3.5 text-amber-500/80" />
            <span>examples</span>
          </div>

          {examplesOpen && (
            <div className="space-y-0.5">
              {exampleFiles.map((file) => {
                const isActive = file.id === activeFileId;
                return (
                  <div
                    key={file.id}
                    onClick={() => onSelectFile(file.id)}
                    className={`flex items-center gap-2 pl-8 pr-3 py-1.5 cursor-pointer transition ${
                      isActive
                        ? "bg-[#1f242c] text-emerald-400 font-medium border-l-2 border-emerald-500"
                        : "text-slate-400 hover:bg-[#161b22] hover:text-slate-200"
                    }`}
                  >
                    <FileCode className="w-3.5 h-3.5 text-emerald-400/80 shrink-0" />
                    <span className="truncate">{file.name}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
