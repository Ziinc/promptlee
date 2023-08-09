import { beforeEach, test, vi, expect, Mock } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../src/App";
// import { getLifetimePromptRunCount, listFlows } from "../src/api/flows";
import {
  getSession,
  onAuthStateChange,
  signInWithGoogle,
} from "../src/api/auth";

test.todo("can view default flows")
test.todo("can execute text input default flows")
test.todo("can execute text formatting flows")