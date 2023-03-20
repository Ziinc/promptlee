import { Menu } from "antd";
import { Settings } from "lucide-react";
import { useLocation } from "wouter";

const Navbar = () => {
  const [location, navigate] = useLocation();
  return (
    <div className="w-full bg-white ">
      <div className="flex flex-row justfy-between mx-auto container">
        <Menu
          mode="horizontal"
          className="w-full border-b-0"
          selectable={false}
          items={[
            { label: "PromptPro", key: "none", onClick: () => navigate("/") },
            { label: "Prompts", key: "prompts", onClick: () => navigate("/") },
          ]}
        />
        <Menu
          mode="horizontal"
          className=" border-b-0"
          items={[
            {
              label: "Settings",
              key: "settings",
              icon: <Settings size={12} />,
              onClick: () => navigate("/settings"),
            },
          ]}
        />
      </div>
    </div>
  );
};
export default Navbar;
