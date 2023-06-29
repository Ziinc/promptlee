import { test, expect, Mock } from "vitest";
import FlowEditor from "../src/pages/FlowEditor";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createFlow, getLatestFlowVersion } from "../src/api/flows";
import { flowFixture } from "./fixtures";

test("render flow editor", async () => {
  render(<FlowEditor params={{ id: undefined }} />);
  // actions menu
  await screen.findByText("File");
  await screen.findByText("Edit");
  await screen.findAllByText("Insert");
  await screen.findAllByText("Help");
});

test("can create a flow", async () => {
  (createFlow as Mock).mockImplementation((attrs) => ({
    data: flowFixture(attrs),
  }));
  render(<FlowEditor params={{ id: undefined }} />);
  const create = await screen.findByText("New blank flow");
  await userEvent.click(create);
  expect(createFlow).toBeCalled();
});
