import { CreateChatCompletionResponse } from "openai";

import Typography from "@mui/material/Typography";
interface Props {
  result: CreateChatCompletionResponse;
}

const PromptResult: React.FC<Props> = ({ result }) => {
  // don't support multi choice yet
  if (result.choices.length > 1) return null;
  const choice = result.choices[0];
  return (
    <Typography variant="body1">{choice.message?.content}</Typography>
    // {/* {result.usage && (
    //   <Popover
    //     content={
    //       <Descriptions
    //         className="max-w-sm"
    //         title="Cost Estimation"
    //         size="small"
    //         layout="vertical"
    //         column={1}
    //         colon={false}
    //       >
    //         <Descriptions.Item label="Prompt">
    //           {result.usage.prompt_tokens} tokens
    //         </Descriptions.Item>
    //         <Descriptions.Item label="Completion">
    //           {result.usage.completion_tokens} tokens
    //         </Descriptions.Item>
    //         <Descriptions.Item label="Estimated Cost ($0.002 /1k tokens)">
    //           ${((result.usage?.total_tokens * 0.002) / 1000).toPrecision(4)}
    //         </Descriptions.Item>
    //       </Descriptions>
    //     }
    //   >
    //     <Tag>
    //       {result.usage?.total_tokens} tokens ≈ $
    //       {((result.usage?.total_tokens * 0.002) / 1000).toPrecision(2)}
    //     </Tag>
    //   </Popover>
    // )} */}
  );
};
export default PromptResult;
