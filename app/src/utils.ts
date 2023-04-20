import {
  AppContextValue,
  AppState,
  Prompt,
  Workflow,
  WorkflowRunHistoryItem,
} from "./App";
// @ts-ignore
import batchingToposort from "batching-toposort";
import slice from "lodash/slice";
import concat from "lodash/concat";
import { merge } from "lodash";

// https://stackoverflow.com/questions/61132262/typescript-deep-partial
type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

export const resolveTextParams = (
  text: string,
  params: Record<string, string>
) => {
  let replaced = text;

  for (const [key, value] of Object.entries(params)) {
    replaced = replaced.replaceAll(`@${key}`, value);
  }

  return replaced;
};

export const extractPromptParameters = (prompt: Prompt) => {
  const inputMessages = prompt.messages;

  const parsedParamNames = inputMessages.flatMap((message) => {
    if (!message.content) return [];
    const promptParams = [...message.content.matchAll(/\s\@(\S+)\s?/g)];
    return promptParams.flatMap(([_match, paramName]) => paramName);
  });
  const promptParameters = [...new Set(parsedParamNames)];
  return promptParameters;
};

export const resolvePrompt = (
  prompt: Prompt,
  params: Record<string, string>
) => {
  const resolvedMessages = prompt.messages.map((message) => ({
    ...message,
    content: resolveTextParams(message.content, params),
  }));
  return { ...prompt, messages: resolvedMessages };
};

export const removeParamsFromMessage = (
  message: Prompt["messages"][number]
) => {
  return {
    ...message,
    content: message.content.replaceAll(/\s\@(\S+)\s?/g, " "),
  };
};

export const countWords = (text: string) => (text.match(/\S+/g) || []).length;

export const isSystemDarkMode = () => {
  return (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
};

export const getQueryParams = () =>
  new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => {
      const val: string | null = searchParams.get(prop as string);
      return val ? decodeURIComponent(val) : val;
    },
  }) as any & Record<string, string>;

export const listTerminalOutputNodes = (workflow: Workflow) => {
  const terminalNodes = workflow.nodes.filter((node) => {
    const connection = workflow.edges.find((edge) => {
      return edge.from_node_id === node.id;
    });
    return !connection;
  });
  return terminalNodes;
};
export const countWorkflowOutputs = (workflow: Workflow): number => {
  return listTerminalOutputNodes(workflow).length;
};

export const getNodePromptMapping = (app: AppState, workflow: Workflow) => {
  return workflow.nodes.reduce((acc, node) => {
    const prompt = app.prompts.find((p) => p.id === node.prompt_id);
    acc[node.id] = prompt;
    return acc;
  }, {} as Record<string, Prompt | undefined>);
};

export const filterInputNodes = (workflow: Workflow) => {
  //
  const connectedOutputNodeIds = workflow.edges.map((edge) => {
    return edge.from_node_id;
  });

  return workflow.nodes.filter((node) => {
    return !connectedOutputNodeIds.includes(node.id);
  });
};

export const inputNodeParametersMapping = (
  app: AppState,
  workflow: Workflow
) => {
  const inputNodes = filterInputNodes(workflow);

  let mapping = {} as Record<string, string[]>;
  return inputNodes.reduce((acc, node) => {
    const prompt = app.prompts.find((p) => p.id === node.prompt_id);
    if (prompt) {
      const inputs = extractPromptParameters(prompt);
      // remove inputs that have connections

      acc[node.id] = inputs.filter((parameter) => {
        const connection = workflow.edges.find((edge) => {
          return edge.to_input === parameter && edge.to_node_id === node.id;
        });
        return !connection;
      });
    }
    return acc;
  }, mapping);
};

export const listWorkflowParameters = (app: AppState, workflow: Workflow) => {
  const paramsMapping = inputNodeParametersMapping(app, workflow);
  const parameters = Object.values(paramsMapping).flatMap((v) => v);
  return [...new Set(parameters)];
};

export const countWorkflowParameters = (app: AppState, workflow: Workflow) => {
  const parameters = listWorkflowParameters(app, workflow);
  return parameters.length;
};

export const workflowToDag = (workflow: Workflow) => {
  let dag = workflow.nodes.reduce((acc, node) => {
    const edgesFromNode = workflow.edges
      .filter((edge) => edge.to_node_id && edge.from_node_id === node.id)
      .map((edge) => edge.to_node_id!);
    acc[node.id] = edgesFromNode;
    return acc;
  }, {} as Record<string, string[]>);

  return dag;
};

export const batchToposortDag = (dag: Record<string, string[]>): string[][] => {
  console.log("batching dag", dag);
  return batchingToposort(dag);
};

export const mergeWorkflowRunOutputs = (
  app: AppContextValue,
  runId: string,
  toMerge: DeepPartial<WorkflowRunHistoryItem>
) => {
  return app.setAppState((prevState) => {
    const runs = prevState.workflowRuns;
    const index = runs.findIndex((run) => run.id === runId);
    const target = runs[index];
    const updated = merge(target, toMerge);

    const head = slice(runs, 0, index);
    const tail = slice(
      runs,
      index === runs.length ? runs.length : index + 1,
      runs.length
    );
    const newRuns = concat(head, updated, tail);
    return { ...prevState, workflowRuns: newRuns };
  });
};

export const extractWorkflowParams = (
  app: AppState,
  workflow: Workflow
): string[] => {
  const inputNodes = filterInputNodes(workflow);
  const inputNodeIds = inputNodes.map((n) => n.id);
  // eliminate params for nodes that have input edges
  let nodeParamsMapping = inputNodes.reduce((acc, node) => {
    const prompt = app.prompts.find((p) => p.id === node.prompt_id);
    acc[node.id] = prompt ? extractPromptParameters(prompt) : [];
    return acc;
  }, {} as Record<string, string[]>);

  workflow.edges.reduce((acc, edge) => {
    if (!edge.to_node_id || !inputNodeIds.includes(edge.to_node_id)) return acc;

    const params = acc[edge.to_node_id];
    acc[edge.to_node_id] = params.filter((p) => p !== edge.to_input);
    return acc;
  }, nodeParamsMapping);

  return Object.values(nodeParamsMapping).flat();
};
