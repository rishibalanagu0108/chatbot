/**
 * CodeBlock Component
 *
 * Renders code blocks with syntax highlighting and copy-to-clipboard.
 */

import { useState } from 'react'
import hljs from 'highlight.js'
import 'highlight.js/styles/atom-one-dark.css'
import { Button } from '@/components/ui'

interface CodeBlockProps {
  code: string
  language?: string
  showLineNumbers?: boolean
}

export function CodeBlock({
  code,
  language = 'plaintext',
  showLineNumbers = true,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  // Highlight code based on language
  const highlightCode = () => {
    try {
      if (language && language !== 'plaintext') {
        const highlighted = hljs.highlight(code, {
          language,
          ignoreIllegals: true,
        })
        return highlighted.value
      }
    } catch (error) {
      console.warn(`Failed to highlight ${language}:`, error)
    }
    // Fallback to plain text
    return hljs.utils.escapeHtml(code)
  }

  const highlightedCode = highlightCode()

  // Handle copy to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      // Reset after 2 seconds
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  // Get language display name
  const getLanguageName = () => {
    const names: Record<string, string> = {
      javascript: 'JavaScript',
      typescript: 'TypeScript',
      python: 'Python',
      java: 'Java',
      cpp: 'C++',
      csharp: 'C#',
      php: 'PHP',
      ruby: 'Ruby',
      go: 'Go',
      rust: 'Rust',
      swift: 'Swift',
      kotlin: 'Kotlin',
      html: 'HTML',
      css: 'CSS',
      sql: 'SQL',
      bash: 'Bash',
      shell: 'Shell',
      plaintext: 'Text',
      json: 'JSON',
      yaml: 'YAML',
      markdown: 'Markdown',
      xml: 'XML',
    }
    return names[language?.toLowerCase() || 'plaintext'] || language || 'Code'
  }

  return (
    <div className="not-prose my-4 overflow-hidden rounded-lg border border-border bg-slate-950 dark:bg-slate-950">
      {/* Header */}
      <div className="flex items-center justify-between bg-slate-900 px-4 py-2 text-xs font-medium text-slate-400">
        <span className="text-slate-400">{getLanguageName()}</span>
        <Button
          onClick={handleCopy}
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs hover:bg-slate-800 hover:text-slate-200"
        >
          {copied ? (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-1"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-1"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              Copy
            </>
          )}
        </Button>
      </div>

      {/* Code */}
      <pre className="overflow-x-auto p-4 text-sm leading-6 text-slate-200">
        <code
          className={`hljs language-${language}`}
          dangerouslySetInnerHTML={{ __html: highlightedCode }}
        />
      </pre>
    </div>
  )
}
