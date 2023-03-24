import { notification } from "antd";
import {
  ChatCompletionRequestMessage,
  CreateChatCompletionResponse,
} from "openai";
import { useState } from "react";
import { getResponse } from "../api/chat";
import { Prompt, useAppState } from "../App";

const useChat = () => {
  const app = useAppState();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CreateChatCompletionResponse | null>(
    null
  );

  const get = async (prompt: Prompt) => {
    setIsLoading(true);
    try {
      const response = await getResponse(prompt.messages, {
        apiKey: app.apiKey,
      });
      setResult(response);
      app.setAppState((prev) => {
        return {
          ...prev,
          runHistory: [
            ...prev.runHistory,
            {
              id: crypto.randomUUID(),
              prompt_id: prompt.id,
              inputs: { messages: prompt.messages },
              outputs: { apiResponse: response },
              timestamp: new Date().toISOString(),
            },
          ],
        };
      });
      setIsLoading(false);
      return response;
    } catch (e) {
      console.error("Error while fetching response", e);
      notification.error({
        message: "Error occured while fetching API response",
      });
      setIsLoading(false);
      return;
    }
  };

  return {
    isLoading,
    result,
    getResponse: get,
    clearResult: () => setResult(null),
  };
};

export default useChat;
