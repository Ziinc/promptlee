import { PostgrestSingleResponse } from "@supabase/postgrest-js";
import { cloneDeep, merge, pick } from "lodash";
import { CreateChatCompletionResponse } from "openai";
import { Database, Json } from "../database.types";
import { supabase } from "../utils";
import { getUserId } from "./auth";
export type Flow = Database["public"]["Tables"]["flows"]["Row"];
export type FlowVersion = Omit<
  Database["public"]["Tables"]["flow_versions"]["Row"],
  "nodes" | "edges"
> & {
  nodes: {
    id: string;
    prompt_text: string;
    rf_meta?: {
      position: {
        x: number;
        y: number;
      };
    };
  }[];
  edges: {
    id: string;
    from_node_id: string | null; // null for start
    to_node_id: string | null; // null for end
    to_input: string; // input key, without @
  }[];
};

export type FlowRun = Omit<
  Database["public"]["Tables"]["flow_runs"]["Row"],
  "inputs" | "outputs"
> & {
  // status: ("started" | "running" | "complete" | "error") & string;
  inputs: {
    parameters: Record<string, string>;
  } & Json;
  outputs: {
    nodeResponses: Record<string, CreateChatCompletionResponse>;
    nodeErrors: Record<string, string[]>;
    flowError: string | null;
  } & Json;
};

// export interface FlowRun {
//   id: string;
//   flow_version_id: string;
//   status: "started" | "running" | "complete" | "error";
//   inputs: {
//     parameters: Record<string, string>;
//   };
//   outputs: {
//     nodeResponses: {
//       [node_id: string]: CreateChatCompletionResponse;
//     };
//     nodeErrors: {
//       [node_id: string]: string[];
//     };
//     flowError: string | null;
//   };
//   started_at: string;
//   stopped_at: string | null;
// }

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
  delete version["id"];
  delete version["created_at"];

  return await supabase
    .from("flow_versions")
    .insert([{ ...version, flow_id }])
    .select()
    .single();
};

export const createFlowRun = async (
  flowVersion: FlowVersion,
  params: FlowRun["inputs"]["parameters"] = {}
): Promise<PostgrestSingleResponse<FlowRun>> => {
  const payload = {
    flow_id: flowVersion.flow_id,
    flow_version_id: flowVersion.id,
    inputs: {
      parameters: params,
    },
    status: "started",
    outputs: {
      nodeResponses: {},
      nodeErrors: {},
      flowError: null,
    },
  };
  console.log("payload", payload);
  return await supabase.from("flow_runs").insert([payload]).select().single();
};

export const updateFlowRun = async (
  flowRun: FlowRun,
  attrs: Partial<FlowRun>
): Promise<PostgrestSingleResponse<FlowRun>> => {
  const merged: Partial<FlowRun> = merge(cloneDeep(flowRun), attrs);

  const updateAttrs = pick(merged, ["inputs", "outputs", "status"]);

  console.log("update merged", merged, flowRun);
  const user_id = await getUserId();

  if (!user_id) {
    throw new Error("User is not logged in");
  }
  return await supabase
    .from("flow_runs")
    .update(updateAttrs)
    .eq("id", flowRun.id)
    .select()
    .single();
};
