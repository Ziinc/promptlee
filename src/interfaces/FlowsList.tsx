import { useRoute, Link } from "wouter";
import { useAppState } from "../App";

import Button from '@mui/material/Button';
interface Props {
  close?: () => void;
}
const FlowsList = ({ close = () => null }: Props) => {
  const [_match, params] = useRoute<{ id: string }>("/flows/:id");
  const currentFlowId = params?.id;
  const app = useAppState();
  const flows = app.flows;
  return (
    <div className="flex flex-col gap-2 items-start relative w-full h-full overflow-y-auto snap-manadatory snap-y">
      {(flows || [])
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((flow) => (
          <Link
            key={flow.id}
            to={`/flows/${flow.id}`}
            className={["w-full ml-0 snap-center"].join(" ")}
            onClick={close}
          >
            <Button
              variant={flow?.id === currentFlowId ? "contained" : "text"}
              color="secondary"
              className="text-left"
              size="small"
            >
              {flow.name}
            </Button>
          </Link>
        ))}
    </div>
  );
};
export default FlowsList;
