import { Prompt } from "./App";

export const resolveTextParams = (
  text: string,
  params: Record<string, string>
) => {
  let replaced = text;

  for (const [key, value] of Object.entries(params)) {
    replaced = replaced.replaceAll(`@${key}`, value);
  }

  return replaced;
};

export const extractPromptParameters = (prompt: Prompt) => {
  const inputMessages = prompt.messages;

  const parsedParamNames = inputMessages.flatMap((message) => {
    if (!message.content) return [];
    const promptParams = [...message.content.matchAll(/\s\@(\S+)\s?/g)];
    return promptParams.flatMap(([_match, paramName]) => paramName);
  });
  const promptParameters = [...new Set(parsedParamNames)];
  return promptParameters;
};

export const resolvePrompt = (
  prompt: Prompt,
  params: Record<string, string>
) => {
  const resolvedMessages = prompt.messages.map((message) => ({
    ...message,
    content: resolveTextParams(message.content, params),
  }));
  return { ...prompt, messages: resolvedMessages };
};

export const removeParamsFromMessage = (
  message: Prompt["messages"][number]
) => {
  return {
    ...message,
    content: message.content.replaceAll(/\s\@(\S+)\s?/g, " "),
  };
};

export const countWords = (text: string) => (text.match(/\S+/g) || []).length;
