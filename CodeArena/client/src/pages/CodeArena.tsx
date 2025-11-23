import React, { useState, useEffect, useRef } from 'react';
import { StarField } from '@/components/StarField';
import { Robot } from '@/components/Robot';
import { CodeEditor } from '@/components/CodeEditor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Trophy, Timer, Code2, Sparkles, AlertCircle, Terminal } from 'lucide-react';

// Game Types
type GameStep = 'setup' | 'countdown' | 'battle' | 'result';
type PlayerField = 'Engineering' | 'Medical' | 'Data Science' | 'Web Dev' | 'Computer Science' | 'AI' | 'Software Engineering';

export default function CodeArena() {
  // State
  const [step, setStep] = useState<GameStep>('setup');
  const [robotMessage, setRobotMessage] = useState("Welcome to CodeArena! I'm your guide. Let's set up your profile first.");
  
  // Setup State
  const [playerName, setPlayerName] = useState('');
  const [playerField, setPlayerField] = useState<PlayerField | ''>('');
  const [language, setLanguage] = useState<string>('');
  const [difficulty, setDifficulty] = useState('easy');
  
  // Game State
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [playerCode, setPlayerCode] = useState('');
  const [aiCode, setAiCode] = useState('');
  const [playerProgress, setPlayerProgress] = useState(0);
  const [aiProgress, setAiProgress] = useState(0);
  const [winner, setWinner] = useState<'player' | 'ai' | null>(null);
  const [mistakes, setMistakes] = useState<string[]>([]);
  const [output, setOutput] = useState<string>('');

  // Challenge based on field
  const getChallenge = () => {
    switch(playerField) {
      case 'Medical': return "Analyze patient data: Calculate average heart rate from the input list and filter out anomalies (>100bpm).";
      case 'Engineering': return "Calculate structural load: Given a list of force vectors, compute the net force and direction.";
      case 'Data Science': return "Clean dataset: Remove duplicates and fill missing values with the mean of the column.";
      case 'AI': return "Implement a basic neural network forward pass function using matrix multiplication.";
      case 'Computer Science': return "Implement a binary search tree insertion method with O(log n) complexity.";
      case 'Software Engineering': return "Design a singleton pattern implementation that is thread-safe.";
      default: return "Sort the array using QuickSort algorithm and optimize for space complexity.";
    }
  };

  // Set initial code based on language
  useEffect(() => {
    if (language === 'python') {
      setPlayerCode('def solution(data):\n    # Write your code here\n    pass');
      setAiCode('def solution(data):\n    # AI is thinking...\n    pass');
    } else if (language === 'javascript') {
      setPlayerCode('function solution(data) {\n    // Write your code here\n}');
      setAiCode('function solution(data) {\n    // AI is thinking...\n}');
    } else if (language === 'cpp') {
      setPlayerCode('void solution(vector<int>& data) {\n    // Write your code here\n}');
      setAiCode('void solution(vector<int>& data) {\n    // AI is thinking...\n}');
    } else if (language === 'java') {
      setPlayerCode('public void solution(int[] data) {\n    // Write your code here\n}');
      setAiCode('public void solution(int[] data) {\n    // AI is thinking...\n}');
    }
  }, [language]);

  // Countdown Logic & AI Opponent
  useEffect(() => {
    if (step === 'battle' && timeLeft > 0 && !winner) {
      const startTime = Date.now();
      
      const timer = setInterval(async () => {
        setTimeLeft(prev => prev - 1);
        
        // Update AI progress via backend
        const elapsed = (Date.now() - startTime) / 1000;
        try {
          const response = await fetch('/api/ai-opponent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ difficulty, timeElapsed: elapsed })
          });
          const aiData = await response.json();
          
          setAiProgress(aiData.progress);
          if (aiData.codeSnippet) {
            setAiCode(prev => prev + '\n    ' + aiData.codeSnippet);
          }
          
          // AI wins if it reaches 100% first
          if (aiData.progress >= 100 && playerProgress < 100) {
            finishGame('ai');
          }
        } catch (error) {
          // Fallback to simple progress if API fails
          setAiProgress(prev => Math.min(prev + Math.random() * 3, 100));
        }
      }, 1000);
      
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && !winner) {
      finishGame('ai');
    }
  }, [step, timeLeft, winner, difficulty, playerProgress]);

  // Robot Guidance Logic
  useEffect(() => {
    if (step === 'setup') {
      if (!playerName) setRobotMessage("First, what should I call you, challenger?");
      else if (!playerField) setRobotMessage(`Nice to meet you, ${playerName}! What's your field of expertise?`);
      else if (!language) setRobotMessage("Which programming language do you prefer for this battle?");
      else setRobotMessage("Excellent choices! Ready to begin the simulation?");
    }
  }, [playerName, playerField, language, step]);

  const startGame = () => {
    setStep('countdown');
    setRobotMessage("Initializing battle environment...");
    
    // Wait for the initialization message to be spoken (3 seconds) before starting countdown
    setTimeout(() => {
      let count = 3;
      setRobotMessage(`Starting in ${count}...`);
      
      const countdown = setInterval(() => {
        count--;
        if (count > 0) {
          setRobotMessage(`Starting in ${count}...`);
        } else if (count === 0) {
          setRobotMessage("Go!");
        } else {
          clearInterval(countdown);
          setStep('battle');
          setRobotMessage("BEGIN! Solve the challenge before the AI!");
        }
      }, 1500); // Slower countdown (1.5s) to allow speech to finish
    }, 3000);
  };

  const finishGame = (result: 'player' | 'ai') => {
    setWinner(result);
    setStep('result');
    if (result === 'player') {
      setRobotMessage("Incredible! You've outperformed the AI model! Victory is yours!");
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#d946ef', '#8b5cf6', '#0ea5e9']
      });
    } else {
      setRobotMessage("Analysis complete. The AI was slightly more optimized this time. Let's review your logic.");
      setMistakes([
        "Consider handling edge cases for empty inputs.",
        "Your sorting algorithm has O(n²) complexity; QuickSort would be O(n log n).",
        "Variable naming could be more descriptive for maintainability."
      ]);
    }
  };

  const handleSubmit = async () => {
    setRobotMessage("Compiling and analyzing your solution...");
    
    try {
      const response = await fetch('/api/validate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: playerCode,
          language,
          challenge: getChallenge()
        })
      });
      
      const result = await response.json();
      
      setOutput(result.output);
      setPlayerProgress(result.score);
      
      if (result.mistakes && result.mistakes.length > 0) {
        setMistakes(result.mistakes);
      } else {
        setMistakes([]);
      }
      
      setTimeout(() => {
        if (result.score >= 70) {
          finishGame('player');
        } else {
          setRobotMessage("Your code needs improvement. Check the mistakes and try again!");
        }
      }, 1500);
    } catch (error) {
      setOutput("> Error: Failed to validate code. Please try again.");
      setRobotMessage("Connection error. Please check your code and try again.");
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col overflow-hidden">
      <StarField />
      
      {/* Header */}
      <header className="relative z-10 p-6 flex justify-between items-center bg-background/50 backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center gap-2">
          <Code2 className="w-8 h-8 text-primary animate-pulse" />
          <h1 className="text-3xl font-orbitron font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-400 to-blue-500 neon-text">
            CodeArena
          </h1>
        </div>
        {step === 'battle' && (
          <div className="flex items-center gap-4 font-mono text-xl text-primary">
            <Timer className="w-6 h-6" />
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </div>
        )}
      </header>

      <main className="relative z-10 flex-1 container mx-auto p-6 flex gap-6">
        {/* Left: Robot Assistant */}
        <div className="w-1/4 hidden lg:flex flex-col justify-center items-center">
          <Robot message={robotMessage} emotion={winner === 'player' ? 'happy' : 'neutral'} speaking={true} />
        </div>

        {/* Center: Main Content */}
        <div className="flex-1 flex flex-col justify-center max-w-4xl mx-auto w-full">
          <AnimatePresence mode="wait">
            
            {/* SETUP SCREEN */}
            {step === 'setup' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, y: -20 }}
                className="w-full max-w-lg mx-auto"
              >
                <Card className="bg-card/50 backdrop-blur-md border-primary/50 neon-border">
                  <CardHeader>
                    <CardTitle className="text-center font-orbitron text-2xl text-primary">
                      Initialize Profile
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-white">Codename</Label>
                      <Input 
                        value={playerName} 
                        onChange={(e) => setPlayerName(e.target.value)}
                        placeholder="Enter your alias..."
                        className="bg-black/50 border-white/20 text-white font-mono"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-white">Specialization</Label>
                        <Select onValueChange={(v) => setPlayerField(v as PlayerField)}>
                          <SelectTrigger className="bg-black/50 border-white/20 text-white">
                            <SelectValue placeholder="Select Field" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Engineering">Engineering</SelectItem>
                            <SelectItem value="Software Engineering">Software Engineering</SelectItem>
                            <SelectItem value="Computer Science">Computer Science</SelectItem>
                            <SelectItem value="AI">Artificial Intelligence</SelectItem>
                            <SelectItem value="Medical">Medical</SelectItem>
                            <SelectItem value="Data Science">Data Science</SelectItem>
                            <SelectItem value="Web Dev">Web Development</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-white">Language</Label>
                        <Select onValueChange={setLanguage}>
                          <SelectTrigger className="bg-black/50 border-white/20 text-white">
                            <SelectValue placeholder="Select Language" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="python">Python</SelectItem>
                            <SelectItem value="javascript">JavaScript</SelectItem>
                            <SelectItem value="java">Java</SelectItem>
                            <SelectItem value="cpp">C++</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white">Difficulty</Label>
                      <div className="flex gap-2">
                        {['easy', 'medium', 'hard'].map((d) => (
                          <Button
                            key={d}
                            variant={difficulty === d ? "default" : "outline"}
                            onClick={() => setDifficulty(d)}
                            className="flex-1 capitalize"
                          >
                            {d}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <Button 
                      onClick={startGame} 
                      disabled={!playerName || !playerField || !language}
                      className="w-full bg-gradient-to-r from-primary to-blue-600 hover:opacity-90 font-orbitron text-lg h-12 neon-border"
                    >
                      Enter Arena
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* BATTLE SCREEN */}
            {(step === 'battle' || step === 'countdown') && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col gap-4"
              >
                {/* Challenge Card */}
                <Card className="bg-black/60 border-white/10">
                  <CardContent className="p-4">
                    <h3 className="text-primary font-orbitron mb-2 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" /> 
                      Current Objective: {playerField} Protocol
                    </h3>
                    <p className="text-white/80 font-mono text-sm">
                      {getChallenge()}
                    </p>
                  </CardContent>
                </Card>

                {/* Editors */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 h-[450px]">
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-sm text-white/70 mb-1">
                      <span>{playerName} ({language})</span>
                      <span>Progress: {playerProgress}%</span>
                    </div>
                    <Progress value={playerProgress} className="h-2 bg-white/10" indicatorClassName="bg-primary" />
                    <CodeEditor 
                      label="PLAYER TERMINAL" 
                      code={playerCode} 
                      onChange={setPlayerCode}
                      language={language}
                      className="flex-1 border-primary/30"
                    />
                  </div>

                  <div className="flex flex-col gap-2 opacity-90">
                    <div className="flex justify-between text-sm text-white/70 mb-1">
                      <span>AI Opponent</span>
                      <span>Progress: {Math.round(aiProgress)}%</span>
                    </div>
                    <Progress value={aiProgress} className="h-2 bg-white/10" indicatorClassName="bg-red-500" />
                    <CodeEditor 
                      label="AI CORE" 
                      code={aiCode} 
                      readOnly 
                      language={language}
                      className="flex-1 border-red-500/30" 
                    />
                  </div>
                </div>

                {/* Output Console */}
                <div className="h-32 bg-black/80 border border-white/10 rounded-lg p-2 overflow-hidden flex flex-col">
                  <div className="flex items-center justify-between px-2 mb-1 border-b border-white/5 pb-1">
                    <span className="text-xs text-muted-foreground font-mono flex items-center gap-2">
                      <Terminal className="w-3 h-3" /> CONSOLE OUTPUT
                    </span>
                    <Button size="sm" onClick={handleSubmit} className="h-6 text-xs bg-primary hover:bg-primary/80">
                      Run & Submit
                    </Button>
                  </div>
                  <pre className="flex-1 font-mono text-xs text-green-400 p-2 overflow-y-auto whitespace-pre-wrap">
                    {output || "> Ready for execution..."}
                  </pre>
                </div>
              </motion.div>
            )}

            {/* RESULT SCREEN */}
            {step === 'result' && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center space-y-6 max-w-2xl mx-auto"
              >
                {winner === 'player' ? (
                  <div className="space-y-4">
                    <Trophy className="w-24 h-24 text-yellow-400 mx-auto animate-bounce" />
                    <h2 className="text-5xl font-orbitron font-bold text-white neon-text">VICTORY!</h2>
                    <p className="text-xl text-white/80 font-rajdhani">
                      Outstanding performance, {playerName}. Your {language} logic was flawless.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-24 h-24 bg-red-500/20 rounded-full mx-auto flex items-center justify-center">
                      <Code2 className="w-12 h-12 text-red-500" />
                    </div>
                    <h2 className="text-5xl font-orbitron font-bold text-red-500 neon-text">DEFEAT</h2>
                    <p className="text-xl text-white/80 font-rajdhani">
                      The AI was faster this time. Review the optimal solution below.
                    </p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4 mt-8 text-left">
                  <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                    <h4 className="font-orbitron text-green-400 mb-2">Your Output</h4>
                    <pre className="text-xs font-mono text-green-200/80 whitespace-pre-wrap">{output}</pre>
                  </div>
                  <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                    <h4 className="font-orbitron text-blue-400 mb-2">Optimal Solution</h4>
                    <pre className="text-xs font-mono text-blue-200/80 whitespace-pre-wrap">
                      {language === 'python' ? 'def solution(data):\n    return sorted(data)' : 
                       language === 'javascript' ? 'const solution = (data) => data.sort()' : 
                       '// Optimal solution unavailable'}
                    </pre>
                  </div>
                </div>

                {/* Mistakes Analysis Section */}
                {mistakes.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-6 rounded-lg bg-red-500/5 border border-red-500/20 text-left"
                  >
                    <h3 className="flex items-center gap-2 text-red-400 font-orbitron mb-4">
                      <AlertCircle className="w-5 h-5" /> Code Analysis & Mistakes
                    </h3>
                    <ul className="space-y-2">
                      {mistakes.map((mistake, index) => (
                        <li key={index} className="flex items-start gap-2 text-white/80 font-rajdhani text-lg">
                          <span className="text-red-500 mt-1">•</span>
                          {mistake}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}

                <Button 
                  onClick={() => {
                    setStep('setup');
                    setPlayerCode('');
                    setAiProgress(0);
                    setPlayerProgress(0);
                    setOutput('');
                    setWinner(null);
                    setMistakes([]);
                  }} 
                  variant="outline" 
                  className="mt-8 border-white/20 hover:bg-white/10 text-white"
                >
                  Play Again
                </Button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
        
        {/* Mobile Robot (Visible only on small screens) */}
        <div className="lg:hidden absolute bottom-4 right-4 w-24 h-24 z-50">
          <Robot message={step === 'battle' ? '' : robotMessage} />
        </div>
      </main>
    </div>
  );
}
