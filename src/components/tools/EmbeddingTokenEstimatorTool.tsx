import { useState, useMemo, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, RotateCcw } from "lucide-react";

/* ── Approximate chars-per-token by tokenizer ─────────────────────────── */
const CHARS_PER_TOKEN: Record<string, number> = {
  cl100k_base: 4.0, // GPT-4 / text-embedding-ada-002
  llama3: 3.6, // Llama-3 tiktoken-like
  gemma: 4.2, // Gemma SentencePiece
  p50k_base: 4.0, // GPT-3.5 / text-davinci
  r50k_base: 4.3, // GPT-3
};

const EMBED_DIMS: Record<string, number> = {
  "text-embedding-3-small": 1536,
  "text-embedding-3-large": 3072,
  "text-embedding-ada-002": 1536,
  "nomic-embed": 768,
  "bge-large": 1024,
  "bge-small": 384,
  "e5-large": 1024,
  "gte-large": 1024,
  custom: 768,
};

export interface TokenInput {
  text: string;
  tokenizer: keyof typeof CHARS_PER_TOKEN;
  embedModel: keyof typeof EMBED_DIMS;
  customDim: number;
  chunkSize: number;
  chunkOverlap: number;
  bytesPerFloat: 2 | 4;
}

export interface TokenResult {
  estimatedTokens: number;
  numChunks: number;
  avgChunkTokens: number;
  embedDim: number;
  vectorBytes: number;
  vectorMb: number;
  totalStorageMb: number;
  chunks: string[];
}

const DEFAULTS: TokenInput = {
  text: "Kubernetes is an open-source container orchestration system for automating software deployment, scaling, and management. Originally designed by Google, the project is now maintained by the Cloud Native Computing Foundation. It works with a range of container runtimes and supports a wide variety of workloads.",
  tokenizer: "cl100k_base",
  embedModel: "text-embedding-3-small",
  customDim: 768,
  chunkSize: 256,
  chunkOverlap: 32,
  bytesPerFloat: 2,
};

function chunkText(text: string, size: number, overlap: number): string[] {
  if (size <= 0) return [text];
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const chunks: string[] = [];
  let i = 0;
  while (i < words.length) {
    const end = Math.min(i + size, words.length);
    chunks.push(words.slice(i, end).join(" "));
    if (end >= words.length) break;
    i = end - overlap;
    if (i < 0) i = 0;
  }
  return chunks;
}

export function calculateTokens(input: TokenInput): TokenResult {
  const cpt = CHARS_PER_TOKEN[input.tokenizer];
  const estimatedTokens = Math.ceil(input.text.length / cpt);
  const chunks = chunkText(input.text, input.chunkSize, input.chunkOverlap);
  const numChunks = chunks.length;
  const avgChunkTokens = numChunks > 0 ? Math.ceil(estimatedTokens / numChunks) : 0;
  const embedDim = input.embedModel === "custom" ? input.customDim : EMBED_DIMS[input.embedModel];
  const vectorBytes = numChunks * embedDim * input.bytesPerFloat;
  const vectorMb = vectorBytes / 1e6;
  // Storage includes metadata overhead (~10%)
  const totalStorageMb = vectorMb * 1.1;

  return {
    estimatedTokens,
    numChunks,
    avgChunkTokens,
    embedDim,
    vectorBytes,
    vectorMb,
    totalStorageMb,
    chunks,
  };
}

export function EmbeddingTokenEstimatorTool() {
  const [input, setInput] = useState<TokenInput>(DEFAULTS);
  const result = useMemo(() => calculateTokens(input), [input]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(
      JSON.stringify(
        {
          estimatedTokens: result.estimatedTokens,
          numChunks: result.numChunks,
          avgChunkTokens: result.avgChunkTokens,
          embedDim: result.embedDim,
          vectorStorageMb: result.totalStorageMb.toFixed(3),
        },
        null,
        2,
      ),
    );
  }, [result]);

  const reset = () => setInput(DEFAULTS);

  return (
    <Card className="p-6 space-y-6">
      <div>
        <Label htmlFor="text">Input text</Label>
        <textarea
          id="text"
          rows={4}
          value={input.text}
          onChange={(e) => setInput({ ...input, text: e.target.value })}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Paste text to estimate tokens and chunk splits..."
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="tokenizer">Tokenizer</Label>
          <select
            id="tokenizer"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={input.tokenizer}
            onChange={(e) =>
              setInput({ ...input, tokenizer: e.target.value as TokenInput["tokenizer"] })
            }
          >
            <option value="cl100k_base">cl100k_base (GPT-4)</option>
            <option value="llama3">Llama-3</option>
            <option value="gemma">Gemma</option>
            <option value="p50k_base">p50k_base (GPT-3.5)</option>
            <option value="r50k_base">r50k_base (GPT-3)</option>
          </select>
        </div>
        <div>
          <Label htmlFor="embed">Embedding model</Label>
          <select
            id="embed"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={input.embedModel}
            onChange={(e) =>
              setInput({ ...input, embedModel: e.target.value as TokenInput["embedModel"] })
            }
          >
            <option value="text-embedding-3-small">text-embedding-3-small (1536)</option>
            <option value="text-embedding-3-large">text-embedding-3-large (3072)</option>
            <option value="text-embedding-ada-002">ada-002 (1536)</option>
            <option value="nomic-embed">nomic-embed (768)</option>
            <option value="bge-large">bge-large (1024)</option>
            <option value="bge-small">bge-small (384)</option>
            <option value="e5-large">e5-large (1024)</option>
            <option value="gte-large">gte-large (1024)</option>
            <option value="custom">Custom dim</option>
          </select>
        </div>
        {input.embedModel === "custom" && (
          <div>
            <Label htmlFor="customDim">Custom dim</Label>
            <Input
              id="customDim"
              type="number"
              min={1}
              value={input.customDim}
              onChange={(e) => setInput({ ...input, customDim: parseInt(e.target.value) || 1 })}
            />
          </div>
        )}
        <div>
          <Label htmlFor="chunkSize">Chunk size (tokens)</Label>
          <Input
            id="chunkSize"
            type="number"
            min={1}
            value={input.chunkSize}
            onChange={(e) => setInput({ ...input, chunkSize: parseInt(e.target.value) || 1 })}
          />
        </div>
        <div>
          <Label htmlFor="overlap">Chunk overlap (tokens)</Label>
          <Input
            id="overlap"
            type="number"
            min={0}
            value={input.chunkOverlap}
            onChange={(e) => setInput({ ...input, chunkOverlap: parseInt(e.target.value) || 0 })}
          />
        </div>
        <div>
          <Label htmlFor="bpf">Vector precision</Label>
          <select
            id="bpf"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={input.bytesPerFloat}
            onChange={(e) => setInput({ ...input, bytesPerFloat: Number(e.target.value) as 2 | 4 })}
          >
            <option value={2}>FP16 (2 bytes)</option>
            <option value={4}>FP32 (4 bytes)</option>
          </select>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2" aria-live="polite">
        <Row label="Estimated tokens" value={result.estimatedTokens.toLocaleString()} mono />
        <Row label="Number of chunks" value={String(result.numChunks)} mono />
        <Row label="Avg tokens / chunk" value={result.avgChunkTokens.toLocaleString()} mono />
        <Row label="Embedding dimension" value={String(result.embedDim)} mono />
        <div className="my-2 border-t border-border" />
        <Row
          label="Vector DB storage"
          value={`${result.totalStorageMb.toFixed(3)} MB`}
          bold
          accent
        />
      </div>

      {result.chunks.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-semibold text-foreground">Chunk preview</p>
          <div className="max-h-48 space-y-2 overflow-y-auto rounded-md border border-border bg-background p-3">
            {result.chunks.slice(0, 6).map((c, i) => (
              <div key={i} className="text-xs">
                <span className="mr-2 rounded bg-secondary px-1.5 py-0.5 font-mono text-muted-foreground">
                  #{i + 1}
                </span>
                <span className="text-muted-foreground">{c}</span>
              </div>
            ))}
            {result.chunks.length > 6 && (
              <p className="text-xs text-muted-foreground">
                …and {result.chunks.length - 6} more chunks
              </p>
            )}
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={handleCopy}>
          <Copy className="mr-2 h-4 w-4" /> Copy summary
        </Button>
        <Button variant="outline" size="sm" onClick={reset}>
          <RotateCcw className="mr-2 h-4 w-4" /> Reset
        </Button>
      </div>
    </Card>
  );
}

function Row({
  label,
  value,
  bold,
  accent,
  mono,
}: {
  label: string;
  value: string;
  bold?: boolean;
  accent?: boolean;
  mono?: boolean;
}) {
  return (
    <div className="flex justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span
        className={[
          "text-sm",
          bold ? "font-bold" : "font-semibold",
          mono ? "font-mono" : "",
          accent ? "text-accent" : "text-foreground",
        ].join(" ")}
      >
        {value}
      </span>
    </div>
  );
}

export default EmbeddingTokenEstimatorTool;
