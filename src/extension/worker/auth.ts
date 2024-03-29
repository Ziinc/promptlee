import browser, { Tabs } from "webextension-polyfill";
import { getCurrentUser, storageKeys } from "../common";

browser.runtime.onMessage.addListener((message, sender, sendResponse: any) => {
  if (message.action !== "signInWithGoogle") return;
  // remove any old listener if exists
  browser.tabs.onUpdated.removeListener(setTokens);
  const url = message.payload.url;

  // create new tab with that url
  browser.tabs.create({ url: url, active: true }).then((_tab) => {
    // add listener to that url and watch for access_token and refresh_token query string params
    browser.tabs.onUpdated.addListener(setTokens);
  });
});

browser.runtime.onMessage.addListener(
  async (message, sender, sendResponse: any) => {
    if (message.action !== "getUser") return;
    return await getCurrentUser();
  }
);

export const setTokens = async (
  tabId: number,
  changeInfo: browser.Tabs.OnUpdatedChangeInfoType,
  tab: Tabs.Tab
) => {
  // once the tab is loaded
  if (tab.status === "complete") {
    const [window] = await browser.tabs.query({
      active: true,
      lastFocusedWindow: true,
    });
    if (!window.url) {
      console.warn("No window url, check if permissions provided!");
      return;
    }
    const url = new URL(window?.url);

    // at this point user is logged-in to the web app
    // url should look like this: https://my.webapp.com/#access_token=zI1NiIsInR5c&expires_in=3600&provider_token=ya29.a0AVelGEwL6L&refresh_token=GEBzW2vz0q0s2pww&token_type=bearer
    // parse access_token and refresh_token from query string params
    if (
      (url.origin === "https://promptlee.tznc.net" ||
        url.origin === "http://localhost:5173") &&
      !!url.hash
    ) {
      const params = new URLSearchParams(
        url.hash.slice(1, url.hash.length - 1)
      );
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");

      if (accessToken && refreshToken) {
        // we can close that tab now
        // await browser.tabs.remove(tab.id);

        // store access_token and refresh_token in storage as these will be used to authenticate user in chrome extension
        browser.storage.local.set({
          [storageKeys.gauthAccessToken]: accessToken,
          [storageKeys.gauthRefreshToken]: refreshToken,
        });
        browser.tabs.sendMessage(tabId, { action: "signInComplete" });

        // remove tab listener as tokens are set
        browser.tabs.onUpdated.removeListener(setTokens);
      }
    }
  }
};
