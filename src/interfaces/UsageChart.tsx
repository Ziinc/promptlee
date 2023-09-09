import {
  Tooltip,
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  XAxis,
  YAxis,
} from "recharts";
import { DailyCreditHistoryRow } from "../api/credits";

interface Props {
  data: DailyCreditHistoryRow[];
}

const UsageChart = ({ data }: Props) => {
  return (
    <div>
      <ComposedChart width={730} height={250} data={data}>
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <CartesianGrid stroke="#f5f5f5" />
        <Bar dataKey="consumed" barSize={30} fill="#413ea0" />
        <Line type="monotone" dataKey="balance" stroke="#ff7300" />
      </ComposedChart>
    </div>
  );
};

export default UsageChart;
