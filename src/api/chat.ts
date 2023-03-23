import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai";

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
