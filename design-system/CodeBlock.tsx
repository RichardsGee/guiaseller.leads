import { useState } from 'react';
import { Clipboard, Check } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
}

/**
 * Simple code block with copy-to-clipboard button.
 * No external dependencies — uses native Clipboard API.
 */
export function CodeBlock({ code, language = 'tsx', title }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = code;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="relative rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <span className="text-[10px] font-geist-mono font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          {title || language}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded
            text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200
            hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-500" />
              Copiado
            </>
          ) : (
            <>
              <Clipboard className="w-3 h-3" />
              Copiar
            </>
          )}
        </button>
      </div>
      {/* Code */}
      <pre className="p-3 overflow-x-auto bg-white dark:bg-gray-900 text-xs font-geist-mono leading-relaxed text-gray-800 dark:text-gray-200">
        <code>{code}</code>
      </pre>
    </div>
  );
}
