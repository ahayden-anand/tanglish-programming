import { exec } from "child_process";
import path from "path";

const pythonExecutable = process.env.PYTHON_EXECUTABLE || (process.platform === "win32" ? "python" : "python3");
const testRunner = path.join(process.cwd(), "tanglish", "tests", "run_tests.py");

export default async function handler(_req: any, res: any) {
  exec(`${pythonExecutable} ${testRunner}`, { cwd: process.cwd() }, (error, stdout, stderr) => {
    const output = stdout + stderr;
    const success = !error;
    res.status(200).json({
      success,
      output,
      passed: success
    });
  });
}
