export const ANSI_COLORS: Record<number, string> = {
  30: "#1a1a1a",
  31: "#ef4444",
  32: "#22c55e",
  33: "#eab308",
  34: "#3b82f6",
  35: "#a855f7",
  36: "#06b6d4",
  37: "#e4e4e4",
  90: "#666666",
  91: "#f87171",
  92: "#4ade80",
  93: "#facc15",
  94: "#60a5fa",
  95: "#c084fc",
  96: "#22d3ee",
  97: "#ffffff",
  40: "#1a1a1a",
  41: "#ef4444",
  42: "#22c55e",
  43: "#eab308",
  44: "#3b82f6",
  45: "#a855f7",
  46: "#06b6d4",
  47: "#e4e4e4",
  100: "#666666",
  101: "#f87171",
  102: "#4ade80",
  103: "#facc15",
  104: "#60a5fa",
  105: "#c084fc",
  106: "#22d3ee",
  107: "#ffffff",
}

export type AnsiSpan = {
  text: string
  fg?: string
  bg?: string
  bold?: boolean
}

const ANSI_ESCAPE = String.fromCharCode(27)
const ANSI_SGR_PATTERN = `${ANSI_ESCAPE}\\[([0-9;]*)m`
const ANSI_SGR_STRIP_PATTERN = `${ANSI_ESCAPE}\\[[0-9;]*m`

export function parseAnsi(input: string): AnsiSpan[] {
  const result: AnsiSpan[] = []
  const regex = new RegExp(ANSI_SGR_PATTERN, "g")
  let lastIndex = 0
  let currentFg: string | undefined
  let currentBg: string | undefined
  let currentBold = false

  let match = regex.exec(input)
  while (match !== null) {
    if (match.index > lastIndex) {
      const text = input.slice(lastIndex, match.index)
      if (text) {
        result.push({ text, fg: currentFg, bg: currentBg, bold: currentBold })
      }
    }

    const codes = (match[1] || "").split(";").map((code) => Number.parseInt(code, 10) || 0)
    for (const code of codes) {
      if (code === 0) {
        currentFg = undefined
        currentBg = undefined
        currentBold = false
      } else if (code === 1) {
        currentBold = true
      } else if (code === 39) {
        currentFg = undefined
      } else if (code === 49) {
        currentBg = undefined
      } else if ((code >= 30 && code <= 37) || (code >= 90 && code <= 97)) {
        currentFg = ANSI_COLORS[code]
      } else if ((code >= 40 && code <= 47) || (code >= 100 && code <= 107)) {
        currentBg = ANSI_COLORS[code]
      }
    }

    lastIndex = match.index + match[0].length
    match = regex.exec(input)
  }

  if (lastIndex < input.length) {
    const text = input.slice(lastIndex)
    if (text) {
      result.push({ text, fg: currentFg, bg: currentBg, bold: currentBold })
    }
  }

  return result
}

export function stripAnsi(input: string): string {
  return input.replace(new RegExp(ANSI_SGR_STRIP_PATTERN, "g"), "")
}

export function isGrepContentOutput(output: string): boolean {
  const lines = output.split("\n").slice(0, 5)
  return lines.some((line) => /^\d+[:-]/.test(line))
}

export type GrepLine = {
  lineNum: string
  isMatch: boolean
  content: string
}

export function parseGrepOutput(output: string): GrepLine[] {
  return output.split("\n").map((line) => {
    const match = line.match(/^(\d+)([:])(.*)$/)
    const context = line.match(/^(\d+)(-)(.*)$/)

    if (match?.[1] && match[3] !== undefined) {
      return { lineNum: match[1], isMatch: true, content: match[3] }
    }

    if (context?.[1] && context[3] !== undefined) {
      return { lineNum: context[1], isMatch: false, content: context[3] }
    }

    return { lineNum: "", isMatch: false, content: line }
  })
}
