import { Switch } from "antd";
import { Moon, Sun } from "lucide-react";
import { useAppState } from "../App";

const DarkModeSwitch = () => {
  const app = useAppState();

  return (
    <Switch
      checked={app.darkMode}
      className="!border-slate-500 !border dark:!border-blue-500 !border-solid dark:!bg-blue-600 !bg-gray-200 hover:!bg-gray-400 "
      checkedChildren={
        <Moon size={12} strokeWidth={3} className="mt-1 text-white" />
      }
      unCheckedChildren={
        <Sun size={12} strokeWidth={3} className=" mt-1 text-black" />
      }
      onChange={app.toggleDarkMode}
    />
  );
};
export default DarkModeSwitch;
