import { test } from "vitest";
import FlowEditor from "../src/pages/FlowEditor";
import { render, screen } from "@testing-library/react";

test("render flow editor", async () => {
  render(<FlowEditor params={{ id: undefined }} />);
  // actions menu
  await screen.findByText("File");
  await screen.findByText("Edit");
  await screen.findAllByText("Insert");
  await screen.findAllByText("Help");
});
