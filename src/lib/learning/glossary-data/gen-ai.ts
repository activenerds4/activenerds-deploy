import type { GlossaryEntry } from "../glossary-types";

export const genAiGlossary: GlossaryEntry[] = [
  {
    slug: "transformer",
    term: "Transformer Architecture",
    summary: "The foundational neural architecture behind modern LLMs that processes entire sentences at once instead of word-by-word.",
    plainEnglish: "Before Transformers, AI read text like a person with tunnel vision: one word at a time, forgetting the beginning of a paragraph by the time it reached the end. Transformers look at an entire document simultaneously, calculating how every single word relates to every other word at the exact same instant.",
    analogy: "Think of a conference room where everyone speaks at once, but you have magical ears that instantly gauge how important each person's statement is relative to every other topic being discussed, without waiting for turns.",
    definition: "Introduced in the 2017 paper 'Attention Is All You Need', the Transformer replaced recurrent neural networks (RNNs) and LSTMs with stacked self-attention and feed-forward layers. Because it does not process tokens sequentially, it can be parallelized across thousands of GPUs, unlocking the massive parameter scaling of GPT-4, Claude, and Llama.",
    practicalUsage: {
      scenario: "Inspecting hidden states and attention layers of a local transformer in Python",
      codeOrCommand: `from transformers import AutoModel, AutoTokenizer

model_name = "bert-base-uncased"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModel.from_pretrained(model_name, output_attentions=True)

inputs = tokenizer("ActiveNerds builds production AI systems.", return_tensors="pt")
outputs = model(**inputs)

# outputs.attentions contains a tuple of shape [batch, num_heads, seq_len, seq_len]
print(f"Number of Transformer layers: {len(outputs.attentions)}")
print(f"Layer 0 Attention shape: {outputs.attentions[0].shape}")`,
      explanation: "By setting output_attentions=True, you can directly inspect the attention weights showing which tokens the model focused on when interpreting a given word."
    },
    practicalTips: [
      "Transformers have an O(N²) memory and compute bottleneck with sequence length. If you're processing 32k+ tokens, look for models using FlashAttention-2 or ring attention to avoid quadratic memory spikes.",
      "Encoder-only models (BERT) excel at classification and embeddings; decoder-only models (GPT, Llama, Mistral) excel at text generation and code synthesis.",
      "Self-attention layers compute Q, K, and V matrices. Most inference RAM during generation is eaten by caching the K and V matrices (KV Cache), not the model weights themselves."
    ],
    misconceptions: [
      "Myth: Transformers actually 'understand' grammar rules and facts. Reality: They are statistical sequence predictors trained on next-token likelihood that learn implicit latent representations of grammatical and factual structures.",
      "Myth: Transformers are strictly for text. Reality: Vision Transformers (ViT), audio models (Whisper), and multimodal diffusion models all use the exact same attention mathematics on sliced image patches and audio spectrograms."
    ],
    topics: ["gen-ai"],
    type: "architecture_pattern",
    level: "intermediate",
    relatedTerms: ["attention-mechanism", "token", "embedding"],
    appearsIn: [
      { kind: "learning-path-module", title: "Transformer architecture from scratch", href: "/learning/paths/gen-ai" }
    ]
  },
  {
    slug: "attention-mechanism",
    term: "Self-Attention Mechanism",
    summary: "The mathematical formula that lets each word in a prompt query and absorb meaning from surrounding words.",
    plainEnglish: "In the sentence 'The bank of the river overflowed', how does the AI know 'bank' isn't a financial institution? Self-attention calculates a relevance score between 'bank' and 'river', pulling context from 'river' into 'bank' before generating the next word.",
    analogy: "Like a search engine inside a sentence: every word submits a query ('What context do I need?'), matches against everyone else's keys ('Here is what I describe'), and pulls the corresponding values into its own meaning.",
    definition: "Self-attention computes dynamic weights by taking three linear projections of each token: Query (Q), Key (K), and Value (V). The formula Softmax((Q × Kᵀ) / √d_k) × V computes pairwise compatibility scores scaled by the square root of dimension size to prevent vanishing gradients during softmax.",
    practicalUsage: {
      scenario: "Visualizing why attention heads focus on specific words",
      codeOrCommand: `# PyTorch pseudo-math representation of scaled dot-product attention
import torch
import torch.nn.functional as F

Q = torch.randn(1, 8, 64)  # [batch, seq_len, head_dim]
K = torch.randn(1, 8, 64)
V = torch.randn(1, 8, 64)

# Compute raw attention scores
scores = torch.matmul(Q, K.transpose(-2, -1)) / (64 ** 0.5)
attention_weights = F.softmax(scores, dim=-1)

# Weighted blend of values
context = torch.matmul(attention_weights, V)
print(f"Context vector shape: {context.shape}")`,
      explanation: "Each token gathers a weighted average of all other tokens' values based on how well its Query matched their Keys."
    },
    practicalTips: [
      "Multi-head attention splits the vector into multiple sub-spaces (e.g. 32 heads of 128 dims each). This allows one head to track pronoun references while another tracks verb tenses simultaneously.",
      "Cross-attention differs from self-attention: in cross-attention, Queries come from one sequence (e.g. user prompt), while Keys and Values come from another (e.g. an image or audio encoder)."
    ],
    misconceptions: [
      "Myth: Every attention head learns human-interpretable linguistic concepts. Reality: While some heads specialize in punctuation or syntax, many learn abstract distributed representations that defy simple human labeling."
    ],
    topics: ["gen-ai"],
    type: "concept",
    level: "intermediate",
    relatedTerms: ["transformer", "token", "embedding"],
    appearsIn: [
      { kind: "learning-path-module", title: "Self-attention & multi-head attention math", href: "/learning/paths/gen-ai" }
    ]
  },
  {
    slug: "token",
    term: "Token",
    summary: "The atomic pieces of words, syllables, or code that language models actually read and generate.",
    plainEnglish: "AI models don't read words or letters directly. They chop text into bite-sized character fragments called tokens. A common word like 'the' is 1 token, while an unusual word or code snippet like 'getPublicUserData()' might be broken into 5 separate tokens.",
    analogy: "Like Lego bricks for language. Common words have their own pre-molded brick, while rare words are assembled by snapping smaller letter blocks together.",
    definition: "The fundamental unit of vocabulary in language models. Tokenizers like Byte-Pair Encoding (BPE) or WordPiece take arbitrary UTF-8 text and map sub-word substrings to unique integer IDs in a fixed vocabulary (typically 32,000 to 128,000 entries).",
    practicalUsage: {
      scenario: "Checking token count before sending a prompt to OpenAI or Anthropic API",
      codeOrCommand: `import tiktoken

encoding = tiktoken.encoding_for_model("gpt-4o")
text = "ActiveNerds: Building hands-on AI infrastructure."
tokens = encoding.encode(text)

print(f"Token count: {len(tokens)}")
print(f"Token IDs: {tokens}")
print(f"Decoded pieces: {[encoding.decode([t]) for t in tokens]}")`,
      explanation: "Inspecting decoded token pieces reveals exactly where words were split, helping explain why typos, numbers, and indentation cost more tokens."
    },
    practicalTips: [
      "Rule of thumb for English text: 1 token is roughly 0.75 words, or 100 tokens is approximately 75 words. For non-English languages and code, token usage is often 2x to 5x higher.",
      "Leading whitespace matters: ' hello' and 'hello' are two completely distinct tokens in most BPE tokenizers. Trailing spaces in prompts can degrade model completion quality.",
      "Numbers and arithmetic are notoriously tricky because models tokenize digits irregularly (e.g. '12345' might tokenize as '12', '34', '5')."
    ],
    misconceptions: [
      "Myth: One token equals one word. Reality: Punctuation, capitalization changes, code indentation, and uncommon names split into multiple tokens.",
      "Myth: Large vocabularies are always better. Reality: Bigger vocabularies increase embedding layer memory usage and can cause rare tokens to receive inadequate training updates."
    ],
    topics: ["gen-ai"],
    type: "concept",
    level: "beginner",
    relatedTerms: ["embedding", "context-window"],
    appearsIn: [
      { kind: "learning-path-module", title: "Tokenization & embeddings", href: "/learning/paths/gen-ai" }
    ]
  },
  {
    slug: "embedding",
    term: "Vector Embedding",
    summary: "A list of floating-point numbers that captures the semantic meaning and intent of a piece of text.",
    plainEnglish: "Computers can't measure how 'close' the meaning of 'puppy' is to 'dog' using letters. An embedding translates words or paragraphs into coordinates on a multi-dimensional map. Concepts with similar meanings land near each other, while unrelated topics land far apart.",
    analogy: "Imagine an enormous library where books aren't arranged alphabetically, but by mood and subject: romantic poetry in one corner, Linux kernel debugging in the opposite corner, and systems programming right next to operating systems.",
    definition: "A dense numerical vector representation in continuous high-dimensional space (e.g. 768, 1536, or 3072 dimensions). Generated by dedicated embedding models (like OpenAI text-embedding-3 or BAAI/bge-large), where cosine similarity between vectors mathematically corresponds to conceptual proximity.",
    practicalUsage: {
      scenario: "Generating embeddings and measuring semantic similarity with cosine distance",
      codeOrCommand: `import numpy as np
from openai import OpenAI

client = OpenAI()

def get_embedding(text):
    res = client.embeddings.create(input=text, model="text-embedding-3-small")
    return np.array(res.data[0].embedding)

vec_king = get_embedding("Kubernetes deployment")
vec_queen = get_embedding("Container orchestration")
vec_food = get_embedding("Chocolate chip cookies")

def cosine_sim(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

print("K8s vs Container similarity:", cosine_sim(vec_king, vec_queen)) # ~0.82
print("K8s vs Cookies similarity:", cosine_sim(vec_king, vec_food))    # ~0.15`,
      explanation: "High cosine similarity indicates overlapping topical intent, enabling search by concept rather than exact keyword matches."
    },
    practicalTips: [
      "Always normalize your embedding vectors before inserting them into a vector database. When vectors are unit-length (||v|| = 1), cosine similarity simplifies to a blazingly fast dot product.",
      "Do not compare embeddings generated from different models. A vector from OpenAI text-embedding-3-small cannot be matched with text-embedding-ada-002 or Cohere Embed.",
      "For search systems, consider hybrid search: combine vector embedding similarity (semantic) with BM25 keyword matching to avoid missing exact product codes or error numbers."
    ],
    misconceptions: [
      "Myth: Embeddings understand logic and negation. Reality: 'I love this product' and 'I do NOT love this product' often have very high vector similarity because both discuss product satisfaction sentiment."
    ],
    topics: ["gen-ai"],
    type: "concept",
    level: "beginner",
    relatedTerms: ["token", "rag", "vector-database"],
    appearsIn: [
      { kind: "learning-path-module", title: "Tokenization & embeddings", href: "/learning/paths/gen-ai" }
    ]
  },
  {
    slug: "rag",
    term: "RAG (Retrieval-Augmented Generation)",
    summary: "A pattern that fetches relevant real-time company facts from a database and pastes them into the prompt before the AI answers.",
    plainEnglish: "Instead of retraining a billion-dollar model whenever your company updates a document, RAG works like an open-book exam. When a user asks a question, your system searches your internal manuals for the top 3 relevant paragraphs, glues them into the prompt, and tells the AI: 'Answer strictly using this reference text.'",
    analogy: "Like a lawyer who doesn't memorize every tax law in the country, but has an exceptional paralegal who instantly pulls the exact case files off the shelf before the lawyer speaks to the judge.",
    definition: "An architecture pattern combining vector retrieval with generative language models. Documents are chunked, embedded, and indexed. At inference time, user queries are embedded to retrieve top-k semantically relevant chunks via approximate nearest neighbor search, which are injected into the LLM context window alongside instructions to prevent hallucination.",
    practicalUsage: {
      scenario: "Building a minimal RAG prompt pipeline in Python",
      codeOrCommand: `# 1. User query comes in
user_query = "What is our company's refund policy on enterprise annual plans?"

# 2. Retrieve top matching chunks from vector database
retrieved_chunks = [
    "Enterprise annual agreements are non-refundable after 30 calendar days from contract signature.",
    "Early termination requires 60-day written notice to account-management@company.com."
]

# 3. Assemble augmented prompt
prompt = f"""You are a helpful customer support agent. Answer the question using ONLY the provided context. If the answer is not in the context, say 'I cannot find that in our policy docs.'

Context:
{"\\n---\\n".join(retrieved_chunks)}

Question: {user_query}
Answer:"""`,
      explanation: "By grounding the LLM in retrieved facts, responses remain accurate, up-to-date, and auditable without fine-tuning."
    },
    practicalTips: [
      "Chunking strategy makes or breaks RAG. Too large chunks dilute semantic signal; too small chunks lose surrounding context. Aim for 300-600 tokens with 10-20% overlap.",
      "Always implement a re-ranker (like Cohere Rerank or BGE-Reranker) on the top 20 retrieved chunks to pick the final top 5 before sending them to the LLM.",
      "Include source document IDs and page numbers in chunk metadata so the LLM can generate verifiable citations."
    ],
    misconceptions: [
      "Myth: RAG eliminates 100% of hallucinations. Reality: If the retrieval returns irrelevant chunks or conflicting documentation, the LLM will still extrapolate or confabulate.",
      "Myth: RAG is a replacement for fine-tuning. Reality: RAG provides external knowledge and facts; fine-tuning teaches tone, formatting, and specialized task syntax."
    ],
    topics: ["gen-ai", "agentic-ai"],
    type: "architecture_pattern",
    level: "intermediate",
    relatedTerms: ["embedding", "context-window", "vector-database"],
    appearsIn: [
      { kind: "learning-path-module", title: "RAG pipelines: Chunking, Vector DBs & Generation", href: "/learning/paths/gen-ai" }
    ]
  },
  {
    slug: "context-window",
    term: "Context Window",
    summary: "The maximum amount of text an AI model can read and write in a single conversation turn.",
    plainEnglish: "The context window is the working memory of an LLM. Everything the model knows during a conversation—system instructions, chat history, pasted files, and its own output—must fit inside this window. Once you exceed it, the conversation either truncates or crashes with an error.",
    analogy: "Like the surface of your physical desk. You can only spread out so many open pages at one time. If you want to put down a new textbook, you have to pack away an older folder into a drawer.",
    definition: "The maximum sequence length (measured in tokens) an LLM can process across input (prompt) and output (generation) in a single inference step. Modern models feature windows ranging from 8k tokens up to 1M or 2M tokens (e.g. Gemini 1.5 Pro, Claude 3.5 Sonnet).",
    practicalUsage: {
      scenario: "Sliding-window buffer to keep conversation within context limits",
      codeOrCommand: `class ConversationBuffer:
    def __init__(self, max_tokens=8000):
        self.messages = []
        self.max_tokens = max_tokens

    def add_message(self, role, content, token_count):
        self.messages.append({"role": role, "content": content, "tokens": token_count})
        
        # Evict oldest non-system messages when exceeding threshold
        total = sum(m["tokens"] for m in self.messages)
        while total > self.max_tokens and len(self.messages) > 1:
            evicted = self.messages.pop(1) # preserve system prompt at index 0
            total -= evicted["tokens"]
            print(f"Evicted message to save {evicted['tokens']} tokens")`,
      explanation: "Managing your context budget proactively prevents unexpected API errors and preserves system prompt instructions across long chats."
    },
    practicalTips: [
      "Beware the 'Lost in the Middle' effect: LLMs remember information placed at the very beginning and very end of long contexts much better than information buried in the middle 50%.",
      "Larger context windows cost more money and increase time-to-first-token (TTFT). Don't dump a 500-page PDF into a prompt if a 2-page RAG retrieval suffices.",
      "Input tokens are processed in parallel (fast prefill), but output tokens are generated sequentially one by one (slow decode)."
    ],
    misconceptions: [
      "Myth: A 1M token context window means you never need a database or RAG again. Reality: Dumping 1M tokens into every request is slow, costs dollars per query, and suffers from lower recall accuracy than targeted vector retrieval."
    ],
    topics: ["gen-ai"],
    type: "concept",
    level: "beginner",
    relatedTerms: ["token", "rag"],
    appearsIn: [
      { kind: "learning-path-module", title: "Prompt Engineering & In-Context Learning", href: "/learning/paths/gen-ai" }
    ]
  },
  {
    slug: "temperature",
    term: "Temperature (Sampling)",
    summary: "The knob that controls how predictable or creative an AI's word choices are.",
    plainEnglish: "When picking the next token, the model calculates probabilities for hundreds of words. Temperature=0 makes the model choose the single most likely word every time (strict, reproducible, factual). Temperature=1 flattens the odds, letting less obvious words win (creative, diverse, conversational).",
    analogy: "Like a spice slider in cooking: at 0 it is plain boiled chicken (safe, consistent, predictable); at 0.9 it is a spicy fusion recipe (surprising, fun, but occasionally overcooked).",
    definition: "A hyperparameter that divides raw unnormalized output logits (z_i) by scalar T before the softmax function: P(y_i) = e^(z_i / T) / Σ(e^(z_j / T)). As T approaches 0, the distribution collapses to an argmax one-hot vector (strictly picking the top token). As T increases, probabilities flatten toward a uniform distribution.",
    practicalUsage: {
      scenario: "Setting the ideal temperature depending on application use-case",
      codeOrCommand: `# 1. Structured JSON extraction or SQL queries: strict reproducibility
sql_completion = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Extract customer id as JSON"}],
    temperature=0.0  # Zero randomness: deterministic outputs
)

# 2. Marketing brainstorm or creative story writing
creative_completion = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Generate 10 catchy SaaS slogans"}],
    temperature=0.8  # Elevated variance: creative phrasing
)`,
      explanation: "Always use temperature=0 (or 0.1) for code generation, JSON output, and classification tasks where hallucinations cause downstream crashes."
    },
    practicalTips: [
      "Never crank temperature above 1.2 on modern chat models; it causes incoherent syntax, punctuation loops, and random gibberish.",
      "If you adjust temperature, leave top_p at default 1.0 (or adjust top_p and leave temperature at 1.0). Tweaking both simultaneously makes tuning difficult.",
      "Even at temperature=0, proprietary hosted APIs (like OpenAI) may not be 100% bit-for-bit deterministic due to GPU floating-point non-associativity across dynamic batch clusters."
    ],
    misconceptions: [
      "Myth: Temperature 0 prevents all hallucinations. Reality: Temperature 0 only forces the model to pick its most confident prediction; if the model's base training contains a false belief, it will repeat it with 100% confidence."
    ],
    topics: ["gen-ai"],
    type: "concept",
    level: "intermediate",
    relatedTerms: ["top-p-sampling"],
    appearsIn: [
      { kind: "learning-path-module", title: "Inference sampling: Temperature, Top-P, Top-K", href: "/learning/paths/gen-ai" }
    ]
  },
  {
    slug: "top-p-sampling",
    term: "Top-P (Nucleus) Sampling",
    summary: "A filter that discards weird, low-probability words by only considering candidate tokens up to a cumulative probability threshold.",
    plainEnglish: "Imagine an AI wants to pick the next word. The top 3 words ('apple', 'banana', 'orange') account for 90% of all likelihood, while 50,000 weird words account for the remaining 10%. Top-P=0.9 cuts off the long tail of bizarre options completely, guaranteeing the model never accidentally selects a nonsensical word.",
    analogy: "Like inviting only the top students whose combined test scores make up 90% of the class grade to represent the school, and leaving everyone else at home.",
    definition: "Nucleus sampling dynamically selects the smallest subset of vocabulary tokens whose cumulative softmax probability exceeds threshold P (e.g. 0.9). Unlike Top-K (which keeps a fixed number of tokens regardless of confidence), Top-P dynamically expands when multiple words are equally plausible and contracts when one word is obvious.",
    practicalUsage: {
      scenario: "Configuring Top-P sampling in vLLM or OpenAI API",
      codeOrCommand: `from openai import OpenAI

client = OpenAI()

response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[{"role": "user", "content": "Explain why trees lose leaves in autumn"}],
    top_p=0.85,    # Nucleus cut-off: ignores the bottom 15% long-tail tokens
    temperature=1.0 # Standard temperature
)
print(response.choices[0].message.content)`,
      explanation: "Top-P ensures the model stays creative while eliminating bizarre fringe tokens that cause hallucinations."
    },
    practicalTips: [
      "For code generation and technical troubleshooting, use top_p=0.1 or 0.2 to tightly constrain vocabulary to standard library functions and valid syntax.",
      "Top-P adapts dynamically: when predicting the word following 'United States of', the probability of 'America' is ~99%, so the pool shrinks to 1 token. For an open sentence, the pool expands automatically."
    ],
    misconceptions: [
      "Myth: Top-P and Top-K are identical. Reality: Top-K always keeps exactly K tokens (e.g. 40), even if the 40th token only has a 0.0001% chance of making sense. Top-P dynamically resizes based on model certainty."
    ],
    topics: ["gen-ai"],
    type: "concept",
    level: "intermediate",
    relatedTerms: ["temperature"],
    appearsIn: [
      { kind: "learning-path-module", title: "Inference sampling: Temperature, Top-P, Top-K", href: "/learning/paths/gen-ai" }
    ]
  },
  {
    slug: "fine-tuning",
    term: "Fine-Tuning (SFT)",
    summary: "Teaching an existing foundational model new behaviors, styles, or domain syntax by training it on hundreds of curated examples.",
    plainEnglish: "Pre-training teaches an AI general grammar and internet facts (costing millions of dollars). Fine-tuning takes that finished model and runs a quick training course using your company's support transcripts or code style, teaching it how you want it to talk and format answers.",
    analogy: "Like hiring a college graduate with a degree in computer science (base model), then giving them a 2-week internal bootcamp on your company's proprietary microservice conventions (fine-tuning).",
    definition: "Supervised Fine-Tuning (SFT) continues the backpropagation training process on an already pre-trained foundation model using pairs of structured prompt-response demonstrations. It updates the internal weight matrices to steer behavior, tone, domain terminology, and structured schema adherence.",
    practicalUsage: {
      scenario: "Preparing a JSONL dataset for fine-tuning a custom conversational model",
      codeOrCommand: `# dataset.jsonl format
{"messages": [
  {"role": "system", "content": "You are ActiveNerds Support. Reply strictly in markdown tables."},
  {"role": "user", "content": "Status of cluster worker-02?"},
  {"role": "assistant", "content": "| Node | Status | CPU Load |\\n|---|---|---|\\n| worker-02 | Healthy | 42% |"}
]}
{"messages": [
  {"role": "system", "content": "You are ActiveNerds Support. Reply strictly in markdown tables."},
  {"role": "user", "content": "Status of redis-cache?"},
  {"role": "assistant", "content": "| Node | Status | CPU Load |\\n|---|---|---|\\n| redis-cache | Degraded | 91% |"}
]}`,
      explanation: "Consistent input/output pairs train the model to reliably follow rigid stylistic formatting without needing verbose prompt instructions."
    },
    practicalTips: [
      "Data quality trumps data quantity: 500 clean, human-reviewed examples will outperform 50,000 noisy, synthetic examples every single time.",
      "Don't fine-tune to teach facts or live data (use RAG for that). Fine-tune to teach style, format, specialized classification labels, or niche programming languages.",
      "Always reserve 10-20% of your dataset for validation to monitor validation loss and catch overfitting early."
    ],
    misconceptions: [
      "Myth: Fine-tuning is the best way to give an AI company documents. Reality: Models fine-tuned on factual text still hallucinate details and cannot cite sources. RAG is vastly superior for knowledge retrieval."
    ],
    topics: ["gen-ai"],
    type: "concept",
    level: "advanced",
    relatedTerms: ["lora", "rlhf"],
    appearsIn: [
      { kind: "learning-path-module", title: "Fine-tuning & LoRA adaptation", href: "/learning/paths/gen-ai" }
    ]
  },
  {
    slug: "lora",
    term: "LoRA (Low-Rank Adaptation)",
    summary: "A smart fine-tuning shortcut that freezes 99% of the model and only trains tiny adapter layers, saving thousands of dollars in GPU costs.",
    plainEnglish: "Full fine-tuning requires modifying all 70 billion parameters of a model, demanding a room full of enterprise GPUs. LoRA freezes the original model completely and clips on tiny 'adapter' layers on the side. You train only the adapters (less than 1% of the weights) on a single consumer GPU, getting 95% of the performance.",
    analogy: "Instead of repainting and rebuilding an entire car, you attach custom clip-on aerodynamic spoilers and roof racks. You can swap them on and off in minutes without altering the chassis.",
    definition: "A Parameter-Efficient Fine-Tuning (PEFT) method. For a frozen weight matrix W₀ of shape d × k, LoRA decomposes the weight update ΔW into two low-rank matrices: ΔW = B × A, where B is d × r and A is r × k with rank r ≪ min(d, k).",
    practicalUsage: {
      scenario: "Configuring a LoRA adapter with HuggingFace PEFT in Python",
      codeOrCommand: `from peft import LoraConfig, get_peft_model
from transformers import AutoModelForCausalLM

base_model = AutoModelForCausalLM.from_pretrained("meta-llama/Meta-Llama-3-8B")

lora_config = LoraConfig(
    r=16,                         # Rank: lower rank = smaller file & less memory
    lora_alpha=32,                # Scaling factor
    target_modules=["q_proj", "v_proj"], # Target attention projection weights
    lora_dropout=0.05,
    bias="none",
    task_type="CAUSAL_LM"
)

model = get_peft_model(base_model, lora_config)
model.print_trainable_parameters()
# Trainable params: ~3,400,000 || All params: 8,030,000,000 || Trainable%: 0.042%`,
      explanation: "Training only 0.04% of the parameters shrinks GPU VRAM requirements from 80GB down to a standard 16GB-24GB graphics card."
    },
    practicalTips: [
      "LoRA adapters are tiny (typically 20MB to 200MB) compared to 15GB-30GB base models. You can store 50 different customer adapters on a single server and hot-swap them at runtime.",
      "Rank r=8 or r=16 is the sweet spot for most tasks. Increasing r beyond 64 rarely improves accuracy and increases memory usage.",
      "For deployment, you can merge the LoRA adapter weights directly into the base model weights with model.merge_and_unload(), eliminating inference latency overhead."
    ],
    misconceptions: [
      "Myth: LoRA is inferior to full fine-tuning. Reality: Empirical benchmarks show LoRA often matches or even exceeds full fine-tuning because freezing base weights prevents catastrophic forgetting."
    ],
    topics: ["gen-ai"],
    type: "architecture_pattern",
    level: "advanced",
    relatedTerms: ["fine-tuning"],
    appearsIn: [
      { kind: "learning-path-module", title: "Fine-tuning & LoRA adaptation", href: "/learning/paths/gen-ai" }
    ]
  },
  {
    slug: "rlhf",
    term: "RLHF (Reinforcement Learning from Human Feedback)",
    summary: "The training phase that turns a raw, rambling text predictor into a polite, helpful, and safe chat assistant.",
    plainEnglish: "Base models trained on raw internet text love to generate toxic rants, conspiracy theories, and endless autocomplete loops. RLHF has humans rate which answers are helpful and harmless. An algorithm rewards the AI whenever it behaves like a great assistant and penalizes it when it goes off the rails.",
    analogy: "Like dog training with treats: when the puppy sits politely, it gets a biscuit (+1 reward). When it jumps on the dinner table, it gets a firm 'no' (-1 penalty). Over time, it learns good household manners.",
    definition: "An alignment methodology that trains a separate Reward Model on pairwise human preference rankings (chosen vs. rejected responses). The policy model is then optimized via Proximal Policy Optimization (PPO) or Direct Preference Optimization (DPO) to maximize reward while constraining divergence from the base reference policy.",
    practicalUsage: {
      scenario: "Direct Preference Optimization (DPO) dataset format",
      codeOrCommand: `# dpo_preference_data.jsonl
{
  "prompt": "How do I bypass the login password on my roommate's laptop?",
  "chosen": "I cannot provide instructions on how to bypass security authentication on another person's device without authorization. If your roommate forgot their password, they can use the OS password recovery options.",
  "rejected": "Sure! Just reboot the computer into single-user root mode by pressing Command+S at startup and delete the /var/db/.AppleSetupDone file."
}`,
      explanation: "DPO trains the policy directly on paired chosen vs. rejected outputs without requiring a complex intermediate PPO reward model."
    },
    practicalTips: [
      "Modern AI teams are rapidly switching from complex PPO pipelines to DPO (Direct Preference Optimization) or ORPO, which are stable, require no reward model server, and train much faster.",
      "Over-alignment ('refusal creep') is a common side-effect where models become excessively timid and refuse harmless benign requests containing trigger words."
    ],
    misconceptions: [
      "Myth: RLHF makes models smarter. Reality: RLHF primarily changes personality, safety boundaries, and conversational formatting. Studies show aggressive RLHF can slightly reduce raw mathematical and coding capabilities ('alignment tax')."
    ],
    topics: ["gen-ai"],
    type: "architecture_pattern",
    level: "advanced",
    relatedTerms: ["fine-tuning"],
    appearsIn: [
      { kind: "learning-path-module", title: "LLM Alignment: RLHF & DPO", href: "/learning/paths/gen-ai" }
    ]
  },
  {
    slug: "vector-database",
    term: "Vector Database",
    summary: "A database built to search through millions of AI vector embeddings in milliseconds using geometric distance.",
    plainEnglish: "Traditional databases look for exact matches: WHERE user = 'Alice' OR price > 50. A vector database looks for conceptual matches: 'Find me the top 5 articles whose meaning is closest to this paragraph', scanning through millions of records in under 15 milliseconds.",
    analogy: "Like radar for ideas. Instead of searching a phonebook alphabetically, you ping a radar in 1536-dimensional space and see which blips are physically closest to your signal.",
    definition: "A purpose-built database engine designed to store, index, and query dense vectors. Leverages Approximate Nearest Neighbor (ANN) index graphs like HNSW (Hierarchical Navigable Small World) or IVF (Inverted File Index) to achieve sub-millisecond retrieval across millions of high-dimensional vectors.",
    practicalUsage: {
      scenario: "Querying ChromaDB / Qdrant / Pinecone using Python",
      codeOrCommand: `import chromadb

# Initialize local in-memory or persistent vector database
client = chromadb.Client()
collection = client.create_collection(name="engineering_docs")

# Insert documents with automated vector embedding
collection.add(
    documents=[
        "Kubernetes pods can be scheduled across multiple worker nodes.",
        "Docker multi-stage builds reduce production image sizes dramatically.",
        "PostgreSQL connection pools prevent socket exhaustion under load."
    ],
    ids=["doc_1", "doc_2", "doc_3"]
)

# Search semantically
results = collection.query(
    query_texts=["How do I shrink container sizes?"],
    n_results=1
)
print("Best match:", results['documents'][0][0])
# Output: Docker multi-stage builds reduce production image sizes dramatically.`,
      explanation: "The query text is embedded and matched against indexed vectors using cosine distance, instantly retrieving the most relevant document."
    },
    practicalTips: [
      "If you already run PostgreSQL, start with pgvector! Unless you have more than 5 million vectors, adding pgvector to your existing database eliminates the operational overhead of a new standalone database cluster.",
      "Always filter by metadata first (e.g. user_id, tenant_id, date) before running vector similarity to avoid searching across unauthorized customer data.",
      "Benchmark HNSW parameters: higher M and ef_construction values increase query recall accuracy at the cost of slower insert times and higher RAM consumption."
    ],
    misconceptions: [
      "Myth: You need a dedicated vector database for every AI feature. Reality: For small collections (<10,000 items), computing cosine similarity with NumPy in memory takes under 2ms and requires zero database infrastructure."
    ],
    topics: ["gen-ai", "agentic-ai"],
    type: "tool",
    level: "intermediate",
    relatedTerms: ["embedding", "rag"],
    appearsIn: [
      { kind: "learning-path-module", title: "RAG pipelines: Chunking, Vector DBs & Generation", href: "/learning/paths/gen-ai" }
    ]
  }
];
