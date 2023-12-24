import { Container } from "@mui/system";
import Typography from "@mui/material/Typography";
import { useAppState } from "./App";
import { useEffect } from "react";
import { signOut } from "./api/auth";

const SignOut: React.FC<{}> = () => {

  useEffect(() => {
    signOut();
  }, []);
  return (
    <Container>
      <Typography variant="subtitle2">Signing out...</Typography>
      <Typography variant="body1">Signing you out...</Typography>
    </Container>
  );
};
export default SignOut;
