import dayjs from "dayjs";
import {
  Tooltip,
  Bar,
  CartesianGrid,
  BarChart,
  Legend,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import { useAppState } from "../App";
import { grey } from "@mui/material/colors";
export interface DailyUsageDatum {
  date: string;
  consumed: number;
}

interface Props {
  data: DailyUsageDatum[];
}

const UsageChart = ({ data }: Props) => {
  const app = useAppState();
  return (
    <ResponsiveContainer height={140} width="100%">
      <BarChart data={data}>
        <XAxis
          tickMargin={6}
          dataKey="date"
          tickSize={3}
          tick={{ fontSize: 11 }}
          reversed
          tickFormatter={(tick) => dayjs(tick).format("DD/MM")}
          interval="preserveStartEnd"
        />
        <YAxis hide />
        <Tooltip
          contentStyle={{
            border: 0,
            borderRadius: 4,
            padding: "3px 14px",
            filter:
              "drop-shadow(0 4px 3px rgb(0 0 0 / 0.07)) drop-shadow(0 2px 2px rgb(0 0 0 / 0.06))",
            backgroundColor: app.darkMode ? "#0f172a" : "#f1f5f9",
          }}
          itemStyle={{ fontSize: 13, textTransform: "capitalize" }}
          labelStyle={{ fontSize: 13, fontWeight: 600 }}
          labelFormatter={(tick) => dayjs(tick).format("D MMMM")}
        />
        <Bar dataKey="consumed" barSize={30} fill="#413ea0" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default UsageChart;
