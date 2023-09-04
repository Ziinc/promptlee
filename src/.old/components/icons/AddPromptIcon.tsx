import { AlignLeft, Plus } from "lucide-react";

const AddPromptIcon = () => (
  <span className="mt-1 relative flex items-center justify-center">
    <AlignLeft size={18} />
    <Plus size={12} className="absolute bottom-0 -left-2" />
  </span>
);

export default AddPromptIcon;
