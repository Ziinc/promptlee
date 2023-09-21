import { CreateChatCompletionResponse } from "openai";

import Typography from "@mui/material/Typography";
interface Props {
  result: CreateChatCompletionResponse;
}

const PromptResult: React.FC<Props> = ({ result }) => {
  // don't support multi choice yet
  if (result.choices.length > 1) return null;
  const choice = result.choices[0];
  return <Typography variant="body1">{choice.message?.content}</Typography>;
};
export default PromptResult;
