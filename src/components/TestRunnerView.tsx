import React, { useState } from "react";
import { TestTube2, CheckCircle2, XCircle, Play, Loader2 } from "lucide-react";

export const TestRunnerView: React.FC = () => {
  const [running, setRunning] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    output: string;
    passed: boolean;
  } | null>(null);

  const runTests = async () => {
    setRunning(true);
    try {
      const res = await fetch("/api/tests");
      const data = await res.json();
      setTestResult(data);
    } catch (err) {
      setTestResult({
        success: false,
        output: `Error invoking unit test runner: ${err}`,
        passed: false
      });
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col h-full shadow-lg overflow-hidden">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <TestTube2 className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-semibold text-amber-400">
            Python Engine Unit Test Suite (`tanglish/tests/run_tests.py`)
          </h3>
        </div>

        <button
          onClick={runTests}
          disabled={running}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold px-3 py-1.5 rounded flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
        >
          {running ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          <span>{running ? "Running Tests..." : "Run Test Suite"}</span>
        </button>
      </div>

      <div className="flex-1 bg-slate-950 p-4 rounded border border-slate-800 overflow-y-auto font-mono text-xs text-slate-200">
        {!testResult && !running && (
          <div className="py-8 text-center text-slate-500">
            Click "Run Test Suite" to execute Lexer, Parser, and Interpreter unit tests using Python's `unittest` framework.
          </div>
        )}

        {running && (
          <div className="py-8 text-center text-amber-400 flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
            <span>Executing `python3 tanglish/tests/run_tests.py`...</span>
          </div>
        )}

        {testResult && !running && (
          <div className="space-y-3">
            <div className={`p-3 rounded border flex items-center gap-2 ${
              testResult.passed
                ? "bg-emerald-950/40 border-emerald-800 text-emerald-300"
                : "bg-red-950/40 border-red-800 text-red-300"
            }`}>
              {testResult.passed ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <XCircle className="w-5 h-5 text-red-400" />
              )}
              <span className="font-bold text-sm">
                {testResult.passed ? "ALL UNIT TESTS PASSED!" : "SOME TESTS FAILED"}
              </span>
            </div>

            <pre className="p-3 bg-slate-900 rounded border border-slate-800 whitespace-pre-wrap leading-relaxed">
              {testResult.output}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
