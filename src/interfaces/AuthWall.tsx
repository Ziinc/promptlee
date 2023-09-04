import { useEffect, useState } from "react";
import { getSession, onAuthStateChange, signInWithGoogle } from "../api/auth";
import { useAppState } from "../App";

import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";

const AuthWall = () => {
  const [authCheck, setAuthCheck] = useState(false);
  const [signedOut, setSignedOut] = useState(false);
  const app = useAppState();

  async function getSupabaseSession() {
    const { session } = await getSession();
    setAuthCheck(true);
    if (session) {
      app.mergeAppState({ session, user: session.user ?? null });
      setAuthCheck(false);
    }
  }

  useEffect(() => {
  getSupabaseSession();

    const { subscription } = onAuthStateChange(async (event, session) => {
      if (event == "SIGNED_OUT") {
        setSignedOut(true);
      }
      if (session) {
        app.mergeAppState({ session, user: session.user ?? null });
      } else {
        app.mergeAppState({ session: null, user: null });
        setAuthCheck(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <>
      <Snackbar
        open={signedOut}
        autoHideDuration={3000}
        onClose={() => setSignedOut(false)}
        message="Signed out successfully"
      />
      <Dialog open={authCheck && !app.session} disableEscapeKeyDown>
        <DialogContent>
          <div>
            <div>
              <img src="/branding/icon-only.png" />
              <DialogTitle>Sign into PromptPro</DialogTitle>
              <DialogContentText>
                All new users will have <strong>5 flows</strong> and{" "}
                <strong>100 runs</strong> for <strong>free</strong>
              </DialogContentText>
            </div>
          </div>
          <DialogActions>
            <Button
              variant="outlined"
              color="secondary"
              onClick={signInWithGoogle}
              startIcon={<GoogleIcon width={16} />}
            >
              Sign in with Google
            </Button>
          </DialogActions>
        </DialogContent>
      </Dialog>
    </>
  );
};

const GoogleIcon = ({ width = 16 }: { width: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={width}
    height={width}
    fill="currentColor"
    className="bi bi-google"
    viewBox="0 0 16 16"
  >
    <path d="M15.545 6.558a9.42 9.42 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.689 7.689 0 0 1 5.352 2.082l-2.284 2.284A4.347 4.347 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.792 4.792 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.702 3.702 0 0 0 1.599-2.431H8v-3.08h7.545z" />
  </svg>
);

export default AuthWall;
