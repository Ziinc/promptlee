import { useMemo, useState } from "react";

import Box from "@mui/material/Box";
import List from "@mui/material/List";
import { Container } from "@mui/system";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import ListSubheader from "@mui/material/ListSubheader";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Divider from "@mui/material/Divider";
import CardHeader from "@mui/material/CardHeader";
import LoadingButton from "@mui/lab/LoadingButton";
import Skeleton from "@mui/material/Skeleton";

import Stack from "@mui/material/Stack";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

import { DEFAULT_PROMPTS } from "./constants";
import Navbar from "./interfaces/Navbar";
import { extractParametersFromText, nArray, resolveTextParams } from "./utils";
import { getPromptOutput } from "./api/chat";
import PromptResult from "./interfaces/PromptResult";
import useSWR from "swr";

import { CreateChatCompletionResponse } from "openai";
import { getCreditBalance, listCreditHistory } from "./api/credits";
import UsageChart, { DailyUsageDatum } from "./interfaces/UsageChart";
import dayjs from "dayjs";

import Grid from "@mui/material/Unstable_Grid2";

const Home: React.FC<{}> = () => {
  const { data: creditBalanceResult } = useSWR(
    "credit_balance",
    getCreditBalance
  );
  const [showHistory, setShowHistory] = useState(false);
  const [isRunLoading, setIsRunLoading] = useState(false);

  const { data: creditHistoryResult } = useSWR("credit_history", async () =>
    listCreditHistory(dayjs().subtract(30, "day").startOf("day").toISOString())
  );

  console;
  const [selected, setSelected] = useState(0);
  const [testParams, setTestParams] = useState({});
  const [runResult, setRunResult] =
    useState<CreateChatCompletionResponse | null>(null);
  const selectedPrompt = DEFAULT_PROMPTS[selected];
  const parsedParameters = extractParametersFromText(
    selectedPrompt.prompt_text
  );

  const handleRunFlow = async () => {
    setIsRunLoading(true);
    const inputText = resolveTextParams(selectedPrompt.prompt_text, testParams);
    const { data, error } = await getPromptOutput(inputText);
    if (error) {
      console.error(error);
      return;
    }

    setRunResult(data);
    setIsRunLoading(false);
  };

  const usageChartData: DailyUsageDatum[] = useMemo(() => {
    if (!creditHistoryResult?.data) return [] as DailyUsageDatum[];
    const now = dayjs().startOf("day");
    const expectedDates = nArray(30).map((n) => now.subtract(n, "day"));
    const existingDates = creditHistoryResult.data.map((row) =>
      dayjs(row.date)
    );

    const toAdd = expectedDates
      .map((dateToCheck) => {
        if (!existingDates.includes(dateToCheck)) {
          return {
            date: dateToCheck.toISOString(),
            consumed: 0,
          };
        }
      })
      .filter((d) => !!d) as DailyUsageDatum[];
    return [
      ...creditHistoryResult.data.map((d) => ({
        consumed: d.consumed!,
        date: dayjs(d.date!).toISOString(),
      })),
      ...toAdd,
    ];
  }, [creditHistoryResult?.data]);

  return (
    <Container>
      <Navbar />
      <Box>
        <Typography variant="subtitle2">Last 30 days</Typography>
        {creditHistoryResult?.data && <UsageChart data={usageChartData} />}
        {creditBalanceResult?.data ? (
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="flex-end"
            gap={4}
          >
            <Typography variant="body2">
              {creditBalanceResult?.data.balance} credits remaining
            </Typography>
            <Button onClick={() => setShowHistory(true)}>View history</Button>
            <Modal
              open={showHistory}
              onClose={() => setShowHistory(!showHistory)}
            >
              <Card
                sx={{ maxWidth: "60vw", mx: "auto", mt: "10vh", py: 2, px: 12 }}
              >
                <CardContent>
                  <Typography variant="h5">30 Day Credit History</Typography>
                  <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 650 }} size="small">
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
                            <TableRow key={`${row.date}-${row.balance}`}>
                              <TableCell component="th" scope="row">
                                {dayjs(row.date).format("D MMMM")}
                              </TableCell>
                              <TableCell align="right">{row.added}</TableCell>
                              <TableCell align="right">
                                {row.consumed}
                              </TableCell>
                              <TableCell align="right">{row.balance}</TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
                <CardActions>
                  <Button
                    onClick={() => setShowHistory(false)}
                    color="secondary"
                    sx={{ ml: "auto" }}
                  >
                    Close
                  </Button>
                </CardActions>
              </Card>
            </Modal>
          </Stack>
        ) : (
          <Skeleton
            variant="rectangular"
            width={"100%"}
            animation="wave"
            height={150}
          />
        )}
      </Box>

      <Grid container spacing={8}>
        <Grid xs={2}>
          <List
            subheader={
              <ListSubheader sx={{ pl: 0 }} component="span">
                Built-in flows
              </ListSubheader>
            }
          >
            {DEFAULT_PROMPTS.map((prompt, idx) => (
              <ListItem disablePadding key={prompt.title}>
                <ListItemButton
                  onClick={() => setSelected(idx)}
                  selected={prompt.title == selectedPrompt.title}
                >
                  <ListItemText
                    primary={prompt.title}
                    primaryTypographyProps={{ variant: "body2" }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Grid>
        <Grid xs={10} container spacing={2}>
          <Grid xs={12}>
            <Typography variant="h4">{selectedPrompt.title}</Typography>
          </Grid>
          <Grid xs={8} flexDirection="column" container gap={5}>
            <Typography variant="subtitle1" gutterBottom>
              {selectedPrompt.prompt_text}
            </Typography>

            {!isRunLoading && runResult && (
              <>
                <Divider variant="middle" />
                <Typography variant="subtitle2">Results</Typography>
                <PromptResult result={runResult} />
              </>
            )}
            {false && (
              <>
                <Divider variant="middle" />
                <Skeleton
                  variant="rounded"
                  animation="wave"
                  width={80}
                  height={20}
                />
                <Skeleton
                  variant="rounded"
                  animation="wave"
                  width={"80%"}
                  height={20}
                />
                <Skeleton
                  variant="rounded"
                  animation="wave"
                  width={"100%"}
                  height={20}
                />
                <Skeleton
                  variant="rounded"
                  animation="wave"
                  width={"80%"}
                  height={20}
                />
              </>
            )}
          </Grid>
          <Grid xs={4}>
            <Card sx={{ pb: 8, px: 2 }} variant="outlined">
              <CardHeader title="Parameters" />
              <CardContent>
                {parsedParameters.map((param) => (
                  <TextField
                    disabled={isRunLoading}
                    key={param}
                    label={"@" + param}
                    multiline
                    maxRows={2}
                    variant="filled"
                    size="small"
                    sx={{ width: "100%" }}
                    onChange={(e) => {
                      setTestParams((prev) => ({
                        ...prev,
                        [param]: e.target.value,
                      }));
                    }}
                  />
                ))}
              </CardContent>
              <CardActions>
                <Stack direction="row" gap={2} sx={{ ml: "auto" }}>
                  <LoadingButton
                    sx={{ width: "100%" }}
                    variant="contained"
                    onClick={handleRunFlow}
                    loading={isRunLoading}
                  >
                    Run flow
                  </LoadingButton>
                </Stack>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};
export default Home;
