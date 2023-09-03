import { test, vi, expect, Mock } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../src/App";
import { getCreditBalance, listCreditHistory } from "../src/api/credits";
vi.mock("../src/api/auth");

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
    data: [{
      created_at: new Date().toISOString(),
      value: 100,
      free: true,
      balance: 94,
      user_id: "123",
      consumed: 554,
      added: 333,
    }],
  });
  render(<App />);
  await screen.findByText(/94 credits remaining/);
  const history = await screen.findByText(/View usage/);
  expect(getCreditBalance).toBeCalledTimes(1);
  // view history
  await userEvent.click(history);
  await screen.findByText(/Consumed/);
  await screen.findByText(/Added/);
  await screen.findByText(/Balance/);
  await screen.findByText(/Last 30 Days/);
  await screen.findByText(/554/);
  await screen.findByText(/333/);

  expect(listCreditHistory).toBeCalledTimes(1);
});
