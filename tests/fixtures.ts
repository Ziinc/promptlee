import { randomUUID } from "crypto";
import { Flow } from "../src/api/flows";
export const flowFixture = (attrs: Partial<Flow>): Flow => ({
  id: randomUUID(),
  created_at: new Date().toISOString(),
  user_id: randomUUID(),
  name: "some flow",
  ...attrs,
});
