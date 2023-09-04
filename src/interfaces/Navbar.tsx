import { FormControlLabel, FormGroup, Tooltip, Switch } from "@mui/material";
import { Container } from "@mui/system";
import { Moon, Sun } from "lucide-react";
import { signOut } from "../api/auth";
import { useAppState } from "../App";
import Button from "@mui/material/Button";
const Navbar = () => {
  const app = useAppState();

  return (
    <Container>
      <Button onClick={signOut}>Sign out</Button>
      <FormGroup>
        <FormControlLabel
          control={
            <Tooltip title={`${app.darkMode ? "Disable" : "Enable"} dark mode`}>
              <Switch
                checked={app.darkMode}
                onChange={(e) => {
                  app.putAppState("darkMode", e.target.checked);
                }}
              />
            </Tooltip>
          }
          label={
            app.darkMode ? (
              <Moon
                size={14}
                strokeWidth={3}
                style={{ verticalAlign: "middle" }}
              />
            ) : (
              <Sun
                size={14}
                strokeWidth={3}
                style={{ verticalAlign: "middle" }}
              />
            )
          }
        />
      </FormGroup>
    </Container>
  );
};

export default Navbar;
