import React from 'react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { XCircle, Ban, FileQuestion } from "lucide-react";

interface FeedbackButtonsProps {
  areTabsEnabled: boolean;
  onReasonChange: (reason: string) => void;
}

const FeedbackButtons: React.FC<FeedbackButtonsProps> = ({ areTabsEnabled, onReasonChange }) => {
  return (
    <div className="reason-buttons p-4">
      <Tabs defaultValue={""} onValueChange={onReasonChange}>
        <TabsList className="grid w-full grid-cols-3 h-12 items-stretch">
          <TabsTrigger
            value="Unsafe"
            className="flex items-center justify-center gap-2 px-3 py-2 flex-grow"
            disabled={!areTabsEnabled}
          >
            <Ban size={20} /> Unsafe
          </TabsTrigger>
          <TabsTrigger
            value="Inaccurate"
            className="flex items-center justify-center gap-2 px-3 py-2 flex-grow"
            disabled={!areTabsEnabled}
          >
            <XCircle size={20} /> Inaccurate
          </TabsTrigger>
          <TabsTrigger
            value="Unhelpful"
            className="flex items-center justify-center gap-2 px-3 py-2 flex-grow"
            disabled={!areTabsEnabled}
          >
            <FileQuestion size={20} /> Unhelpful
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};

export default FeedbackButtons;
