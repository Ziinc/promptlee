import Navbar from "./Navbar";

type Props = React.PropsWithChildren<{}>;
const MainLayout: React.FC<Props> = ({ children }) => (
  <div className="bg-slate-100 h-full min-h-screen">
    <Navbar />
    {children}
  </div>
);
export default MainLayout;
