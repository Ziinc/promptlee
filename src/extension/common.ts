import browser from "webextension-polyfill";
import { supabase } from "../utils";
import { User } from "@supabase/supabase-js";

export const storageKeys = {
  gauthAccessToken: "gauthAccessToken",
  gauthRefreshToken: "gauthRefreshToken",
};

export const openGoogleSignInTab = async (authUrl: string) => {
  return await browser.runtime.sendMessage({
    action: "signInWithGoogle",
    payload: { url: authUrl }, // url is something like: https://[project_id].supabase.co/auth/v1/authorize?provider=google
  });
};

export const onSignInComplete = async (cb: () => Promise<void>) => {
  browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action !== "signInComplete") return;
    cb();
  });
};

export async function getCurrentUser(): Promise<null | {
  user: User;
  accessToken: string;
}> {
  const gauthAccessToken = (
    await browser.storage.local.get(storageKeys.gauthAccessToken)
  )[storageKeys.gauthAccessToken];
  const gauthRefreshToken = (
    await browser.storage.local.get(storageKeys.gauthRefreshToken)
  )[storageKeys.gauthRefreshToken];

  if (gauthAccessToken && gauthRefreshToken) {
    try {
      // set user session from access_token and refresh_token
      const resp = await supabase.auth.setSession({
        access_token: gauthAccessToken,
        refresh_token: gauthRefreshToken,
      });
      console.log("resp", resp);
      const user = resp.data?.user;
      const supabaseAccessToken = resp.data.session?.access_token;

      if (user && supabaseAccessToken) {
        return { user, accessToken: supabaseAccessToken };
      }
    } catch (e: any) {
      console.error("Google Auth error: ", e);
    }
  }

  return null;
}
