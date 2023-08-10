import { beforeEach, test, vi, expect, Mock } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../src/App";
// import { getLifetimePromptRunCount, listFlows } from "../src/api/flows";
import {
  getSession,
  onAuthStateChange,
  signInWithGoogle,
} from "../src/api/auth";

beforeEach(() => {
  vi.clearAllMocks();
  // (listFlows as Mock).mockReturnValue({ data: [] });
  // (getLifetimePromptRunCount as Mock).mockReturnValue({ data: { count: 0 } });
  (onAuthStateChange as Mock).mockReturnValue({
    subscription: { unsubscribe: () => null },
  });
});

test("unauthed - render AuthWall", async () => {
  (getSession as Mock).mockReturnValue({ session: null });
  // (getSession as Mock).mockReturnValue({ session: { user: { id: "123" } } });

  render(<App />);
  // show the AuthWall
  const btn = await screen.findByText("Sign in with Google");

  expect(getSession).toBeCalled();
  expect(onAuthStateChange).toBeCalled();

  await userEvent.click(btn);
  expect(signInWithGoogle).toBeCalled();
});

test("authed - do not render AuthWall", async () => {
  (getSession as Mock).mockReturnValue({ session: { user: { id: "123" } } });
  render(<App />);
  expect(await screen.queryByText("Sign in with Google")).toBeNull();
  await screen.findByText(/PromptPro is a ChatGPT prompt manager/);
});

test("authed - can sign out", async () => {
  (getSession as Mock).mockReturnValue({ session: { user: { id: "123" } } });
  render(<App />);
  const btn = await screen.findByText("Sign out");
  await userEvent.click(btn);
  // simulate sign out subscription callback
  const callback = (onAuthStateChange as Mock).mock.calls[0][0];
  await callback("SIGNED_OUT", null);
  await screen.findByText("Signed out successfully");
  await screen.findByText("Sign in with Google");
});
