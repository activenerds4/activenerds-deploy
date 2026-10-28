import type { GlossaryEntry } from "../glossary-types";

export const agenticAiGlossary: GlossaryEntry[] = [
  {
    slug: "ai-agent",
    term: "AI Agent",
    summary: "An autonomous software loop that uses an LLM as its decision engine to observe goals, run tools, and iterate until finished.",
    plainEnglish: "A regular chatbot just talks to you. An AI Agent actually does things for you in the real world: it runs code, searches the web, queries your database, reads the error output, fixes its own mistake, and repeats the loop until your task is accomplished.",
    analogy: "A chatbot is like an advisor giving you verbal advice from an armchair. An agent is like a software engineer sitting at a keyboard with terminal access, executing commands and checking their output until the build passes.",
    definition: "An autonomous control loop where a foundation model acts as the central reasoning core. In a cycle of Perception → Planning → Action → Observation, the agent inspects environmental feedback, selects and triggers executable tools via structured schemas, evaluates return values, and updates its working memory until terminal conditions are met.",
    practicalUsage: {
      scenario: "A bare-bones Python agent loop executing tools dynamically",
      codeOrCommand: `class SimpleAgent:
    def __init__(self, llm, tools):
        self.llm = llm
        self.tools = {t.name: t for t in tools}
        self.history = []

    def run(self, goal, max_steps=5):
        self.history.append({"role": "user", "content": goal})
        for step in range(max_steps):
            response = self.llm.generate(self.history, tools=list(self.tools.values()))
            if not response.tool_calls:
                return response.content # Goal completed!
            
            for call in response.tool_calls:
                tool_func = self.tools[call.name]
                observation = tool_func(**call.arguments)
                self.history.append({"role": "tool", "tool_call_id": call.id, "content": str(observation)})
        return "Max steps reached without resolution."`,
      explanation: "The agent keeps executing tools and reading the return values until it decides it has gathered enough information to deliver the final answer."
    },
    practicalTips: [
      "Always enforce a hard max_iterations cap (e.g. 10 or 15 steps). Without it, an agent stuck in a tool error loop will burn through hundreds of dollars in API tokens in minutes.",
      "Give agents clear exit criteria in the system prompt: 'If the tool returns 404 twice, stop and report the error to the user rather than retrying indefinitely.'",
      "Treat all tool outputs as untrusted input. Sanitize outputs to prevent prompt injection attacks if your agent reads third-party websites or emails."
    ],
    misconceptions: [
      "Myth: AI agents are sentient or have independent intent. Reality: They are deterministic while loops that repeatedly prompt an LLM with the latest tool outputs until the LLM emits a stopping token.",
      "Myth: More autonomy is always better. Reality: Production agents need human-in-the-loop checkpoints before executing irreversible actions like sending emails, deleting files, or charging credit cards."
    ],
    topics: ["agentic-ai"],
    type: "concept",
    level: "beginner",
    relatedTerms: ["tool-call", "react-pattern", "mcp"],
    appearsIn: [
      { kind: "learning-path-module", title: "Agent architecture fundamentals", href: "/learning/paths/agentic-ai" }
    ]
  },
  {
    slug: "tool-call",
    term: "Tool Call / Function Calling",
    summary: "The mechanism allowing an LLM to output structured JSON calling external APIs, scripts, or database queries.",
    plainEnglish: "LLMs can't natively connect to PostgreSQL or check today's weather. With tool calling, you give the AI a menu of functions with their parameters. When the AI needs real-world data, it pauses and emits a clean JSON snippet saying: 'Please run search_database(query=\"active users\") for me.'",
    analogy: "Like ordering food at a restaurant by handing the waiter a completed order slip with item numbers and quantities, rather than wandering into the kitchen and cooking it yourself.",
    definition: "A model capability where the LLM pauses plain-text output and emits a structured JSON payload conforming to a developer-provided JSON Schema declaration. The runtime interceptor executes the function on the host machine and injects the output back into the message history as a role: tool response.",
    practicalUsage: {
      scenario: "Declaring a tool schema in OpenAI / Anthropic format",
      codeOrCommand: `tools = [
  {
    "type": "function",
    "function": {
      "name": "fetch_server_logs",
      "description": "Fetch the last N lines of logs from a production pod",
      "parameters": {
        "type": "object",
        "properties": {
          "pod_name": {"type": "string", "description": "e.g. auth-service-7d8b"},
          "lines": {"type": "integer", "description": "Number of lines (max 100)", "default": 20}
        },
        "required": ["pod_name"]
      }
    }
  }
]

response = client.chat.completions.create(
  model="gpt-4o",
  messages=[{"role": "user", "content": "Why is auth-service-7d8b crashing?"}],
  tools=tools,
  tool_choice="auto" # lets the LLM decide whether to call the tool
)`,
      explanation: "The model parses the user question, detects that it needs server logs, and generates a valid JSON payload matching the schema."
    },
    practicalTips: [
      "Keep tool descriptions concise and distinct. If you have two tools with overlapping descriptions (e.g. search_files vs find_files), the LLM will oscillate between them inconsistently.",
      "Always validate arguments with Pydantic or Zod before executing. Never pass raw LLM tool arguments directly to eval() or SQL queries.",
      "Return concise tool outputs. If a bash command outputs 10,000 lines of logs, truncate it to the first and last 50 lines; otherwise, you will overflow your context window."
    ],
    misconceptions: [
      "Myth: The LLM executes the code on its own servers. Reality: The LLM only generates the JSON text specifying function name and arguments. Your application backend must run the actual code."
    ],
    topics: ["agentic-ai", "gen-ai"],
    type: "concept",
    level: "beginner",
    relatedTerms: ["ai-agent", "mcp"],
    appearsIn: [
      { kind: "learning-path-module", title: "Tool selection & function calling", href: "/learning/paths/agentic-ai" }
    ]
  },
  {
    slug: "react-pattern",
    term: "ReAct Pattern (Reason + Act)",
    summary: "A prompting framework that makes an AI think out loud before deciding which tool to call next.",
    plainEnglish: "Instead of jumping straight to an action or giving a guess, ReAct forces the agent to follow a strict pattern: Thought (What do I know and what is missing?) → Action (Call a specific tool) → Observation (Read the tool's result). Repeating this creates reliable problem-solving.",
    analogy: "Like a detective at a crime scene: 'Thought: The window is broken from the inside. Action: Dust the glass for fingerprints. Observation: Found small smudges. Thought: The smudges match child-sized hands.'",
    definition: "Introduced by Yao et al. (2022), ReAct interleaves reasoning traces ('Thought') and task-specific actions ('Action' / 'Action Input') with environment feedback ('Observation'). This explicit separation reduces execution errors and enables post-hoc explainability of agent decisions.",
    practicalUsage: {
      scenario: "ReAct formatted prompt output trace",
      codeOrCommand: `Question: What is the uptime of our primary database and who deployed it?

Thought: I need to query the database status tool first.
Action: get_service_status(service="postgres-primary")
Observation: {"status": "healthy", "uptime_days": 42, "last_deploy_id": "dep-8891"}

Thought: The uptime is 42 days. Now I need to find who triggered deployment dep-8891.
Action: get_deployment_author(deploy_id="dep-8891")
Observation: {"author": "alex@company.com", "timestamp": "2026-09-15"}

Thought: I now have both answers to fulfill the user's question.
Final Answer: The primary database has been up for 42 days, deployed by Alex on Sept 15.`,
      explanation: "By reasoning before each step, the agent avoids hallucinating details and methodically steps toward the solution."
    },
    practicalTips: [
      "Modern native function calling (OpenAI / Anthropic tool use) embeds the ReAct loop directly into API schemas, where thoughts are expressed in reasoning tokens or intermediate assistant messages.",
      "If the agent gets stuck in a loop repeating the same action, inject a system hint: 'You have called this tool twice with the same arguments. Please choose an alternate approach or stop.'"
    ],
    misconceptions: [
      "Myth: ReAct requires special fine-tuned models. Reality: Any capable foundation model (GPT-4o, Claude 3.5, Llama 3) can execute ReAct loops through simple system prompt instructions."
    ],
    topics: ["agentic-ai"],
    type: "architecture_pattern",
    level: "beginner",
    relatedTerms: ["ai-agent", "planning-loop"],
    appearsIn: [
      { kind: "learning-path-module", title: "ReAct loop implementation", href: "/learning/paths/agentic-ai" }
    ]
  },
  {
    slug: "planning-loop",
    term: "Planning Loop",
    summary: "Breaking down a large, intimidating goal into a prioritized checklist before executing any tools.",
    plainEnglish: "If you tell an agent 'Migrate our billing database to Stripe', jumping into tool execution will cause chaos. A planning loop pauses, writes out a 6-step roadmap, checks dependencies (e.g. Step 3 requires Step 2), and executes them in order while crossing off items.",
    analogy: "Like a flight checklist: a pilot doesn't just start flipping switches randomly; they review and execute a methodical, numbered pre-flight checklist.",
    definition: "An agent architecture stage that decomposes high-level user tasks into a Directed Acyclic Graph (DAG) or sequential checklist of atomic sub-goals. The planner dynamically updates remaining steps as execution proceeds, handling errors and branching based on intermediate tool outputs.",
    practicalUsage: {
      scenario: "Structured planner emitting a JSON execution plan",
      codeOrCommand: `{
  "goal": "Audit AWS S3 buckets for public read access",
  "plan": [
    {"step": 1, "task": "List all S3 buckets in account", "tool": "aws_s3_list", "status": "completed"},
    {"step": 2, "task": "Inspect ACL policy for bucket-assets-01", "tool": "aws_s3_get_acl", "status": "in_progress"},
    {"step": 3, "task": "Inspect ACL policy for bucket-backups-secure", "tool": "aws_s3_get_acl", "status": "pending"},
    {"step": 4, "task": "Generate markdown summary of public buckets", "tool": "render_report", "status": "pending"}
  ]
}`,
      explanation: "Maintaining an explicit plan in working memory prevents the agent from forgetting its objective midway through a complex task."
    },
    practicalTips: [
      "Split planning and execution into two different model personas: a 'Planner' that generates and updates the checklist, and an 'Executor' that focuses solely on running one task at a time.",
      "Keep plans shallow: avoid plans with more than 7 steps. If a plan is too long, the agent will frequently drift off course. Have sub-goals spawn sub-plans dynamically."
    ],
    misconceptions: [
      "Myth: Plans must be rigid and immutable once generated. Reality: Real-world agents must dynamically replan whenever a tool returns an unexpected error or missing data."
    ],
    topics: ["agentic-ai"],
    type: "architecture_pattern",
    level: "intermediate",
    relatedTerms: ["react-pattern", "reflection-pattern"],
    appearsIn: [
      { kind: "learning-path-module", title: "Hierarchical planning & execution DAGs", href: "/learning/paths/agentic-ai" }
    ]
  },
  {
    slug: "reflection-pattern",
    term: "Reflection & Critique Pattern",
    summary: "A quality-control loop where the AI critiques its own draft or code before presenting it to the user.",
    plainEnglish: "When humans write code or an essay, the first draft usually has typos and bugs. Reflection gives the AI a 'reviewer' persona that examines its own draft against rules (e.g. 'Does this handle null values? Is this SQL query injection-safe?'), finds the mistakes, and rewrites the final version.",
    analogy: "Like a senior editor reviewing a reporter's draft article with a red pen before it goes to print.",
    definition: "An architectural pattern where an agent evaluates its own intermediate outputs before finalizing them. A critique evaluator prompt tests generated code, responses, or plans against explicit constraints, feeding identified errors back to the generator agent for iterative refinement.",
    practicalUsage: {
      scenario: "Two-step Generator → Critic → Refiner loop",
      codeOrCommand: `# 1. Generator produces draft
draft_code = generator_agent.run("Write a Python function to parse JWT tokens")

# 2. Critic evaluates draft against security checklist
critique = critic_agent.run(f"""Review this code for vulnerabilities:
{draft_code}
Checklist:
- Does it verify cryptographic signatures?
- Does it check expiration time (exp)?
- Does it handle missing headers safely?""")

# 3. Refiner improves draft if issues were detected
if "VULNERABILITY DETECTED" in critique:
    final_code = generator_agent.run(f"Fix these issues in the code:\\n{critique}")
else:
    final_code = draft_code`,
      explanation: "Separating generation from evaluation drastically reduces logic bugs, security holes, and format violations."
    },
    practicalTips: [
      "Using two different models (or two distinct system prompts) for Generator and Critic yields much better results than asking a single prompt to 'write and check yourself'.",
      "Give the Critic a concrete rubric or unit test suite rather than open-ended instructions. Concrete test failures give the Refiner clear signals to fix."
    ],
    misconceptions: [
      "Myth: Reflection can fix fundamentally missing capabilities. Reality: If the base model does not understand an obscure protocol or library, self-reflection will just cause it to hallucinate plausible-sounding explanations."
    ],
    topics: ["agentic-ai"],
    type: "architecture_pattern",
    level: "intermediate",
    relatedTerms: ["planning-loop", "ai-agent"],
    appearsIn: [
      { kind: "learning-path-module", title: "Self-correction & reflection loops", href: "/learning/paths/agentic-ai" }
    ]
  },
  {
    slug: "mcp",
    term: "MCP (Model Context Protocol)",
    summary: "The universal open standard (like USB-C for AI) for connecting agents to databases, tools, and local files.",
    plainEnglish: "Before MCP, if you wanted an AI to talk to PostgreSQL, GitHub, and Slack, you had to write custom glue code for every single platform. MCP creates a standard protocol: any database or API builds one MCP server, and every AI app can instantly discover and use its tools.",
    analogy: "Think of USB-C. Instead of having separate chargers for your phone, laptop, headphones, and mouse, a single universal plug connects everything seamlessly.",
    definition: "An open standard client-server protocol created by Anthropic. MCP standardizes secure bidirectional JSON-RPC communication between AI host applications (clients) and backend tool providers (servers) exposing tools, resources, and prompts over standard input/output (stdio) or Server-Sent Events (SSE).",
    practicalUsage: {
      scenario: "Connecting an agent to a local SQLite MCP server in JSON config",
      codeOrCommand: `{
  "mcpServers": {
    "sqlite-db": {
      "command": "uvx",
      "args": ["mcp-server-sqlite", "--db-path", "/var/data/production.db"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_xxxxxxxxxxxx"
      }
    }
  }
}`,
      explanation: "The agent reads this configuration, boots the servers as subprocesses, and automatically inherits all tools (query_db, create_issue, read_file) with full type schemas."
    },
    practicalTips: [
      "Use stdio transport for local tools (running on the same machine/container) and SSE (Server-Sent Events) for remote cloud servers.",
      "MCP servers expose three distinct primitives: Tools (executable functions), Resources (read-only files/data), and Prompts (reusable templates). Use Resources for static context to save tool overhead.",
      "Check the open-source MCP directory before building custom integrations; pre-built servers exist for PostgreSQL, Slack, Brave Search, Puppeteer, and AWS."
    ],
    misconceptions: [
      "Myth: MCP is an Anthropic-only proprietary lock-in. Reality: MCP is an open-source standard with SDKs in TypeScript, Python, and Go, supported across multiple AI runtimes and models."
    ],
    topics: ["agentic-ai"],
    type: "protocol",
    level: "intermediate",
    relatedTerms: ["tool-call", "ai-agent"],
    appearsIn: [
      { kind: "learning-path-module", title: "MCP (Model Context Protocol) integration", href: "/learning/paths/agentic-ai" }
    ]
  },
  {
    slug: "multi-agent-orchestration",
    term: "Multi-Agent Orchestration",
    summary: "Coordinating a team of specialized AI agents working together under a manager to solve massive projects.",
    plainEnglish: "Instead of asking one monolithic AI prompt to do research, write 1,000 lines of code, write unit tests, and design documentation, you deploy a team: a Researcher agent gathers data, a Coder agent writes the code, a Tester agent runs tests, and a Supervisor agent routes tasks between them.",
    analogy: "Like a software engineering department: the Engineering Manager breaks up the sprint tickets and assigns tasks to the backend dev, frontend dev, and QA tester, rather than one person doing every job alone.",
    definition: "An architectural pattern coordinating multiple specialized AI agents. A supervisor or router agent delegates discrete sub-tasks to worker agents with isolated context windows, preventing context bloat and specialization dilution before synthesizing their outputs into a final deliverable.",
    practicalUsage: {
      scenario: "Supervisor pattern routing user queries to specialized subagents",
      codeOrCommand: `class SupervisorOrchestrator:
    def __init__(self, researcher_agent, coder_agent, qa_agent):
        self.researcher = researcher_agent
        self.coder = coder_agent
        self.qa = qa_agent

    def execute(self, user_prompt):
        # 1. Delegate technical specs to researcher
        spec = self.researcher.run(f"Find API documentation for: {user_prompt}")
        
        # 2. Pass technical spec to specialized coding agent
        code = self.coder.run(f"Implement this specification:\\n{spec}")
        
        # 3. Pass generated code to QA tester
        review = self.qa.run(f"Write unit tests and find bugs in this code:\\n{code}")
        
        return {"spec": spec, "code": code, "test_results": review}`,
      explanation: "Each subagent operates within a small, focused context window, avoiding the prompt degradation that occurs when one model attempts every role."
    },
    practicalTips: [
      "Keep communication protocols minimal. Having 5 agents converse in an open chat room quickly explodes token costs and leads to infinite circular debates.",
      "Prefer hierarchical supervisor patterns (manager → worker) over decentralized swarms for production engineering tasks.",
      "Isolate subagent memories: do not pass the entire transcript of Agent A into Agent B; only pass the distilled final summary."
    ],
    misconceptions: [
      "Myth: More agents always equal better performance. Reality: Adding agents introduces communication latency and compounding error rates. If a single well-prompted model can do the job, do not use multi-agent orchestration."
    ],
    topics: ["agentic-ai"],
    type: "architecture_pattern",
    level: "advanced",
    relatedTerms: ["ai-agent", "planning-loop"],
    appearsIn: [
      { kind: "learning-path-module", title: "Multi-agent systems & supervisor patterns", href: "/learning/paths/agentic-ai" }
    ]
  },
  {
    slug: "agent-memory",
    term: "Agent Memory Systems",
    summary: "Giving AI agents short-term working scratchpads, long-term vector storage, and logs of past experiences.",
    plainEnglish: "By default, an AI completely forgets everything the moment a conversation ends. Memory systems give agents three types of memory: working memory (what it is doing right now), episodic memory (what happened in past tasks), and semantic memory (facts and guidelines stored in a database).",
    analogy: "Like human cognition: your working memory holds the sentence you're currently reading; your episodic memory remembers what you ate for breakfast; your semantic memory knows that Paris is the capital of France.",
    definition: "The state persistence architecture of an autonomous agent. Categorized into Working Memory (in-context prompt buffer and active variable state), Episodic Memory (chronological logs of past actions and tool outcomes), and Semantic Memory (vector database embeddings of persistent knowledge retrieved on demand).",
    practicalUsage: {
      scenario: "Retrieving user preferences from long-term agent memory",
      codeOrCommand: `class PersistentAgentMemory:
    def __init__(self, vector_store, user_id):
        self.vector_store = vector_store
        self.user_id = user_id

    def recall_relevant_context(self, current_task):
        # Retrieve past memories semantically similar to current task
        memories = self.vector_store.similarity_search(
            query=current_task,
            filter={"user_id": self.user_id},
            k=3
        )
        return "\\n".join([f"- Past experience: {m.content}" for m in memories])

    def store_experience(self, task, outcome):
        # Save learnings for future agent sessions
        self.vector_store.add(
            content=f"Task: {task} | Learned: {outcome}",
            metadata={"user_id": self.user_id}
        )`,
      explanation: "Before beginning a task, the agent recalls past mistakes and user preferences, preventing it from repeating previous errors."
    },
    practicalTips: [
      "Never dump raw chat logs into long-term memory. Use a background summarizer agent to distill sessions into compact key-value lessons: 'User prefers TypeScript with strict null checks.'",
      "Assign expiration dates (TTL) or importance decay scores to memories so outdated temporary facts don't pollute future retrievals."
    ],
    misconceptions: [
      "Myth: Updating an agent's memory means retraining or fine-tuning the model weights. Reality: Memory is external software storage (databases, JSON files, Redis) injected into the prompt dynamically at runtime."
    ],
    topics: ["agentic-ai"],
    type: "concept",
    level: "intermediate",
    relatedTerms: ["ai-agent", "vector-database"],
    appearsIn: [
      { kind: "learning-path-module", title: "Short-term vs. Long-term memory architecture", href: "/learning/paths/agentic-ai" }
    ]
  }
];
