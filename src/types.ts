export interface ExampleProgram {
  id: string;
  name: string;
  filename: string;
  code: string;
}

export interface RunResult {
  success: boolean;
  output: string;
  logs: string[];
  tokens?: string[];
  ast?: Record<string, any>;
  error?: string;
  error_type?: string;
  message?: string;
  line?: number;
  column?: number;
  executionTimeMs?: number;
}

export interface SourceFile {
  name: string;
  path: string;
  content: string;
}

export interface TanglishKeywordInfo {
  keyword: string;
  tamil: string;
  english: string;
  description: string;
  example: string;
}
