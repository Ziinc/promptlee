import { useMemo, useState } from "react";

import Alert from "@mui/material/Alert";
import Chip from "@mui/material/Chip";
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
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";

import Fade from "@mui/material/Fade";
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

import ListItemIcon from "@mui/material/ListItemIcon";

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

import { TransitionGroup } from "react-transition-group";
import Collapse from "@mui/material/Collapse";
import { Gem, SignalHigh, SignalLow, SignalMedium } from "lucide-react";
import { SvgIcon } from "@mui/material";

const CREDITS_PRICING = [
  {
    label: "100 Credits for $5",
    costPerCredit: "$0.05",
    link: "https://buy.stripe.com/9AQeVH3Z88Dl58c001",
    icon: <SignalLow />,
  },
  {
    label: "1,000 Credits for $10",
    costPerCredit: "$0.001",
    link: "https://buy.stripe.com/cN26pbeDMf1JfMQ004",
    icon: <SignalMedium />,
  },
  {
    label: "10,000 Credits for $50",
    costPerCredit: "$0.005",
    link: "https://buy.stripe.com/fZefZL1R05r93047sv",
    icon: <SignalHigh />,
  },
];
const Home: React.FC<{}> = () => {
  const [creditsEl, setCreditsEl] = useState<null | HTMLElement>(null);
  const { data: creditBalanceResult, mutate: refreshCreditBalance } = useSWR(
    "credit_balance",
    getCreditBalance
  );
  const [showHistory, setShowHistory] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [isRunLoading, setIsRunLoading] = useState(false);

  const { data: creditHistoryResult, mutate: refreshCreditHistory } = useSWR(
    "credit_history",
    async () =>
      listCreditHistory(
        dayjs().subtract(30, "day").startOf("day").toISOString()
      )
  );

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
    setRunResult(null);
    const inputText = resolveTextParams(selectedPrompt.prompt_text, testParams);
    const { data, error } = await getPromptOutput(inputText);
    if (error) {
      console.error(error);
      return;
    }
    refreshCreditHistory();
    if (
      creditBalanceResult?.data &&
      creditBalanceResult?.data.consumed &&
      creditBalanceResult?.data.balance
    ) {
      refreshCreditBalance({
        ...creditBalanceResult,
        data: {
          ...creditBalanceResult.data,
          consumed: creditBalanceResult.data.consumed + 1,
          balance: creditBalanceResult.data.balance - 1,
        },
      });
    }

    setRunResult(data);
    setIsRunLoading(false);
  };

  const usageChartData: DailyUsageDatum[] = useMemo(() => {
    if (!creditHistoryResult?.data) return [] as DailyUsageDatum[];
    const now = dayjs().startOf("day");
    const expectedDates = nArray(30).map((n) =>
      now.startOf("day").subtract(n, "day")
    );
    const existingDates = creditHistoryResult.data.map((row) =>
      dayjs(row.date).startOf("day").toISOString()
    );

    const toAdd = expectedDates
      .map((dateToCheck) => {
        if (!existingDates.includes(dateToCheck.toISOString())) {
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
    ].sort((a, b) => {
      return dayjs(b.date).diff(dayjs(a.date));
    });
  }, [creditHistoryResult?.data]);

  const handleClosePricing = () => {
    setShowPricing(false);
    setCreditsEl(null);
  };
  const disableFlowExecution =
    creditBalanceResult?.data?.balance === 0 ||
    (creditBalanceResult?.data?.balance ?? 0) <= 0;

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
            <Chip
              icon={
                <SvgIcon sx={{ pl: 2, pt: 2 }}>
                  <Gem size={18} strokeWidth={1.7} />
                </SvgIcon>
              }
              onClick={(e) => {
                setCreditsEl(e.currentTarget);
                setShowPricing(true);
              }}
              color={disableFlowExecution ? "error" : "primary"}
              variant={disableFlowExecution ? "filled" : "outlined"}
              label={`${creditBalanceResult?.data.balance} credits`}
            />

            <Menu
              anchorEl={creditsEl}
              open={showPricing}
              onClose={() => setShowPricing(false)}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
            >
              {CREDITS_PRICING.map((price, index) => (
                <MenuItem
                  key={price.label}
                  onClick={() => {
                    handleClosePricing();
                    window!.open(price.link, "_blank")!.focus();
                  }}
                  divider={index !== CREDITS_PRICING.length - 1}
                >
                  <ListItemIcon>
                    <SvgIcon>{price.icon}</SvgIcon>
                  </ListItemIcon>
                  <ListItemText>
                    <Stack direction="column">
                      <Typography variant="subtitle2">{price.label}</Typography>

                      <Typography color="secondary" variant="body2">
                        {price.costPerCredit} per credit
                      </Typography>
                    </Stack>
                  </ListItemText>
                </MenuItem>
              ))}
            </Menu>

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
        <Grid xs={2} paddingRight={12}>
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
                  dense
                  sx={{ borderRadius: 18 }}
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
          <Grid
            xs={12}
            gap={4}
            paddingY={4}
            container
            direction="column"
            alignItems="start"
          >
            <Typography variant="h4">{selectedPrompt.title}</Typography>
            <Stack direction="row" gap={4}>
              <Chip label="Built-in" size="small" />
            </Stack>
          </Grid>
          <Grid xs={8} flexDirection="column" container gap={5}>
            <Typography variant="subtitle1" gutterBottom>
              {selectedPrompt.prompt_text}
            </Typography>

            <TransitionGroup>
              {!isRunLoading && runResult && (
                <Collapse
                  style={{ transitionDelay: runResult ? "0ms" : "1500ms" }}
                  timeout={runResult ? "auto" : 0}
                >
                  <Stack direction="column" gap={5}>
                    <Divider variant="middle" />
                    <Typography variant="subtitle2">Results</Typography>
                    {runResult && <PromptResult result={runResult} />}
                  </Stack>
                </Collapse>
              )}
              {isRunLoading && (
                <Fade
                  style={{ transitionDelay: runResult ? "1500ms" : "0ms" }}
                  timeout={runResult ? 0 : undefined}
                >
                  <Stack direction="column" gap={5}>
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
                      width={"70%"}
                      height={20}
                    />
                    <Skeleton
                      variant="rounded"
                      animation="wave"
                      width={"90%"}
                      height={20}
                    />
                    <Skeleton
                      variant="rounded"
                      animation="wave"
                      width={"80%"}
                      height={20}
                    />
                  </Stack>
                </Fade>
              )}
            </TransitionGroup>
          </Grid>
          <Grid xs={4}>
            <Card sx={{ pb: 8, px: 2 }} variant="outlined">
              <CardHeader title="Parameters" />
              {disableFlowExecution && (
                <Alert
                  severity="error"
                  action={
                    <Button
                      variant="contained"
                      onClick={(e) => {
                        setCreditsEl(e.currentTarget);
                        setShowPricing(true);
                      }}
                      color="inherit"
                    >
                      Buy more
                    </Button>
                  }
                >
                  No credits remaining.
                </Alert>
              )}
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
                    disabled={disableFlowExecution}
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
