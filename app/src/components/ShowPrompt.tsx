import { Prompt } from "../App";

interface Props {
  prompt: Prompt;
}

const ShowPrompt: React.FC<Props> = ({ prompt }) => (
  <div>
    {prompt.messages.map((message) => (
      <p className="whitespace-pre-wrap" key={message.content}>
        {message.content}
      </p>
    ))}
  </div>
);
export default ShowPrompt;
