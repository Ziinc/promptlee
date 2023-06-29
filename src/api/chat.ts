import {
  ChatCompletionRequestMessage,
  Configuration,
  CreateChatCompletionResponse,
  OpenAIApi,
} from "openai";
import { supabase } from "../utils";

interface Options {
  apiKey: string;
}
export const getResponse = async (
  messages: ChatCompletionRequestMessage[],
  options: Options
) => {
  const configuration = new Configuration({
    apiKey: options.apiKey,
  });

  const openai = new OpenAIApi(configuration);
  const res = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages,
  });
  return res.data;
};

export const getPromptOutput = async (prompt: string) => {
  const { data, error } = await supabase.functions.invoke("run-prompt", {
    // method: "POST",
    body: { prompt },
  });

  return data as CreateChatCompletionResponse;
};
