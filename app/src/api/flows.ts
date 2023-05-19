import { Database, Json } from "../database.types";
import { supabase } from "../utils";
import { getUserId } from "./auth";
export type Flow = Database["public"]["Tables"]["flows"]["Row"];
export type FlowVersion = Omit<
  Database["public"]["Tables"]["flow_versions"]["Row"],
  "nodes" | "edges"
> & {
  nodes: (
    {
        id: string;
        prompt_text: string;
        rf_meta?: {
          position: {
            x: number;
            y: number;
          };
        };
      }
  )[];
  edges: (
     {
        id: string;
        from_node_id: string | null; // null for start
        to_node_id: string | null; // null for end
        to_input: string; // input key, without @
      }
  )[];
};

export const createFlow = async (
  attrs: Partial<Database["public"]["Tables"]["flows"]["Row"]> = {}
) => {
  const user_id = await getUserId();

  if (!user_id) {
    throw new Error("User is not logged in");
  }
  return await supabase
    .from("flows")
    .insert([{ ...attrs, user_id }])
    .select()
    .limit(1)
    .single();
};

export const updateFlow = async (
  id: string,
  attrs: Partial<Database["public"]["Tables"]["flows"]["Row"]> = {}
) => {
  const user_id = await getUserId();

  if (!user_id) {
    throw new Error("User is not logged in");
  }
  return await supabase
    .from("flows")
    .update(attrs)
    .eq("id", id)
    .select()
    .single();
};
export const listFlows = async () => {
  return await supabase.from("flows").select();
};

export const getLifetimePromptRunCount = async () => {
  const user_id = await getUserId();

  return await supabase
    .from("lifetime_prompt_runs")
    .select()
    .eq("user_id", user_id)
    .single();
};

export const getLatestFlowVersion = async (flow_id: string) => {
  return await supabase
    .from("flow_versions")
    .select()
    .eq("flow_id", flow_id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
};

export const createFlowVersion = async (
  flow_id: string,
  version: Partial<FlowVersion>
) => {
  // drop keys
  delete version["id"]
  delete version["created_at"]

  return await supabase
    .from("flow_versions")
    .insert([{ ...version, flow_id }])
    .select()
    .single();
};
