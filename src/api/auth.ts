import { GoTrueClient } from "@supabase/gotrue-js";
import { supabase as client } from "../utils";

export const signOut = () => {
  client.auth.signOut();
};

export const getUserId = async () => {
  const { data, error } = await client.auth.getSession();
  return data.session?.user.id;
};

export const getSession = async () => {
  const { data, error } = await client.auth.getSession();
  return data;
};

export const checkAuthed = async () => {
  await client.auth.refreshSession();
};

export const onAuthStateChange = (
  callback: Parameters<GoTrueClient["onAuthStateChange"]>[0]
) => {
  const { data } = client.auth.onAuthStateChange(callback);
  return data;
};

export async function signInWithGoogle() {
  const { data, error } = await client.auth.signInWithOAuth({
    provider: "google",
  });
}

// export const signUp = async (attrs: { email: string; password: string }) => {
//   const { data } = await client.auth.signUp(attrs);
//   return data;
// };

// export const signInWithPassword = async (attrs: {
//   email: string;
//   password: string;
// }) => {
//   const { data } = await client.auth.signInWithPassword(attrs);
//   return data;
// };
// export const requestPasswordReset = async (email: string) => {
//   const { data } = await client.auth.resetPasswordForEmail(email, {
//     redirectTo: "https://app.promptpro.tznc.net/app/#/reset-password",
//   });
//   return data;
// };

// export const updatePassword = async (password: string) => {
//   const { data } = await client.auth.updateUser({ password });
//   return data;
// };
