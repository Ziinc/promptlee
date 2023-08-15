import { beforeEach, test, vi, expect, Mock } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Widget from "../src/extension/widget/Widget";
import { chatResponseFixture } from "./fixtures";

beforeEach(() => {
  vi.clearAllMocks();
});

test("can copy text to clipboard", async () => {
  render(<Widget result={chatResponseFixture("some result")} />);

  await screen.findByText("some result");
  await userEvent.click(await screen.findByText("Copy"));
  await screen.findByText("Copied to clipboard");
});

test("can close the widget", async ()=>{
  const callback = vi.fn()
  render(<Widget result={chatResponseFixture("some result")} onClose={callback} />);

  await userEvent.click(await screen.findByText("Close"));
  expect(callback).toBeCalled()

})