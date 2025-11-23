import React from 'react';
import { cn } from '@/lib/utils';

interface CodeEditorProps {
  code: string;
  onChange?: (code: string) => void;
  language?: string;
  readOnly?: boolean;
  label: string;
  className?: string;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ 
  code, 
  onChange, 
  language = 'python', 
  readOnly = false,
  label,
  className
}) => {
  return (
    <div className={cn("flex flex-col h-full bg-black/40 border border-border rounded-xl overflow-hidden backdrop-blur-sm", className)}>
      <div className="flex items-center justify-between px-4 py-2 bg-muted/30 border-b border-border">
        <span className="font-orbitron text-sm tracking-wider text-primary">{label}</span>
        <span className="text-xs text-muted-foreground font-mono uppercase">{language}</span>
      </div>
      <div className="relative flex-1 p-4 overflow-hidden">
        {/* Line Numbers */}
        <div className="absolute left-0 top-4 bottom-4 w-10 flex flex-col items-end px-2 text-muted-foreground/50 font-mono text-sm select-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="h-6">{i + 1}</div>
          ))}
        </div>
        
        {/* Editor Area */}
        <textarea
          value={code}
          onChange={(e) => onChange?.(e.target.value)}
          readOnly={readOnly}
          spellCheck={false}
          className={cn(
            "w-full h-full pl-12 bg-transparent resize-none outline-none font-mono text-sm leading-6",
            readOnly ? "text-green-400 cursor-default" : "text-blue-300"
          )}
          style={{ fontFamily: '"Share Tech Mono", monospace' }}
        />
      </div>
    </div>
  );
};
