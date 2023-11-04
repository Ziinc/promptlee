import { test, expect, Mock, vi, beforeEach } from "vitest";
import { render, screen } from "./test-utils";
import userEvent from "@testing-library/user-event";
import App from "../src/App";
import { listRunLogs } from "../src/api/logs";
import {logEventFixture} from "./fixtures"
beforeEach(() => {
  vi.clearAllMocks();
  // (listFlows as Mock).mockReturnValue({ data: [] });
  // (getLifetimePromptRunCount as Mock).mockReturnValue({ data: { count: 0 } });
});

test("fetch and display logs", async () => {

  (listRunLogs as Mock).mockResolvedValue({
    data: [
      logEventFixture({builtin_id: "summarize"}, "some prompt input", "some prompt response")
    ],
  });
  render(<App />);
  const btn = await screen.findByText(/View logs/);
  expect(listRunLogs).toBeCalledTimes(0);
  // view history
  await userEvent.click(btn);
  await screen.findByText(/Run logs/);
  const input = await screen.findByText(/some prompt input/);
  await userEvent.click(input)
  await screen.findByText(/some prompt response/);

  expect(listRunLogs).toBeCalled();
});

