import { CreateChatCompletionResponse } from "openai";
import PromptResult from "../../interfaces/PromptResult";
import Button from "@mui/material/Button";
import { Copy } from "lucide-react";
import { Paper, Snackbar } from "@mui/material";
import { useState } from "react";

interface Props {
  result?: CreateChatCompletionResponse | null;
  onClose?: () => void;
}

const Widget = ({ result, onClose }: Props) => {
  const [copied, setCopied] = useState(false);
  const handleCopyToClipboard = async () => {
    if (!result) return;
    const text = result.choices[0].message?.content;
    await navigator.clipboard.writeText(text || "");
    setCopied(true);
  };

  return (
    <Paper>
      <div>
        <Button onClick={onClose}>Close</Button>
      </div>
      {result && <PromptResult result={result} />}

      {result && (
        <Button
          onClick={handleCopyToClipboard}
          startIcon={<Copy size={14} />}
          color="primary"
          variant="contained"
          fullWidth
        >
          Copy
        </Button>
      )}
      <Snackbar
        open={copied}
        autoHideDuration={3000}
        onClose={() => setCopied(false)}
        message="Copied to clipboard"
      />
    </Paper>
  );
};

export default Widget;
