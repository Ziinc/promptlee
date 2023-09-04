import { beforeEach, test, vi, expect, Mock } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App, { AuthedApp } from "../src/App";
// import { getLifetimePromptRunCount, listFlows } from "../src/api/flows";
import {
  getSession,
  onAuthStateChange,
  signInWithGoogle,
} from "../src/api/auth";

beforeEach(() => {
  vi.clearAllMocks();
  (onAuthStateChange as Mock).mockReturnValue({
    subscription: { unsubscribe: () => null },
  });
  (getSession as Mock).mockResolvedValue({ session: { user: { id: "123" } } });
});
test("can toggle dark mode", async () => {
  render(<App />);
  await userEvent.click(await screen.findByLabelText("Enable dark mode"));
  await userEvent.click(await screen.findByLabelText("Disable dark mode"));
});
