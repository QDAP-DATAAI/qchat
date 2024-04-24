import { flesch } from "flesch"
import { syllable } from "syllable"

function countWords(text: string): number {
  return text.match(/\w+/g)?.length || 0
}

function countSentences(text: string): number {
  return text.match(/[.!?]+(\s|$)/g)?.length || 0
}

export function calculateFleschScore(text: string): number {
  const words = countWords(text)
  const sentences = countSentences(text)
  const syllables = syllable(text)

  if (words === 0 || sentences === 0) {
    return 100
  }

  let score = 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words)

  score = Math.max(0, Math.min(score, 100))

  return Math.round(score)
}
