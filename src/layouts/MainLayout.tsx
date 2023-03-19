import Navbar from "./Navbar";

type Props = React.PropsWithChildren<{}>;
const MainLayout: React.FC<Props> = ({ children }) => (
  <div>
    <Navbar />
    {children}
  </div>
);
export default MainLayout;
