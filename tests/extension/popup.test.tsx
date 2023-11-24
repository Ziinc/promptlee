import { beforeEach, test, vi, expect, Mock } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Popup from "../../src/extension/popup/Popup";
// import { getLifetimePromptRunCount, listFlows } from "../src/api/flows";
// import {
//   getSession,
//   onAuthStateChange,
//   signInWithGoogle,
// } from "../../src/api/auth";
// import useResponsiveObserver from "antd/es/_util/responsiveObserver";

beforeEach(() => {
  vi.clearAllMocks();
  // (listFlows as Mock).mockReturnValue({ data: [] });
  // (getLifetimePromptRunCount as Mock).mockReturnValue({ data: { count: 0 } });
//   (onAuthStateChange as Mock).mockReturnValue({
//     subscription: { unsubscribe: () => null },
//   });
});

test("can navigate to app", async () => {

  render(<Popup />);
   await screen.findByTitle("Go to the Promptlee app");

});

