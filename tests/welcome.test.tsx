import { beforeEach, test, vi, expect, Mock } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../src/App";
import {
  createFlow,
  getLatestFlowVersion,
  getLifetimePromptRunCount,
  listFlows,
} from "../src/api/flows";
import {
  getSession,
  onAuthStateChange,
} from "../src/api/auth";
import { flowFixture, flowVersionFixture } from "./fixtures";

beforeEach(() => {
  vi.clearAllMocks();
  (listFlows as Mock).mockResolvedValue({ data: [] });
  (getLifetimePromptRunCount as Mock).mockResolvedValue({ data: { count: 0 } });
  (onAuthStateChange as Mock).mockReturnValue({
    subscription: { unsubscribe: () => null },
  });
  (getSession as Mock).mockResolvedValue({ session: { user: { id: "123" } } });
});

test("show welcome message", async () => {
  render(<App />);
  expect(await screen.queryByText("Sign in with Google")).toBeNull();
  await screen.findByText(/PromptPro is a ChatGPT prompt manager/);
  await screen.findByText(/New blank flow/);
});

test("create flow from welcome", async () => {
  (createFlow as Mock).mockResolvedValue({
    data: {
      id: "123",
      name: "Untitled",
    },
  });
  (getLatestFlowVersion as Mock).mockResolvedValue({
    data: flowVersionFixture(),
  });
  render(<App />);
  expect(await screen.queryByText("Sign in with Google")).toBeNull();
  const btn = await screen.findByText(/New blank flow/);
  await userEvent.click(btn);
  await waitFor(async () => {
    expect(window.open).not.toBeCalled();
    expect(createFlow).toBeCalled();
    expect(
      await screen.queryByText("PromptPro is a ChatGPT prompt manager")
    ).toBeNull();
    expect(getLatestFlowVersion).toBeCalled();
  });
});
test("open flow from welcome message", async () => {
  (listFlows as Mock).mockResolvedValue({
    data: [flowFixture({ name: "my-flow" })],
  });
  (getLatestFlowVersion as Mock).mockResolvedValue({
    data: flowVersionFixture(),
  });
  expect(await screen.queryByText("Sign in with Google")).toBeNull();
  render(<App />);
  const btn = await screen.findByText(/my\-flow/);
  await userEvent.click(btn);
  await waitFor(async () => {
    // open in same tab
    expect(window.open).not.toBeCalled();
    expect(getLatestFlowVersion).toBeCalled();
    await screen.findByDisplayValue(/my\-flow/);
  });
});
