import { test, expect, Mock, vi, beforeEach } from "vitest";
import { render, screen } from "./test-utils";
import userEvent from "@testing-library/user-event";
import App from "../src/App";
import { getCreditBalance, listCreditHistory } from "../src/api/credits";

beforeEach(() => {
  vi.clearAllMocks();
  // (listFlows as Mock).mockReturnValue({ data: [] });
  // (getLifetimePromptRunCount as Mock).mockReturnValue({ data: { count: 0 } });
});

test("fetch and display credit balance", async () => {
  (getCreditBalance as Mock).mockResolvedValue({
    data: {
      created_at: new Date().toISOString(),
      value: 100,
      free: true,
      balance: 94,
      user_id: "123",
      total_debit: 123,
      total_credit: 27,
    },
  });

  (listCreditHistory as Mock).mockResolvedValue({
    data: [
      {
        created_at: new Date().toISOString(),
        value: 100,
        free: true,
        balance: 94,
        user_id: "123",
        consumed: 554,
        added: 333,
      },
    ],
  });
  render(<App />);
  await screen.findByText(/Last 30 days/);
  await screen.findByText(/94 credits/);
  const history = await screen.findByText(/View history/);
  expect(getCreditBalance).toBeCalledTimes(1);
  // view history
  await userEvent.click(history);
  await screen.findByText(/30 Day Credit History/);
  await screen.findByText(/Consumed/);
  await screen.findByText(/Added/);
  await screen.findByText(/Balance/);
  await screen.findByText(/554/);
  await screen.findByText(/333/);

  expect(listCreditHistory).toBeCalledTimes(1);
});

test("Open pricing dropdown via credits display ", async () => {
  (getCreditBalance as Mock).mockResolvedValue({
    data: {
      created_at: new Date().toISOString(),
      value: 100,
      free: true,
      balance: 94,
      user_id: "123",
      total_debit: 123,
      total_credit: 27,
    },
  });

  render(<App />);
  await screen.findByText(/Last 30 days/);
  const credits = await screen.findByText(/94 credits/);
  await userEvent.click(credits);
  await screen.findByText(/100 Credits for \$5/);
});
test("Open pricing dropdown via Buy more ", async () => {
  (getCreditBalance as Mock).mockResolvedValue({
    data: {
      created_at: new Date().toISOString(),
      balance: 0,
      user_id: "123",
      total_debit: 123,
      total_credit: 27,
    },
  });

  (listCreditHistory as Mock).mockResolvedValue({
    data: [
      {
        created_at: new Date().toISOString(),
        value: 100,
        free: true,
        balance: 0,
        user_id: "123",
        consumed: 554,
        added: 333,
      },
    ],
  });

  render(<App />);
  await screen.findByText(/0 credits/);
  const credits = await screen.findByText(/Buy more/, { selector: "button" });
  await userEvent.click(credits);
  await screen.findByText(/100 Credits for \$5/);
});
