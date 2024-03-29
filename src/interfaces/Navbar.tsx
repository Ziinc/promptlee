import { FormControlLabel, FormGroup, Tooltip, Switch } from "@mui/material";
import { Box, Container } from "@mui/system";
import { LogOut, Moon, Sun } from "lucide-react";
import { signOut } from "../api/auth";
import { useAppState } from "../App";

import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";

const Navbar = () => {
  const app = useAppState();

  return (
    <Container sx={{ pt: 1 }}>
      <Stack
        direction="row"
        justifyContent="between"
        alignItems="center"
        sx={{}}
      >
          <img style={{width: "46px"}} src={"/branding/icon-only.svg"}/>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="end"
          flexGrow={1}
        >
          <FormGroup>
            <FormControlLabel
              control={
                <Tooltip
                  title={`${app.darkMode ? "Disable" : "Enable"} dark mode`}
                >
                  <Switch
                    checked={app.darkMode}
                    onChange={(e) => {
                      app.putAppState("darkMode", e.target.checked);
                    }}
                    size="small"
                  />
                </Tooltip>
              }
              label={
                app.darkMode ? (
                  <Moon size={14} style={{ verticalAlign: "middle" }} />
                ) : (
                  <Sun size={14} style={{ verticalAlign: "middle" }} />
                )
              }
            />
          </FormGroup>
          <Button
            startIcon={<LogOut size={14} />}
            variant="outlined"
            onClick={signOut}
          >
            Sign out
          </Button>
        </Stack>
      </Stack>
    </Container>
  );
};

export default Navbar;
