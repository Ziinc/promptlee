import { Menu } from "antd";
import { Settings } from "lucide-react";
import { useLocation } from "wouter";

const Navbar = () => {
  const [location, navigate] = useLocation();
  return (
    <div className="flex flex-row justfy-between">
      <Menu
        mode="horizontal"
        className="w-full"
        selectable={false}
        items={[
          { label: "PromptPro", key: "none", onClick: () => navigate("/") },
          { label: "Prompts", key: "prompts", onClick: () => navigate("/") },
        ]}
      />
      <Menu
        mode="horizontal"
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
  );
};
export default Navbar;
