import { Spin } from "antd"
import { RefreshCw } from "lucide-react"

const LoadingSpinner = ()=>(

    <div className="h-48 w-full flex flex-row justify-center items-center">
    <Spin
      className="mx-auto"
      size="large"
      tip="Loading..."
      indicator={<RefreshCw className="animate-spin" />}
    />
  </div>
)
export default LoadingSpinner