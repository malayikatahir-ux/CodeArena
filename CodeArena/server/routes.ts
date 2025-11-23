import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";

const codeSubmissionSchema = z.object({
  code: z.string(),
  language: z.string(),
  challenge: z.string(),
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Code validation endpoint
  app.post("/api/validate-code", async (req, res) => {
    try {
      const { code, language, challenge } = codeSubmissionSchema.parse(req.body);
      
      // Simple code quality checks (not actual execution for security)
      const analysis = analyzeCode(code, language, challenge);
      
      res.json(analysis);
    } catch (error) {
      res.status(400).json({ error: "Invalid request" });
    }
  });

  // AI opponent progress endpoint
  app.post("/api/ai-opponent", async (req, res) => {
    const { difficulty, timeElapsed } = req.body;
    
    // Simulate AI opponent progress based on difficulty
    const aiStrategy = getAIStrategy(difficulty, timeElapsed);
    
    res.json(aiStrategy);
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Code analysis function (pattern-based validation)
function analyzeCode(code: string, language: string, challenge: string): {
  valid: boolean;
  score: number;
  output: string;
  mistakes: string[];
  optimizationSuggestions: string[];
} {
  const mistakes: string[] = [];
  const optimizationSuggestions: string[] = [];
  let score = 0;

  // Basic code quality checks
  const lines = code.split('\n').filter(line => line.trim());
  
  // Check for minimum code length
  if (lines.length < 2) {
    mistakes.push("Solution appears incomplete - needs more implementation.");
    return {
      valid: false,
      score: 0,
      output: "> Error: Code validation failed\n> Reason: Incomplete solution",
      mistakes,
      optimizationSuggestions
    };
  }

  // Language-specific pattern checks
  if (language === 'python') {
    if (!code.includes('def ')) {
      mistakes.push("Missing function definition in Python.");
    }
    if (code.includes('pass') && lines.length < 4) {
      mistakes.push("Function body contains only 'pass' - implementation needed.");
    }
    if (!code.includes('return')) {
      mistakes.push("No return statement found - function should return a value.");
    }
    // Check for common patterns
    if (code.includes('sorted') || code.includes('sort')) {
      score += 30;
      optimizationSuggestions.push("Good use of built-in sorting functions!");
    }
    if (code.match(/for\s+\w+\s+in/)) {
      score += 20;
      optimizationSuggestions.push("Proper iteration pattern detected.");
    }
  } else if (language === 'javascript') {
    if (!code.includes('function') && !code.includes('=>')) {
      mistakes.push("Missing function declaration in JavaScript.");
    }
    if (!code.includes('return')) {
      mistakes.push("No return statement found.");
    }
    if (code.includes('.sort') || code.includes('.filter') || code.includes('.map')) {
      score += 30;
      optimizationSuggestions.push("Excellent use of array methods!");
    }
  }

  // Code structure bonuses
  if (code.split('\n').length > 3) score += 20;
  if (code.includes('//') || code.includes('#')) {
    score += 10;
    optimizationSuggestions.push("Good code documentation with comments.");
  }

  // Edge case handling
  if (code.toLowerCase().includes('if') || code.includes('try')) {
    score += 20;
    optimizationSuggestions.push("Edge case handling detected.");
  } else {
    mistakes.push("Consider handling edge cases (empty inputs, null values, etc.).");
  }

  // Complexity analysis
  const nestedLoops = (code.match(/for/g) || []).length;
  if (nestedLoops > 1) {
    mistakes.push(`Detected ${nestedLoops} loops - algorithm may have O(n²) or higher complexity.`);
    optimizationSuggestions.push("Consider using more efficient algorithms like QuickSort or hash maps.");
  }

  // Variable naming
  const singleLetterVars = code.match(/\b[a-z]\b/g);
  if (singleLetterVars && singleLetterVars.length > 2) {
    mistakes.push("Single-letter variable names reduce code readability.");
  }

  score = Math.min(100, Math.max(0, score));

  const output = generateMockOutput(language, score);

  return {
    valid: mistakes.length < 3,
    score,
    output,
    mistakes: mistakes.slice(0, 5), // Limit to top 5
    optimizationSuggestions: optimizationSuggestions.slice(0, 3)
  };
}

function generateMockOutput(language: string, score: number): string {
  const passCount = Math.floor((score / 100) * 5);
  const failCount = 5 - passCount;
  
  let output = `> Compiling ${language}...\n> Running test suite...\n`;
  
  for (let i = 1; i <= passCount; i++) {
    output += `> Test Case ${i}: ✓ PASS\n`;
  }
  for (let i = passCount + 1; i <= 5; i++) {
    output += `> Test Case ${i}: ✗ FAIL\n`;
  }
  
  output += `\n> Execution Time: ${(Math.random() * 0.1).toFixed(3)}s\n`;
  output += `> Memory Usage: ${Math.floor(Math.random() * 20 + 10)}MB\n`;
  output += `\n> Score: ${score}/100`;
  
  if (score >= 70) {
    output += "\n> Status: All critical tests passed! ✓";
  } else {
    output += "\n> Status: Some tests failed. Review mistakes below.";
  }
  
  return output;
}

function getAIStrategy(difficulty: string, timeElapsed: number): {
  progress: number;
  codeSnippet: string;
} {
  // AI completes faster on easier difficulties
  let baseSpeed = 0;
  switch (difficulty) {
    case 'easy':
      baseSpeed = 0.4; // AI slower
      break;
    case 'medium':
      baseSpeed = 0.7;
      break;
    case 'hard':
      baseSpeed = 1.2; // AI faster
      break;
    default:
      baseSpeed = 0.7;
  }

  // Progress increases over time
  const progress = Math.min(100, (timeElapsed / 300) * 100 * baseSpeed + Math.random() * 10);
  
  const snippets = [
    "# Analyzing input data structure...",
    "# Implementing core algorithm...",
    "# Optimizing for edge cases...",
    "# Running performance benchmarks...",
    "# Finalizing solution...",
  ];
  
  const snippetIndex = Math.floor(progress / 20);
  
  return {
    progress,
    codeSnippet: snippets[Math.min(snippetIndex, snippets.length - 1)]
  };
}
