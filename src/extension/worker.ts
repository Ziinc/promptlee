import browser from "webextension-polyfill";
import { getPromptOutput } from "../api/chat";
import { DEFAULT_PROMPTS } from "../constants";
import { resolveTextParams } from "../utils";

browser.runtime.onInstalled.addListener(() => {
  console.log("Extension installed");
});
browser.runtime.onMessage.addListener((message) => {
  console.log("onMessage", message);
});

DEFAULT_PROMPTS.forEach((prompt) => {
  browser.contextMenus.create({
    id: prompt.title,
    title: prompt.title,
    contexts: ["selection"],
  });

  browser.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId != prompt.title) {
      return;
    }
    // get prompt output
    const params = {
      text: info.selectionText || "",
    };

    const resolved = resolveTextParams(prompt.prompt_text, params);
    const { data, error } = await getPromptOutput({
      prompt: resolved,
      params,
      builtin_id: prompt.builtin_id,
    });
    if (error) {
      console.error(error);
    }
    browser.tabs.sendMessage(tab?.id!, { runResult: data });
  });
});
