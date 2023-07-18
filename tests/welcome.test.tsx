import { beforeEach, test, vi, expect, Mock } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../src/App";
import { createFlow, getLatestFlowVersion, getLifetimePromptRunCount, listFlows } from "../src/api/flows";
import {
  getSession,
  onAuthStateChange,
  signInWithGoogle,
} from "../src/api/auth";
import { flowVersionFixture } from "./fixtures";

beforeEach(() => {
  vi.clearAllMocks();
  (listFlows as Mock).mockReturnValue({ data: [] });
  (getLifetimePromptRunCount as Mock).mockReturnValue({ data: { count: 0 } });
  (onAuthStateChange as Mock).mockReturnValue({
    subscription: { unsubscribe: () => null },
  });
  (getSession as Mock).mockReturnValue({ session: { user: { id: "123" } } });
  render(<App />);
});

test("show welcome message", async () => {
  expect(await screen.queryByText("Sign in with Google")).toBeNull();
  await screen.findByText(/PromptPro is a ChatGPT prompt manager/);
  await screen.findByText(/New blank flow/);
});

test("create flow from welcome", async () => {
  (createFlow as Mock).mockResolvedValue({data: {
    id: "123",
    name: "Untitled"
  }});
  (getLatestFlowVersion as Mock).mockResolvedValue({data: flowVersionFixture()});
  expect(await screen.queryByText("Sign in with Google")).toBeNull();
  const btn = await screen.findByText(/New blank flow/);
  await userEvent.click(btn);
  await waitFor(async ()=>{
    expect(window.open).not.toBeCalled()
    expect(createFlow).toBeCalled()
    expect(await screen.queryByText("PromptPro is a ChatGPT prompt manager")).toBeNull();
    expect(getLatestFlowVersion).toBeCalled()
  })
});
