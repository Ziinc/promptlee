import { CreateChatCompletionResponse } from "openai";

interface Props {
  result: CreateChatCompletionResponse;
}

const PromptResult: React.FC<Props> = ({ result }) => {
  return (
    <div>
      {result.choices.map((choice) => (
        <div className="flex flex-col">
          <div className="flex flex-row gap-4">
            <strong>{choice.message?.role}</strong>
          </div>
          <p>{choice.message?.content}</p>
        </div>
      ))}
    </div>
  );
};
export default PromptResult;
