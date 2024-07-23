"use client"

import { Field, Control } from "@radix-ui/react-form"
import { ArrowUp, ArrowDown, Pencil } from "lucide-react"
import { useState } from "react"

import { Button } from "@/features/ui/button"
import { Textarea } from "@/features/ui/textarea"

import { Sentence, Speaker } from "./types"

type SentenceProps = {
  id: string
  sentence: Sentence
  speaker: Speaker
  onChange: (sentence: Sentence) => void
  onMergeUp?: () => void
  onMergeDown?: () => void
}

export const TranscriptSentence = ({
  sentence,
  speaker,
  onChange,
  onMergeUp,
  onMergeDown,
}: SentenceProps): JSX.Element => {
  const [isEditing, setIsEditing] = useState(false)

  return (
    <div
      className={`${speaker?.background} group flex cursor-pointer items-start gap-2 rounded-md border-2 border-transparent p-1 py-1 hover:border-accent`}
    >
      {isEditing ? (
        <SentenceForm
          id={sentence.id}
          line={sentence.line}
          onChange={newSentence => {
            setIsEditing(false)
            onChange({ ...sentence, line: newSentence })
          }}
        />
      ) : (
        <SentenceDisplay
          sentence={sentence}
          speaker={speaker}
          onMergeDown={onMergeDown}
          onMergeUp={onMergeUp}
          switchToEdit={() => setIsEditing(prev => !prev)}
        />
      )}
    </div>
  )
}

type SentenceDisplayProps = {
  sentence: Sentence
  speaker?: Speaker
  switchToEdit: () => void
  onMergeUp?: () => void
  onMergeDown?: () => void
}

// const SentenceDisplay = ({
//   sentence,
//   speaker,
//   onMergeDown,
//   onMergeUp,
//   switchToEdit,
// }: SentenceDisplayProps): JSX.Element => {
//   const { line } = sentence
//   return (
//     <>
//       <div className="flex flex-col gap-2">
//         <b className="text-nowrap">{speaker?.name}</b>
//         <div className="flex justify-center gap-1">
//           {onMergeUp && (
//             <Button
//               className="opacity-20 group-hover:opacity-100"
//               size="sm"
//               variant="accent"
//               ariaLabel="Merge Up"
//               onClick={onMergeUp}
//             >
//               <ArrowUp size={16} />
//             </Button>
//           )}
//           <Button
//             className="opacity-20 group-hover:opacity-100"
//             size="sm"
//             variant="accent"
//             ariaLabel="Edit"
//             onClick={switchToEdit}
//           >
//             <Pencil size={16} />
//           </Button>
//           {onMergeDown && (
//             <Button
//               className="opacity-20 group-hover:opacity-100"
//               size="sm"
//               variant="accent"
//               ariaLabel="Merge Down"
//               onClick={onMergeDown}
//             >
//               <ArrowDown size={16} />
//             </Button>
//           )}
//         </div>
//       </div>
//       <div className="flex flex-1 items-center">
//         <div className="flex flex-1">
//           <span className={"w-full"}>{line.replace(/\[(.*?)\]/, "").replace(/\((.*?)\)/, "")}</span>
//         </div>
//       </div>
//     </>
//   )
// }

const SentenceDisplay = ({
  sentence,
  speaker,
  onMergeDown,
  onMergeUp,
  switchToEdit,
}: SentenceDisplayProps): JSX.Element => {
  const { line } = sentence
  return (
    <>
      <div className={`flex flex-col ${speaker ? "gap-2" : ""}`}>
        {speaker && <b className="text-nowrap">{speaker.name}</b>}
        <div className="flex justify-center gap-1">
          {onMergeUp && (
            <Button
              className="opacity-20 group-hover:opacity-100"
              size="sm"
              variant="accent"
              ariaLabel="Merge Up"
              onClick={onMergeUp}
            >
              <ArrowUp size={16} />
            </Button>
          )}
          <Button
            className="opacity-20 group-hover:opacity-100"
            size="sm"
            variant="accent"
            ariaLabel="Edit"
            onClick={switchToEdit}
          >
            <Pencil size={16} />
          </Button>
          {onMergeDown && (
            <Button
              className="opacity-20 group-hover:opacity-100"
              size="sm"
              variant="accent"
              ariaLabel="Merge Down"
              onClick={onMergeDown}
            >
              <ArrowDown size={16} />
            </Button>
          )}
        </div>
      </div>
      <div className="flex flex-1 items-center">
        <div className="flex flex-1">
          <span className="w-full">{line.replace(/\[(.*?)\]/, "").replace(/\((.*?)\)/, "")}</span>
        </div>
      </div>
    </>
  )
}

type SentenceFormProps = {
  id: string
  line: string
  onChange: (line: string) => void
}

const SentenceForm = ({ id, line, onChange }: SentenceFormProps): JSX.Element => {
  const [input, setInput] = useState(line)
  return (
    <Field name={`sentence_${id}`} asChild>
      <Control asChild>
        <Textarea
          className={"w-full rounded-md border-2 p-2"}
          value={input}
          autoFocus
          onChange={e => setInput(e.target.value)}
          onBlur={() => onChange(input)}
        />
      </Control>
    </Field>
  )
}
