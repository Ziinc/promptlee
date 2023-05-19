import { Link, useLocation } from "wouter";
import { useAppState } from "../App";
import { useRoute } from "wouter";
import { Button, Input } from "antd";
import { useState } from "react";
interface Props {
  close?: () => void;
}
const FlowsList = ({ close = () => null }: Props) => {
  const [_match, params] = useRoute<{ id: string }>("/flows/:id");
  const currentFlowId = params?.id;
  const app = useAppState();
  const flows = app.flows;
  const [search, setSearch] = useState("");
  return (
    <div className="flex flex-col gap-2 items-start relative w-full h-full overflow-y-auto snap-manadatory snap-y">
      <Input
        className={[
          "sticky top-0 z-10 mb-1",
          (flows || []).length < 10 ? "hidden" : "",
        ].join(" ")}
        value={search}
        placeholder="Filter by name..."
        size="small"
        onChange={(e) => setSearch(e.target.value)}
      />
      {(flows || [])
        .filter((flow) =>
          flow.name.toLocaleLowerCase().includes(search.toLocaleLowerCase())
        )
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((flow) => (
          <Link
            key={flow.id}
            to={`/flows/${flow.id}`}
            className={["w-full ml-0 snap-center"].join(" ")}
            onClick={close}
          >
            <Button
              type={flow?.id === currentFlowId ? "primary" : "text"}
              block
              className="text-left"
            >
              {flow.name}
            </Button>
          </Link>
        ))}
    </div>
  );
};
export default FlowsList;
