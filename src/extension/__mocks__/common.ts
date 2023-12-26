import { User } from "@supabase/supabase-js";
import { vi } from "vitest";
export const getCurrentUser = vi.fn().mockResolvedValue({
  user: {
    id: "some-uuid",
    email: "some-email@example.com",
  } as User,
  accessToken: "some-token",
});
export const onSignInComplete = vi.fn().mockImplementation((cb) => cb());
export const openGoogleSignInTab = vi.fn();
