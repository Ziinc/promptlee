import dayjs from "dayjs";
import { Database } from "../database.types";
import { supabase } from "../utils";
import { getUserId } from "./auth";

export type DailyCreditHistoryRow =
  Database["public"]["Views"]["daily_credit_history"]["Row"];

export const listCreditHistory = async (isoStartDate: string, isoEndDate?: string) => {
  const user_id = await getUserId();

  let query = supabase
    .from("daily_credit_history")
    .select()
    .gte('date', isoStartDate)
    .eq("user_id", user_id);
  if (isoEndDate) {
    query = query.lte('date', isoEndDate ? isoEndDate : true)
  }

  return await query.limit(40);
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
