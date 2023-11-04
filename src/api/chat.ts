import { CreateChatCompletionResponse } from "openai";
import { supabase } from "../utils";


interface Attrs {
  prompt: string
  params: Object
  builtin_id?: string
  flow_id?: string
}
export const getPromptOutput = async (attrs: Attrs) => {
  return await supabase.functions.invoke<CreateChatCompletionResponse>(
    "run-prompt?test=test",
    {
      method: "POST",
      body: attrs,
    }
  );
};
