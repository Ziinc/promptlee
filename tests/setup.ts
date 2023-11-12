import { expect, vi, afterEach, beforeEach } from "vitest";
import { cleanup } from "@testing-library/react";
import matchers from "@testing-library/jest-dom/matchers";

// extends Vitest's expect method with methods from react-testing-library
expect.extend(matchers);
vi.mock("../src/api/flows");
vi.mock("../src/api/auth");
vi.mock("../src/api/chat");
vi.mock("../src/api/credits");
vi.mock("../src/api/logs");

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated
    removeListener: vi.fn(), // Deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));
// @ts-ignore
global.navigator.clipboard = vi.fn()
global.navigator.clipboard.writeText = vi.fn().mockResolvedValue(null)

window.open = vi.fn();
beforeEach(()=>{
  vi.clearAllMocks()
})
afterEach(() => {
  cleanup();
});
