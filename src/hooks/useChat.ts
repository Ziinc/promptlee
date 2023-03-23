import {
  ChatCompletionRequestMessage,
  CreateChatCompletionResponse,
} from "openai";
import { useState } from "react";
import { getResponse } from "../api/chat";
import { Prompt, useAppState } from "../App";

const useChat = () => {
  const app = useAppState();
  const [result, setResult] = useState<CreateChatCompletionResponse | null>(
    null
  );

  const get = async (prompt: Prompt) => {
    const response = await getResponse(prompt.messages, { apiKey: app.apiKey });
    console.log("response", response);
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

    return response;
  };

  return {
    result,
    getResponse: get,
    clearResult: () => setResult(null),
  };
};

export default useChat;
