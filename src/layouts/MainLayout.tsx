import Navbar from "./Navbar";

type Props = React.PropsWithChildren<{
  variant?: "centered";
}>;
const MainLayout: React.FC<Props> = ({ children, variant = "centered" }) => (
  <div className="bg-slate-100 h-full min-h-screen">
    <Navbar />
    <div
      className={[
        "py-3",
        variant === "centered" ? " container mx-auto max-w-[900px]" : "",
      ].join(" ")}
    >
      {children}
    </div>
  </div>
);
export default MainLayout;
