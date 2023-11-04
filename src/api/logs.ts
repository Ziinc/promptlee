import { supabase } from "../utils";
import isEmpty from "lodash/isEmpty"
export interface LogEvent {
  id: string
  flow_id?: string
  builtin_id?: string
  inputs: [{
    params_str: string
    prompt: string
  }],
  output: [{
    openai_response_str: string
  }]
}
interface Filter{
  builtin_id?: string
  flow_id?: string
}
export const listRunLogs = async (filter) => {
  // if (!filter.builtin_id &&  !filter.flow_id){
  //   throw new Error("listRunLogs filter cannot be empty")
  // } 
  return await supabase.functions.invoke<LogEvent[]>(
    "list-run-logs",
    {
      method: "POST",
      body: filter,
      
    }
  );

};
