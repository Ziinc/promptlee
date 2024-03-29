import { beforeEach, test, vi, expect, Mock } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../src/App";
import { getPromptOutput } from "../src/api/chat";
import { getSession, onAuthStateChange } from "../src/api/auth";
import { getCreditBalance, listCreditHistory } from "../src/api/credits";

beforeEach(() => {
  vi.clearAllMocks();
  (onAuthStateChange as Mock).mockReturnValue({
    subscription: { unsubscribe: () => null },
  });

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

  (getSession as Mock).mockResolvedValue({ session: { user: { id: "123" } } });
});

test("can execute text input default flows", async () => {
  (getPromptOutput as Mock).mockResolvedValue({
    data: {
      choices: [{ message: { content: "some result" } }],
    },
  });
  render(<App />);
  await screen.findByText(/Built-in flows/);

  await screen.findByText(/Summarize the following text/);
  const summarize = await screen.findByText(/Summarize/, {
    selector: "ul  *",
  });
  await userEvent.click(summarize);
  const input = await screen.findByLabelText("@text");
  const runBtn = await screen.findByText("Run flow", { selector: "button" });
  await userEvent.type(input, "Once upon a time, there was some text");

  await userEvent.click(runBtn);
  expect(getPromptOutput).toBeCalled();
  await screen.findByText("some result");
});

test.todo("can execute text formatting flows");
