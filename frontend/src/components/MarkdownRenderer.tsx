/**
 * MarkdownRenderer Component
 *
 * Renders FormattedBlock objects with proper styling.
 * Supports paragraphs, code blocks, headings, lists, quotes, and more.
 */

import type { FormattedBlock } from '@/types'
import { CodeBlock } from './CodeBlock'
import { cn } from '@/lib/utils'

interface MarkdownRendererProps {
  blocks: FormattedBlock[]
  className?: string
}

export function MarkdownRenderer({ blocks, className }: MarkdownRendererProps) {
  if (!blocks || blocks.length === 0) {
    return null
  }

  return (
    <div className={cn('prose prose-sm dark:prose-invert max-w-none', className)}>
      {blocks.map((block, index) => (
        <BlockRenderer key={index} block={block} />
      ))}
    </div>
  )
}

interface BlockRendererProps {
  block: FormattedBlock
}

function BlockRenderer({ block }: BlockRendererProps) {
  switch (block.type) {
    case 'paragraph':
      return <ParagraphBlock block={block} />
    case 'code':
      return <CodeBlockWrapper block={block} />
    case 'heading':
      return <HeadingBlock block={block} />
    case 'list':
      return <ListBlock block={block} />
    case 'quote':
      return <QuoteBlock block={block} />
    case 'bold':
      return <BoldBlock block={block} />
    case 'italic':
      return <ItalicBlock block={block} />
    case 'link':
      return <LinkBlock block={block} />
    case 'table':
      return <TableBlock block={block} />
    default:
      return <ParagraphBlock block={block} />
  }
}

function ParagraphBlock({ block }: BlockRendererProps) {
  return (
    <p className="mb-4 leading-7 text-foreground">
      {renderInlineContent(block.content)}
    </p>
  )
}

function CodeBlockWrapper({ block }: BlockRendererProps) {
  const language = block.metadata?.language || 'plaintext'
  return (
    <CodeBlock code={block.content} language={language} />
  )
}

function HeadingBlock({ block }: BlockRendererProps) {
  const metadata = block.metadata as Record<string, unknown> | undefined
  const levelValue = typeof metadata?.level === 'number' ? metadata.level : 2
  const level = Math.min(6, Math.max(1, levelValue)) as 1 | 2 | 3 | 4 | 5 | 6

  const headingClasses: Record<number, string> = {
    1: 'text-3xl font-bold mb-4 mt-6 text-foreground',
    2: 'text-2xl font-bold mb-3 mt-5 text-foreground',
    3: 'text-xl font-bold mb-3 mt-4 text-foreground',
    4: 'text-lg font-bold mb-2 mt-3 text-foreground',
    5: 'text-base font-bold mb-2 mt-2 text-foreground',
    6: 'text-sm font-bold mb-2 mt-2 text-foreground',
  }

  const Component = `h${level}` as keyof JSX.IntrinsicElements

  return (
    <Component className={headingClasses[level]}>
      {renderInlineContent(block.content)}
    </Component>
  )
}

function ListBlock({ block }: BlockRendererProps) {
  const isOrdered = block.metadata?.ordered === true
  const items = block.content.split('\n').filter((item) => item.trim())

  const ListTag = isOrdered ? 'ol' : 'ul'
  const listClasses = isOrdered ? 'list-decimal list-inside' : 'list-disc list-inside'

  return (
    <ListTag className={cn('mb-4 space-y-1', listClasses)}>
      {items.map((item, index) => (
        <li key={index} className="text-foreground">
          {renderInlineContent(item.replace(/^[-*•]\s*/, ''))}
        </li>
      ))}
    </ListTag>
  )
}

function QuoteBlock({ block }: BlockRendererProps) {
  return (
    <blockquote className="border-l-4 border-primary bg-muted p-4 mb-4 italic text-muted-foreground rounded-r-md">
      {renderInlineContent(block.content)}
    </blockquote>
  )
}

function BoldBlock({ block }: BlockRendererProps) {
  return (
    <strong className="font-bold text-foreground">
      {renderInlineContent(block.content)}
    </strong>
  )
}

function ItalicBlock({ block }: BlockRendererProps) {
  return (
    <em className="italic text-foreground">
      {renderInlineContent(block.content)}
    </em>
  )
}

function LinkBlock({ block }: BlockRendererProps) {
  const metadata = block.metadata as Record<string, unknown> | undefined
  const href = (typeof metadata?.href === 'string' ? metadata.href : '#') || '#'
  const title = typeof metadata?.title === 'string' ? metadata.title : undefined

  return (
    <a
      href={href}
      title={title}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary hover:text-primary/80 underline underline-offset-2 transition-colors"
    >
      {renderInlineContent(block.content)}
    </a>
  )
}

function TableBlock({ block }: BlockRendererProps) {
  // Parse table content
  // Format: header | row1 | row2 etc. with cells separated by |
  const lines = block.content.split('\n').filter((line) => line.trim())
  if (lines.length < 2) return null

  // Parse header
  const headers = lines[0].split('|').map((h) => h.trim()).filter(Boolean)

  // Parse rows
  const rows = lines.slice(1).map((line) =>
    line.split('|').map((cell) => cell.trim()).filter(Boolean)
  )

  return (
    <div className="overflow-x-auto mb-4">
      <table className="w-full border-collapse border border-border">
        <thead>
          <tr className="bg-muted">
            {headers.map((header, index) => (
              <th
                key={index}
                className="border border-border px-4 py-2 text-left font-semibold text-foreground"
              >
                {renderInlineContent(header)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-muted/50 transition-colors">
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className="border border-border px-4 py-2 text-foreground"
                >
                  {renderInlineContent(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/**
 * Render inline content with basic markdown support
 */
function renderInlineContent(content: string): React.ReactNode {
  // Simple inline markdown parsing
  // Handles: **bold**, *italic*, `code`, [link](url)

  const parts: React.ReactNode[] = []
  let lastIndex = 0

  // Regex for inline elements
  const inlineRegex = /\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`|\[(.+?)\]\((.+?)\)/g
  let match

  while ((match = inlineRegex.exec(content)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      parts.push(content.substring(lastIndex, match.index))
    }

    // Add matched element
    if (match[1]) {
      // Bold
      parts.push(
        <strong key={match.index} className="font-bold">
          {match[1]}
        </strong>
      )
    } else if (match[2]) {
      // Italic
      parts.push(
        <em key={match.index} className="italic">
          {match[2]}
        </em>
      )
    } else if (match[3]) {
      // Inline code
      parts.push(
        <code
          key={match.index}
          className="bg-muted px-2 py-1 rounded text-sm font-mono text-foreground"
        >
          {match[3]}
        </code>
      )
    } else if (match[4] && match[5]) {
      // Link
      parts.push(
        <a
          key={match.index}
          href={match[5]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:text-primary/80 underline underline-offset-2 transition-colors"
        >
          {match[4]}
        </a>
      )
    }

    lastIndex = inlineRegex.lastIndex
  }

  // Add remaining text
  if (lastIndex < content.length) {
    parts.push(content.substring(lastIndex))
  }

  return parts.length > 0 ? parts : content
}
