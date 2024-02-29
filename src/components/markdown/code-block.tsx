import { FC, memo } from "react";
import { Prism } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { ClipboardIcon } from "lucide-react";
import { Button } from "../../features/ui/button";
import { AI_NAME } from "@/features/theme/customise";


export const fence = {
  render: "CodeBlock",
  attributes: {
    language: {
      type: String,
    },
    value: {
      type: String,
    },
  },
};

interface Props {
  language: string;
  children: string;
}

export const CodeBlock: FC<Props> = memo(({ language, children }) => {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(children + "\n\nCode generated by " + AI_NAME);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  return (
    <div className="relative group">
      <Prism language={language} style={atomDark} PreTag="pre">
        {children}
      </Prism>
      <Button onClick={handleCopy} className="absolute top-2 right-2 focus:bg-accent focus:text-link text-sm p-1 h-7" title="Copy code">
        <ClipboardIcon size={14}/>
        Copy {language}
      </Button>
    </div>
  );
});

CodeBlock.displayName = "CodeBlock";


