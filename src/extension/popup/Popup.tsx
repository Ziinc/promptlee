import { useEffect, useMemo, useState } from "react";
import { isSystemDarkMode } from "./../../utils";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { darkTheme, lightTheme } from "./../../theme";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { signInWithGoogle } from "../../api/auth";
import { User } from "@supabase/supabase-js";
import { Stack } from "@mui/material";
import {
  getCurrentUser,
  onSignInComplete,
  openGoogleSignInTab,
} from "../common";

const Popup = () => {
  const muiTheme = useMemo(
    () => (isSystemDarkMode() ? darkTheme : lightTheme),
    []
  );
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    onSignInComplete(handleUser);
    handleUser();
  }, []);

  const handleUser = async () => {
    const response = await getCurrentUser();
    if (response?.user) {
      setUser(response.user);
    } else {
      setUser(null);
    }
  };

  const handleSignIn = async () => {
    const { data, error } = await signInWithGoogle({
      skipBrowserRedirect: true,
      queryParams: {
        sign_in_method: "ext",
      },
    });
    if (error) {
      console.error("sign in error", error);
    }
    if (data.url) {
      await openGoogleSignInTab(data.url);
      window.close();
    }
  };

  const handleSignOut = async () => {
    await browser.runtime.sendMessage({
      action: "signOut",
    });
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
              <>
                <Typography fontSize={"0.8rem"}>{user.email}</Typography>
                <Button onClick={handleSignOut} title="Go to the Promptlee app">
                  Sign out
                </Button>
              </>
            )}
          </Stack>
        </Paper>
      </ThemeProvider>
    </main>
  );
};
export default Popup;
