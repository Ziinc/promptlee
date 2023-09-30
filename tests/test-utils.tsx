import React from "react";
import { render, RenderOptions } from "@testing-library/react";
import { SWRConfig } from "swr";

const AllTheProviders = ({ children }) => {
  return (
    <SWRConfig value={{ provider: () => new Map() }}>{children}</SWRConfig>
  );
};

// https://testing-library.com/docs/react-testing-library/setup#custom-render
const customRender = (ui, options?: RenderOptions) =>
  render(ui, { wrapper: AllTheProviders, ...options });

// re-export everything
export * from "@testing-library/react";

// override render method
export { customRender as render };
