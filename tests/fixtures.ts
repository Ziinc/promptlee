import { randomUUID } from "crypto";
import {
  ChatCompletionResponseMessage,
  CreateChatCompletionResponse,
} from "openai";
// import { Flow, FlowVersion } from "../src/api/flows";
// export const flowFixture = (attrs: Partial<Flow>): Flow => ({
//   id: randomUUID(),
//   created_at: new Date().toISOString(),
//   user_id: randomUUID(),
//   name: "some flow",
//   ...attrs,
// });

// export const flowVersionFixture = (
//   attrs: Partial<FlowVersion> = {}
// ): FlowVersion => ({
//   id: randomUUID(),
//   created_at: new Date().toISOString(),
//   flow_id: randomUUID(),
//   nodes: [],
//   edges: [],
//   ...attrs,
// });

export const chatResponseFixture = (
  response: string
): CreateChatCompletionResponse => {
  return {
    id: "some id",
    model: "chatgpt",
    choices: [{ message: { role: "user", content: response } }],
    object: "",
    created: new Date().getUTCMilliseconds(),
  };
};

interface LogEventAttrs {
  flow_id?: string
  builtin_id?: string
}
export const logEventFixture = (attrs:LogEventAttrs={}, prompt_input: string, response: string, params: Object ={}) => {
  const id = crypto.randomUUID()
  return {
    id,
    ...attrs,
    timestamp:   new Date().getUTCMilliseconds() * 1000,
    event_message: "prompt run successful",
    inputs: [{
      prompt: prompt_input,
      params_str: JSON.stringify(params)
    }],
    output: [{
      openai_response_str: JSON.stringify(chatResponseFixture(response))
    }]
  };
} 
