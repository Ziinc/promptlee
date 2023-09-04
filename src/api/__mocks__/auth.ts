import { vi } from "vitest";
export const signOut = vi.fn();
export const getUserId = vi.fn().mockResolvedValue("123");
export const getSession = vi
  .fn()
  .mockResolvedValue({ session: { user: { id: "123" } } });
export const checkAuthed = vi.fn();
export const signInWithGoogle = vi.fn();
export const onAuthStateChange = vi.fn().mockReturnValue({
  subscription: { unsubscribe: () => null },
});
