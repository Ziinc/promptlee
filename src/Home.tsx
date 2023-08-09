import { Container } from "@mui/system";
import Navbar from "./interfaces/Navbar";

const Home: React.FC<{}> = () => {
  return (
    <Container>
      <Navbar />
      <p>PromptPro is a ChatGPT prompt manager</p>
    </Container>
  );
};
export default Home;
