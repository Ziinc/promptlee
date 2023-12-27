import { Container } from "@mui/system";
import Typography from "@mui/material/Typography";
import { useAppState } from "./App";
import { useEffect } from "react";
import { signOut } from "./api/auth";
import { useLocation } from "wouter";

const SignOut: React.FC<{}> = () => {
  const [_location, setLocation] = useLocation();
  useEffect(() => {
    handleSignOut();
  }, []);
  const handleSignOut = async () => {
    signOut();
    // navigate away to prevent signout loop
    setLocation("/");
  };
  return (
    <Container>
      <Typography variant="subtitle2">Signing out...</Typography>
      <Typography variant="body1">Signing you out...</Typography>
    </Container>
  );
};
export default SignOut;
