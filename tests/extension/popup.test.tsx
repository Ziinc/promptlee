import { beforeEach, test, vi, Mock, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Popup from "../../src/extension/popup/Popup";
import {
  getCurrentUser,
  openGoogleSignInTab,
} from "../../src/extension/common";
import { User } from "@supabase/gotrue-js";
import userEvent from "@testing-library/user-event";
import { signInWithGoogle } from "../../src/api/auth";

beforeEach(() => {
  vi.clearAllMocks();
});
test("can navigate to app", async () => {
  render(<Popup />);
  await screen.findByTitle("Go to the Promptlee app");
  await screen.findByText("App");
});

test("prompted to sign in", async () => {
  (signInWithGoogle as Mock).mockResolvedValue({
    data: { url: "some-url" },
    error: null,
  });
  (getCurrentUser as Mock).mockResolvedValue(null);
  render(<Popup />);
  const btn = await screen.findByText("Sign in");
  await userEvent.click(btn);
  expect(signInWithGoogle).toBeCalledTimes(1);
  expect(openGoogleSignInTab).toBeCalledTimes(1);
});

test("display user email", async () => {
  (getCurrentUser as Mock).mockResolvedValue({
    user: {
      id: "some-uuid",
      email: "some-other@example.com",
    } as User,
    accessToken: "some-token",
  });
  render(<Popup />);
  expect(getCurrentUser).toBeCalled();
  await screen.findByText(/some\-other@example\.com/);
});
