import type { CheatSheet } from "../cheatsheet-types";

export const genAiCheatSheet: CheatSheet = {
  topicSlug: "gen-ai",
  topicName: "Gen AI",
  description: "Quick reference guide for prompt engineering, sampling hyperparameters, Transformer math, RAG architecture, and fine-tuning.",
  lastUpdated: "2026-07-25",
  sections: [
    {
      title: "Sampling Hyperparameters",
      items: [
        { command: "Temperature (T = 0.0 – 0.2)", description: "Deterministic, greedy decoding. Best for code, math, factual extraction, and JSON schema formatting.", relatedGlossaryTerm: "temperature" },
        { command: "Temperature (T = 0.7 – 1.0)", description: "Higher entropy and creative variance. Best for brainstorming, creative writing, and open synthesis.", relatedGlossaryTerm: "temperature" },
        { command: "Top-P / Nucleus (P = 0.9)", description: "Truncates long-tail low-probability tokens by dynamically sampling top cumulative 90% probability mass.", relatedGlossaryTerm: "top-p-sampling" },
        { command: "Presence Penalty (-2.0 – 2.0)", description: "Penalizes tokens based on presence in generated text; positive values force model to introduce new topics." },
        { command: "Frequency Penalty (-2.0 – 2.0)", description: "Penalizes tokens based on exact occurrence count; positive values reduce verbatim word repetition." }
      ]
    },
    {
      title: "RAG Pipeline Steps",
      items: [
        { command: "1. Document Chunking", description: "Split raw corpus using recursive character splitting (500–1000 tokens) with 10–20% chunk overlap.", relatedGlossaryTerm: "rag" },
        { command: "2. Dense Embedding", description: "Convert chunks into dense vectors using embedding models (e.g. text-embedding-3-small).", relatedGlossaryTerm: "embedding" },
        { command: "3. Vector Indexing (HNSW)", description: "Index embeddings in vector store using Hierarchical Navigable Small World graphs for fast ANN lookups.", relatedGlossaryTerm: "vector-database" },
        { command: "4. Similarity Search", description: "Query vector DB via Cosine Distance or Inner Product to fetch Top-K (K=3–5) context chunks.", relatedGlossaryTerm: "vector-database" },
        { command: "5. Prompt Synthesis", description: "Inject retrieved context chunks into System/User prompt template before executing generation.", relatedGlossaryTerm: "context-window" }
      ]
    },
    {
      title: "Prompt Engineering Patterns",
      items: [
        { command: "Role & Persona Pattern", description: "Begin prompt with explicit expert domain role (e.g. 'You are a Principal Kubernetes Architect...')." },
        { command: "Few-Shot Examples Pattern", description: "Provide 2–3 input/output demonstration pairs prior to presenting the target problem query." },
        { command: "Chain-of-Thought (CoT)", description: "Append 'Think step-by-step before producing your final answer' to force reasoning before generation." },
        { command: "Structured JSON Output", description: "Specify explicit JSON schema structure in system prompt and set `response_format: { type: 'json_object' }`." }
      ]
    },
    {
      title: "Transformer & Attention Formulas",
      items: [
        { command: "Scaled Dot-Product Attention", description: "Softmax((Q * K^T) / sqrt(d_k)) * V — computes pairwise contextual token weights.", relatedGlossaryTerm: "attention-mechanism" },
        { command: "Multi-Head Attention", description: "Concat(head_1, ..., head_h) * W_O — projects queries/keys/values into parallel sub-spaces.", relatedGlossaryTerm: "transformer" },
        { command: "LoRA Weight Update", description: "W = W_0 + (B * A) * (alpha / r) — trains low-rank adapter matrices while keeping base weights frozen.", relatedGlossaryTerm: "lora" }
      ]
    }
  ]
};
