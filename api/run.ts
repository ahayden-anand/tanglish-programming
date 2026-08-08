import { spawn } from "child_process";
import path from "path";

const pythonExecutable = process.env.PYTHON_EXECUTABLE || (process.platform === "win32" ? "python" : "python3");
const tanglishPy = path.join(process.cwd(), "tanglish", "tanglish.py");

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({ success: false, error: "Method not allowed" });
    return;
  }

  const { code, inputs } = req.body ?? {};
  if (typeof code !== "string") {
    res.status(400).json({ success: false, error: "Code must be a string." });
    return;
  }

  const inputArgs = inputs ? ["--inputs", inputs] : [];
  const start = Date.now();

  const pyProcess = spawn(pythonExecutable, [tanglishPy, "--api", ...inputArgs], {
    cwd: process.cwd(),
    env: { ...process.env, PYTHONUNBUFFERED: "1" }
  });

  let stdoutData = "";
  let stderrData = "";

  pyProcess.stdin.write(code);
  pyProcess.stdin.end();

  pyProcess.stdout.on("data", (chunk) => {
    stdoutData += chunk.toString();
  });

  pyProcess.stderr.on("data", (chunk) => {
    stderrData += chunk.toString();
  });

  pyProcess.on("close", (exitCode) => {
    const elapsed = Date.now() - start;

    try {
      if (stdoutData.trim()) {
        const parsed = JSON.parse(stdoutData.trim());
        res.status(200).json({
          ...parsed,
          executionTimeMs: elapsed,
          exitCode
        });
      } else {
        res.status(200).json({
          success: false,
          error: stderrData || "Execution failed with no output.",
          logs: [],
          output: stderrData,
          executionTimeMs: elapsed,
          exitCode
        });
      }
    } catch (err) {
      res.status(200).json({
        success: false,
        error: stderrData || stdoutData || "Failed to parse Python JSON output.",
        logs: [stdoutData],
        output: stdoutData + "\n" + stderrData,
        executionTimeMs: elapsed,
        exitCode
      });
    }
  });
}
