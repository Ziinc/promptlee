import { Database } from "./database.types";
import { createClient } from "@supabase/supabase-js";
// Create a single supabase client for interacting with your database
export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
);

export const isSystemDarkMode = () => {
  return (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
};



/**
 * Example usage
 * > extractParametersFromText("some @test")
 * ["test"]
 */
export const extractParametersFromText = (text: string) : string[] => {
  const promptParams = [...text.matchAll(/\s\@(\S+)\s?/g)];
  const params = promptParams.flatMap(([_match, paramName]) => paramName);

  return [...new Set(params)];
};



/**
 * Resolves a prompt's parameters with a params object
 * 
 * Example usage
 * > resolveTextParams("some @test", {test: "123"})
 * "some 123"
 */
export const resolveTextParams = (
  text: string,
  params: Record<string, string>
):string => {
  let replaced = text;

  for (const [key, value] of Object.entries(params)) {
    replaced = replaced.replaceAll(`@${key}`, value);
  }

  return replaced;
};