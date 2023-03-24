import Navbar from "./Navbar";

type Props = React.PropsWithChildren<{
  variant?: "centered" | "wide";
  contentClassName?: string;
}>;
const MainLayout: React.FC<Props> = ({
  children,
  variant = "centered",
  contentClassName = "",
}) => (
  <div className="flex flex-col bg-slate-100 h-full min-h-screen">
    <Navbar />
    <div
      className={[
        "flex-grow",
        variant === "centered" ? "py-3 container mx-auto max-w-[900px]" : "",
        contentClassName,
      ].join(" ")}
    >
      {children}
    </div>
  </div>
);
export default MainLayout;
