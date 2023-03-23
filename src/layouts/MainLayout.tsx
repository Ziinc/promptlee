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
        "py-3 flex-grow",
        variant === "centered" ? " container mx-auto max-w-[900px]" : "",
        contentClassName,
      ].join(" ")}
    >
      {children}
    </div>
  </div>
);
export default MainLayout;
