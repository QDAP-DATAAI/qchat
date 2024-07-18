"use client"

import { Textarea } from "@/features/ui/textarea"
import { Field, Control } from "@radix-ui/react-form"
import { MergeIcon, EditIcon } from "lucide-react"
import { useState } from "react"

type SentenceProps = {
  id: string
  sentence: Sentence
  speaker: Speaker
  onChange: (sentence: Sentence) => void
  onMergeUp?: () => void
  onMergeDown?: () => void
}
export const Sentence = ({ sentence, speaker, onChange, onMergeUp, onMergeDown }: SentenceProps) => {
  const [isEditing, setIsEditing] = useState(false)

  return (
    <div
      className={`${speaker?.background} group flex cursor-pointer items-start gap-2 py-1 transition-colors duration-200 hover:shadow-2xl`}
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
const SentenceDisplay = ({ sentence, speaker, onMergeDown, onMergeUp, switchToEdit }: SentenceDisplayProps) => {
  const { line } = sentence
  return (
    <>
      <b className={`${speaker?.color} text-nowrap rounded-r-md px-1`}>{speaker?.name}</b>
      <div className="flex flex-1 group-hover:bg-designAccent">
        <span className={"w-full group-hover:mr-8"}>{line.replace(/\[(.*?)\]/, "").replace(/\((.*?)\)/, "")}</span>
        <div className={"relative z-10 hidden gap-1 group-hover:flex group-hover:flex-col group-hover:justify-center"}>
          {onMergeUp && (
            <MergeIcon
              size={16}
              className="absolute -top-6 right-0 h-8 w-8 rounded-t-full p-1 hover:bg-altButton hover:text-background"
              onClick={onMergeUp}
            />
          )}

          <EditIcon
            size={16}
            className="absolute right-0 h-8 w-8 rounded-full p-1 hover:bg-altButton hover:text-background"
            onClick={switchToEdit}
          />

          {onMergeDown && (
            <MergeIcon
              size={16}
              className="absolute -bottom-6 right-0 h-8 w-8 rotate-180 rounded-t-full p-1 hover:bg-altButton hover:text-background"
              onClick={onMergeDown}
            />
          )}
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
const SentenceForm = ({ id, line, onChange }: SentenceFormProps) => {
  const [input, setInput] = useState(line)
  return (
    <Field name={`sentence_${id}`} asChild>
      <Control asChild>
        <Textarea
          className={`w-full rounded-md border-2 p-2`}
          value={input}
          autoFocus
          onChange={e => setInput(e.target.value)}
          onBlur={() => onChange(input)}
          // rows={4}
        />
      </Control>
    </Field>
  )
}
