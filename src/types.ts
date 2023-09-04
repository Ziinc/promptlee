import { Session, User } from "@supabase/gotrue-js";

// https://stackoverflow.com/questions/61132262/typescript-deep-partial
export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

export interface AppState {
  user: User | null;
  session: Session | null;
  darkMode: boolean;
}
export interface AppContextValue extends AppState {
  setAppState: React.Dispatch<AppState | ((prev: AppState) => AppState)>;
  mergeAppState: (tomerge: Partial<AppState>) => void;
  toggleDarkMode: (checked: boolean) => void;
  putAppState: (key: keyof AppState,  value: any) => void;
}
