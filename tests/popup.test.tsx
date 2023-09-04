import { test, vi, expect, Mock } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Popup from "../src/extension/popup/Popup";
import { getCreditBalance } from "../src/api/credits";
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

  render(<Popup />);
  await screen.findByText(/94 credits remaining/);
  const btn = await screen.findByText(/Manage/);
  expect(getCreditBalance).toBeCalledTimes(1);
  await userEvent.click(btn);
  //   open options page
  expect(window.open).toBeCalledTimes(1);
});
