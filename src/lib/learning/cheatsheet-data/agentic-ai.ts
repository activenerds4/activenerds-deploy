import type { CheatSheet } from "../cheatsheet-types";

export const agenticAiCheatSheet: CheatSheet = {
  topicSlug: "agentic-ai",
  topicName: "Agentic AI",
  description: "Quick reference guide for agent loops (ReAct), tool selection, MCP protocol, reflection loops, and multi-agent patterns.",
  lastUpdated: "2026-07-25",
  sections: [
    {
      title: "Agent Loop Patterns",
      items: [
        { command: "ReAct (Thought -> Action -> Observation)", description: "Interleave explicit step-by-step reasoning thoughts with action tool calls and observation inputs.", relatedGlossaryTerm: "react-pattern" },
        { command: "Plan-and-Execute", description: "First phase generates structured DAG plan breakdown; second phase executes sub-tasks sequentially.", relatedGlossaryTerm: "planning-loop" },
        { command: "Reflection / Critique Loop", description: "Evaluator LLM checks output against acceptance criteria, returning feedback to generator until pass.", relatedGlossaryTerm: "reflection-pattern" },
        { command: "Human-in-the-Loop (HITL)", description: "Pause agent execution loop on high-risk tool calls (e.g. write file, run terminal command) awaiting user approval." }
      ]
    },
    {
      title: "Tool Call Schema & Protocol",
      items: [
        { command: "JSON Schema Tool Definition", description: "Declare tool name, description, and strict parameter properties/types in system schema payload.", relatedGlossaryTerm: "tool-call" },
        { command: "MCP JSON-RPC Request", description: "Standard protocol method invocation: `tools/call` with parameters over stdio IPC or SSE transport.", relatedGlossaryTerm: "mcp" },
        { command: "Tool Response Handling", description: "Format tool outputs clearly as string or JSON observations injected directly back into chat context.", relatedGlossaryTerm: "tool-call" }
      ]
    },
    {
      title: "Multi-Agent System Topologies",
      items: [
        { command: "Supervisor / Orchestrator Pattern", description: "Central supervisor agent inspects goal, routes tasks to domain subagents, and synthesizes output.", relatedGlossaryTerm: "multi-agent-orchestration" },
        { command: "Hierarchical Team Pattern", description: "Tree hierarchy where department sub-supervisors manage worker agents for deep sub-tasks.", relatedGlossaryTerm: "multi-agent-orchestration" },
        { command: "Sequential Pipeline Swarm", description: "Linear chain where Output of Agent A becomes Input context for Agent B (e.g. Specs -> Code -> Test)." }
      ]
    },
    {
      title: "Agent Safety & Guardrails",
      items: [
        { command: "Max Iterations Guard", description: "Hard cutoff (e.g. max_steps = 15) preventing runaway infinite tool loops or budget exhaustion." },
        { command: "Tool Permission Scoping", description: "Restrict write/execute tool access to specific workspace directory paths, blocking root/system access." },
        { command: "Context Window Truncation", description: "Prune old observation logs or summarize earlier loop turns when approaching model context window limits.", relatedGlossaryTerm: "agent-memory" }
      ]
    }
  ]
};
