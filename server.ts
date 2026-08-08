import express from "express";
import path from "path";
import http from "http";
import { exec, spawn } from "child_process";
import fs from "fs";
import { WebSocketServer, WebSocket } from "ws";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const PORT = 3000;

  app.use(express.json());

  // WebSocket for Interactive Terminal
  const wss = new WebSocketServer({ server, path: "/ws/terminal" });

  wss.on("connection", (ws: WebSocket) => {
    let currentChild: ReturnType<typeof spawn> | null = null;
    let tempFilePath: string | null = null;

    const cleanup = () => {
      if (currentChild && !currentChild.killed) {
        currentChild.kill();
        currentChild = null;
      }
      if (tempFilePath && fs.existsSync(tempFilePath)) {
        try { fs.unlinkSync(tempFilePath); } catch (e) {}
        tempFilePath = null;
      }
    };

    ws.on("message", (data: any) => {
      try {
        const msg = JSON.parse(data.toString());
        if (msg.type === "run") {
          cleanup();

          const tanglishPy = path.join(process.cwd(), "tanglish", "tanglish.py");
          tempFilePath = path.join(process.cwd(), `.tmp_run_${Date.now()}_${Math.random().toString(36).substring(2)}.tgl`);
          fs.writeFileSync(tempFilePath, msg.code || "", "utf-8");

          const child = spawn("python3", [tanglishPy, tempFilePath], {
            cwd: process.cwd(),
            env: { ...process.env, PYTHONUNBUFFERED: "1" }
          });
          currentChild = child;

          child.stdout.on("data", (chunk) => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: "stdout", text: chunk.toString() }));
            }
          });

          child.stderr.on("data", (chunk) => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: "stderr", text: chunk.toString() }));
            }
          });

          child.on("close", (exitCode) => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: "exit", code: exitCode ?? 0 }));
            }
            if (tempFilePath && fs.existsSync(tempFilePath)) {
              try { fs.unlinkSync(tempFilePath); } catch (e) {}
              tempFilePath = null;
            }
            currentChild = null;
          });
        } else if (msg.type === "stdin") {
          if (currentChild && currentChild.stdin && !currentChild.killed) {
            currentChild.stdin.write(msg.text);
          }
        } else if (msg.type === "kill") {
          cleanup();
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "stdout", text: "\n[Process stopped by user]\n" }));
            ws.send(JSON.stringify({ type: "exit", code: 130 }));
          }
        }
      } catch (err) {
        console.error("WS error:", err);
      }
    });

    ws.on("close", () => {
      cleanup();
    });
  });

  // API Endpoints
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", language: "Tanglish v1.0", python: "3.10+" });
  });

  // Run Tanglish Code API
  app.post("/api/run", (req, res) => {
    const { code, inputs } = req.body;

    if (typeof code !== "string") {
      res.status(400).json({ success: false, error: "Code must be a string." });
      return;
    }

    const start = Date.now();
    const tanglishPy = path.join(process.cwd(), "tanglish", "tanglish.py");

    const inputArgs = inputs ? ["--inputs", inputs] : [];

    const pyProcess = spawn("python3", [tanglishPy, "--api", ...inputArgs], {
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
          res.json({
            ...parsed,
            executionTimeMs: elapsed,
            exitCode
          });
        } else {
          res.json({
            success: false,
            error: stderrData || "Execution failed with no output.",
            logs: [],
            output: stderrData,
            executionTimeMs: elapsed,
            exitCode
          });
        }
      } catch (err) {
        res.json({
          success: false,
          error: stderrData || stdoutData || "Failed to parse Python JSON output.",
          logs: [stdoutData],
          output: stdoutData + "\n" + stderrData,
          executionTimeMs: elapsed,
          exitCode
        });
      }
    });
  });

  // Get Example Programs
  app.get("/api/examples", (_req, res) => {
    const examplesDir = path.join(process.cwd(), "tanglish", "examples");
    try {
      if (!fs.existsSync(examplesDir)) {
        res.json({ examples: [] });
        return;
      }
      const files = fs.readdirSync(examplesDir).filter((f) => f.endsWith(".tgl"));
      const examples = files.map((f) => {
        const content = fs.readFileSync(path.join(examplesDir, f), "utf-8");
        return {
          id: f,
          name: f.replace(".tgl", "").replace("_", " ").toUpperCase(),
          filename: f,
          code: content
        };
      });
      res.json({ examples });
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });

  // Run Test Suite API
  app.get("/api/tests", (_req, res) => {
    const testRunner = path.join(process.cwd(), "tanglish", "tests", "run_tests.py");
    exec(`python3 ${testRunner}`, (error, stdout, stderr) => {
      const output = stdout + stderr;
      const success = !error;
      res.json({
        success,
        output,
        passed: success
      });
    });
  });

  // Get Python Source Code for Architecture Viewer
  app.get("/api/source-code", (_req, res) => {
    const files = [
      { name: "errors.py", path: path.join("tanglish", "errors.py") },
      { name: "lexer.py", path: path.join("tanglish", "lexer.py") },
      { name: "ast_nodes.py", path: path.join("tanglish", "ast_nodes.py") },
      { name: "parser.py", path: path.join("tanglish", "parser.py") },
      { name: "interpreter.py", path: path.join("tanglish", "interpreter.py") },
      { name: "tanglish.py", path: path.join("tanglish", "tanglish.py") },
      { name: "README.md", path: path.join("tanglish", "README.md") },
    ];

    const sourceFiles = files.map((file) => {
      try {
        const absolutePath = path.join(process.cwd(), file.path);
        const content = fs.readFileSync(absolutePath, "utf-8");
        return { name: file.name, path: file.path, content };
      } catch (err) {
        return { name: file.name, path: file.path, content: `# Error reading file: ${err}` };
      }
    });

    res.json({ files: sourceFiles });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Tanglish Web Studio server running on http://localhost:${PORT}`);
  });
}

startServer();
