import fs from "fs";
import path from "path";

export default async function handler(_req: any, res: any) {
  const files = [
    { name: "errors.py", path: path.join("tanglish", "errors.py") },
    { name: "lexer.py", path: path.join("tanglish", "lexer.py") },
    { name: "ast_nodes.py", path: path.join("tanglish", "ast_nodes.py") },
    { name: "parser.py", path: path.join("tanglish", "parser.py") },
    { name: "interpreter.py", path: path.join("tanglish", "interpreter.py") },
    { name: "tanglish.py", path: path.join("tanglish", "tanglish.py") },
    { name: "README.md", path: path.join("tanglish", "README.md") }
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

  res.status(200).json({ files: sourceFiles });
}
