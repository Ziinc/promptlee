import { Spin, SpinProps } from "antd";
import { RefreshCw } from "lucide-react";

interface Props {
  size?: SpinProps["size"];
}
const LoadingSpinner = ({ size = "large" }: Props) => (
  <div className="h-48 w-full flex flex-row justify-center items-center">
    <Spin
      className="mx-auto"
      size={size}
      tip="Loading..."
      indicator={<RefreshCw className="animate-spin" />}
    />
  </div>
);
export default LoadingSpinner;
