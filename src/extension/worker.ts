import browser, { Tabs } from "webextension-polyfill";
import { getPromptOutput } from "../api/chat";
import { DEFAULT_PROMPTS } from "../constants";
import { resolveTextParams } from "../utils";
import { getGauthSessionTokens, storageKeys } from "./common";
import "./worker/auth";
import { signInWithGoogle } from "../api/auth";
import { handleSignIn, handleSignOut } from "./worker/auth";

// browser.storage.local.set({"test": "ok"})

browser.runtime.onInstalled.addListener(() => {
  console.log("Extension installed");
});
browser.runtime.onMessage.addListener((message) => {
  console.log("onMessage", message);
});

const isSignedIn = async () => {
  const keys = await getGauthSessionTokens();
  return keys.gauthAccessToken && keys.gauthRefreshToken;
};

browser.contextMenus.create({
  id: "app-home",
  title: "Go to App",
  contexts: ["all"],
});

browser.contextMenus.create({
  id: "sign-out",
  title: "Sign out for extension",
  contexts: (await isSignedIn()) ? ["all"] : ["launcher"],
});

browser.contextMenus.create({
  id: "sign-in",
  title: "Sign in for extension",
  contexts: (await isSignedIn()) ? ["launcher"] : ["all"],
});

browser.contextMenus.create({
  id: "separator1",
  type: "separator",
  contexts: ["all"],
});

export const showPromptsInContextMenu = () => {
  DEFAULT_PROMPTS.forEach((prompt) => {
    browser.contextMenus.update(prompt.title, {
      contexts: ["selection"],
    });
  });
};

export const hidePromptsInContextMenu = () => {
  DEFAULT_PROMPTS.forEach((prompt) => {
    browser.contextMenus.update(prompt.title, {
      contexts: ["launcher"],
    });
  });
};

const signedIn = await isSignedIn();
DEFAULT_PROMPTS.forEach((prompt) => {
  browser.contextMenus.create({
    id: prompt.title,
    title: prompt.title,
    contexts: signedIn ? ["selection"] : ["launcher"],
  });

  browser.contextMenus.onClicked.addListener(async (info, tab) => {
    console.log(`clicked ${info.menuItemId}`);
    // handle sign in
    if (info.menuItemId === "sign-in") {
      const { data, error } = await signInWithGoogle({
        skipBrowserRedirect: true,
        queryParams: {
          sign_in_method: "ext",
        },
      });
      if (!data.url) {
        return;
      }
      await handleSignIn(data.url);

      // handle sign in
      return;
    } else if (info.menuItemId === "app-home") {
      // nav to app
      browser.tabs.create({ url: import.meta.env.VITE_APP_URL, active: true });
      return;
    } else if (info.menuItemId === "sign-out") {
      await handleSignOut();
      return;
    }

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
