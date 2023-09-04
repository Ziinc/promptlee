import { CreateChatCompletionResponse } from "openai";
import { supabase } from "../utils";


export const getPromptOutput = async (prompt: string) => {
  return await supabase.functions.invoke<CreateChatCompletionResponse>(
    "run-prompt",
    {
      method: "POST",
      body: { prompt },
    }
  );
};
