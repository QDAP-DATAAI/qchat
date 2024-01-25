"use client";

import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useRouter } from "next/router";
import { FindChatThreadByTitleAndEmpty } from "../chat-services/chat-thread-service";
import { useGlobalMessageContext } from "@/features/global-message/global-message-context";

export const MiniNewChat = () => {
  const router = useRouter();
  const { showError } = useGlobalMessageContext();

  const startNewChat = async () => {
    const title = "New Chat";

    try {
      const existingThread = await FindChatThreadByTitleAndEmpty(title);
      
      if (existingThread) {
        router.push(`/chat/${existingThread.id}`);
      } else {
        router.push("/chat/");
      }
    } catch (error) {
      console.error("Error starting new chat:", error);
      showError('Failed to start a new chat. Please try again later.');
    }
  };

  return (
    <div className="lg:hidden absolute top-4 right-4">
      <Button
        className="gap-2 rounded-full w-[40px] h-[40px] p-1 text-primary"
        variant="outline"
        onClick={startNewChat}
      >
        <PlusCircle size={40} strokeWidth={1.2} />
      </Button>
    </div>
  );
};
