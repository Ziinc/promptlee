import { useMemo, useState, useEffect, Fragment } from "react";
import { listRunLogs, LogEvent } from "./api/logs";
import useSWR from "swr";
import Typography from "@mui/material/Typography";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import { ChevronsUpDown } from "lucide-react";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);
interface Props {
  show: boolean;
  builtinId?: string;
  flowId?: string;
}
const Logs = ({ show, builtinId, flowId }: Props) => {
  const { data: logsResult, mutate: refresh } = useSWR<LogEvent[]>(
    "run_logs",
    async () => await listRunLogs({ builtin_id: builtinId, flow_id: flowId }),
    {
      revalidateOnMount: true,
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );
  return (
    <div>
      <Typography variant="h4">Run logs</Typography>
      {!logsResult && "Loading..."}
      {logsResult && logsResult.data && logsResult.data.length > 0 && (
        <>
          {logsResult.data.map((log) => (
            <Accordion key={log.id}>
              <AccordionSummary
                expandIcon={<ChevronsUpDown />}
                aria-controls={`logline-${log.id}`}
                id={`logline-${log.id}`}
              >
                <LogTimestamp log={log} />
              </AccordionSummary>
              <AccordionDetails>
                <Stack direction="column" gap={8}>
                  <LogInput log={log} />
                  <Divider />
                  <LogParams log={log} />
                  <Divider />
                  <LogOutput log={log} />
                </Stack>
              </AccordionDetails>
              <Divider sx={{ borderWidth: 1.5, marginY: 8 }} />
            </Accordion>
          ))}
        </>
      )}
      {logsResult && logsResult.data && logsResult.data.length == 0 && (
        <Typography>No run logs yet.</Typography>
      )}
    </div>
  );
};

const LogTimestamp = ({ log }) => {
  return (
    <Typography variant="subtitle2">
      {dayjs.utc(log.timestamp).local().format("MMM D, YYYY h:mm A")}
    </Typography>
  );
};

const LogParams = ({ log }) => {
  const params = JSON.parse(log.inputs?.[0].params_str);
  return (
    <Typography
      sx={{
        fontFamily: "Monospace",
        whiteSpace: "pre-wrap",
        fontSize: "0.75rem",
      }}
    >
      {JSON.stringify(params, null, 2)}
    </Typography>
  );
};
const LogInput = ({ log }) => (
  <Typography variant="body2">{log.inputs?.[0].prompt}</Typography>
);
const LogOutput = ({ log }) => {
  const content = JSON.parse(log.output?.[0].openai_response_str).choices[0]
    .message.content;
  return <Typography variant="body2">{content}</Typography>;
};

export default Logs;
