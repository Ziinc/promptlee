import { afterEach, beforeEach, describe, expect, test, it, vi } from "vitest";
import FlowActionsMenus from "../../src/interfaces/FlowActionsMenus"
import {render, screen} from '@testing-library/react'
// import * as React from 'react'
// import userEvent from '@testing-library/user-event'

beforeEach(() => {
  vi.resetAllMocks();
});

test("able to sign in", async ()=>{
    render(<FlowActionsMenus disabled={false} />)

});
