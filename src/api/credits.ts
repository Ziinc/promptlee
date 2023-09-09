import { Database } from "../database.types";
import { supabase } from "../utils";
import { getUserId } from "./auth";

export type DailyCreditHistoryRow =
  Database["public"]["Views"]["daily_credit_history"]["Row"];
  
export const listCreditHistory = async () => {
  const user_id = await getUserId();

  return await supabase
    .from("daily_credit_history")
    .select()
    .eq("user_id", user_id);
};

export const getCreditBalance = async () => {
  const user_id = await getUserId();

  return await supabase
    .from("credit_history")
    .select()
    .eq("user_id", user_id)
    .limit(1)
    .single();
};
