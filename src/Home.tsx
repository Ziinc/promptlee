import { useEffect, useState } from "react";

import Box from "@mui/material/Box";
import List from "@mui/material/List";
import { Container } from "@mui/system";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Skeleton from "@mui/material/Skeleton";
import Button from "@mui/material/Button";
import ToggleButton from "@mui/material/ToggleButton";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

import { DEFAULT_PROMPTS } from "./constants";
import Navbar from "./interfaces/Navbar";
import { extractParametersFromText, resolveTextParams } from "./utils";
import { getPromptOutput } from "./api/chat";
import PromptResult from "./interfaces/PromptResult";
import useSWR from "swr";

import {
  ChatCompletionResponseMessage,
  CreateChatCompletionResponse,
} from "openai";
import { getCreditBalance, listCreditHistory } from "./api/credits";

const Home: React.FC<{}> = () => {
  const { data: creditBalanceResult } = useSWR(
    "credit_balance",
    getCreditBalance
  );
  const [showHistory, setShowHistory] = useState(false);

  const { data: creditHistoryResult } = useSWR(
    "credit_history",
    listCreditHistory
  );

  const [selected, setSelected] = useState(0);
  const [testParams, setTestParams] = useState({});
  const [runResult, setRunResult] =
    useState<CreateChatCompletionResponse | null>(null);
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
      <p>Promptlee is a ChatGPT prompt manager</p>

      <Box>
        {creditBalanceResult?.data ? (
          <div>
            <span>{creditBalanceResult?.data.balance} credits remaining</span>
            <ToggleButton
              value=""
              color="secondary"
              selected={showHistory}
              size="small"
              onClick={() => setShowHistory(!showHistory)}
            >
              View usage
            </ToggleButton>
          </div>
        ) : (
          <Skeleton variant="rectangular" width={100} height={50} />
        )}

        {showHistory && (
          <div>
            <h3>Last 30 Days</h3>
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell align="right">Added</TableCell>
                    <TableCell align="right">Consumed</TableCell>
                    <TableCell align="right">Balance</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {creditHistoryResult?.data &&
                    creditHistoryResult?.data.map((row) => (
                      <TableRow key={row.created_at}>
                        <TableCell component="th" scope="row">
                          {row.date}
                        </TableCell>
                        <TableCell align="right">{row.added}</TableCell>
                        <TableCell align="right">{row.consumed}</TableCell>
                        <TableCell align="right">{row.balance}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        )}
      </Box>

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
