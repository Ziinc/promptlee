import { randomUUID } from "crypto";
import { Flow, FlowVersion } from "../src/api/flows";
export const flowFixture = (attrs: Partial<Flow>): Flow => ({
  id: randomUUID(),
  created_at: new Date().toISOString(),
  user_id: randomUUID(),
  name: "some flow",
  ...attrs,
});

export const flowVersionFixture = (
  attrs: Partial<FlowVersion> = {}
): FlowVersion => ({
  id: randomUUID(),
  created_at: new Date().toISOString(),
  flow_id: randomUUID(),
  nodes: [],
  edges: [],
  ...attrs,
});
