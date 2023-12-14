import { useEffect, useMemo, useState } from "react";
import { isSystemDarkMode } from "./../../utils";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { darkTheme, lightTheme } from "./../../theme";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { signInWithGoogle } from "../../api/auth";
import browser from "webextension-polyfill";
import { User } from "@supabase/supabase-js";
import { Stack } from "@mui/material";

export function Popup() {
  const muiTheme = useMemo(
    () => (isSystemDarkMode() ? darkTheme : lightTheme),
    []
  );
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action !== "signInComplete") return;
      handleUser();
    });
    handleUser();
  }, []);

  const handleUser = async () => {
    const user = await getUser();
    setUser(user);
  };
  const getUser = async () => {
    const response = await browser.runtime.sendMessage({
      action: "getUser",
    });
    if (!response?.user) {
      return;
    }
    return response?.user;
  };

  const handleSignIn = async () => {
    const { data, error } = await signInWithGoogle({
      skipBrowserRedirect: true,
      queryParams: {
        sign_in_method: "ext",
      },
    });
    console.log({ data });
    if (error) {
      console.error("sign in error", error);
    }
    console.log("Sending user to Google Auth page", data.url);

    // tell background service worker to create a new tab with that url
    await browser.runtime.sendMessage({
      action: "signInWithGoogle",
      payload: { url: data.url }, // url is something like: https://[project_id].supabase.co/auth/v1/authorize?provider=google
    });
    window.close();
  };

  return (
    <main>
      <CssBaseline />
      <ThemeProvider theme={muiTheme}>
        <Paper
          elevation={0}
          sx={{
            minWidth: "100%",
            borderRadius: 0,
            minHeight: "100%",
          }}
        >
          <Stack direction="row" alignItems="center">
            <Button
              href={import.meta.env.VITE_APP_URL}
              title="Go to the Promptlee app"
            >
              App
            </Button>
            {!user ? (
              <Button onClick={handleSignIn}>Sign in</Button>
            ) : (
              <Typography fontSize={"0.8rem"}>{user.email}</Typography>
            )}
          </Stack>
        </Paper>
      </ThemeProvider>
    </main>
  );
}
export default Popup;
