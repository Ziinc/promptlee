import { useState } from "react";

import Box from "@mui/material/Box";
import List from "@mui/material/List";
import { Container } from "@mui/system";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";

import { DEFAULT_PROMPTS } from "./constants";
import Navbar from "./interfaces/Navbar";
import { extractParametersFromText, resolveTextParams } from "./utils";
import { getPromptOutput } from "./api/chat";
import PromptResult from "./interfaces/PromptResult";
import { ChatCompletionResponseMessage, CreateChatCompletionResponse } from "openai";

const Home: React.FC<{}> = () => {
  const [selected, setSelected] = useState(0);
  const [testParams, setTestParams] = useState({});
  const [runResult, setRunResult] = useState<CreateChatCompletionResponse | null>(null);
  const selectedPrompt = DEFAULT_PROMPTS[selected];
  const parsedParameters = extractParametersFromText(
    selectedPrompt.prompt_text
  );
  const resolvedPromptText = resolveTextParams(
    selectedPrompt.prompt_text,
    testParams
  );

  const handleRunFlow = async () => {
    const inputText = resolveTextParams(selectedPrompt.prompt_text, testParams);
    const { data, error } = await getPromptOutput(inputText);
    if (error) {
      console.error(error);
      return;
    }
    setRunResult(data);
  };
  return (
    <Container>
      <Navbar />
      <p>PromptPro is a ChatGPT prompt manager</p>

      <List>
        {DEFAULT_PROMPTS.map((prompt, idx) => (
          <ListItem disablePadding key={prompt.title}>
            <ListItemButton onClick={() => setSelected(idx)}>
              <ListItemText primary={prompt.title} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Box>
        <h3>{selectedPrompt.title}</h3>
        <Typography variant="body1" gutterBottom>
          {resolvedPromptText}
        </Typography>
        {parsedParameters.map((param) => (
          <TextField
            key={param}
            label={"@" + param}
            multiline
            maxRows={2}
            variant="filled"
            onChange={(e) => {
              setTestParams((prev) => ({
                ...prev,
                [param]: e.target.value,
              }));
            }}
          />
        ))}
        <Button variant="contained" onClick={handleRunFlow}>
          Run flow
        </Button>

        {runResult && <PromptResult result={runResult} />}
      </Box>
    </Container>
  );
};
export default Home;
