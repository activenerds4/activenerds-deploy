import type { GlossaryEntry } from "../glossary-types";

export const dockerGlossary: GlossaryEntry[] = [
  {
    slug: "container",
    term: "Container",
    summary: "An isolated user-space process tree bounded by Linux kernel namespaces and cgroups sharing the host kernel.",
    plainEnglish: "A container is not a mini-computer or a virtual machine with its own operating system. It is simply an ordinary program running on your host machine — but wrapped in Linux kernel guardrails that restrict what files, processes, and network ports it can see and how much RAM and CPU it can consume.",
    analogy: "Think of a Virtual Machine like buying a detached private house: it has its own independent plumbing, electricity, and foundation. A container is like renting an apartment in a high-rise: you have your own locked front door and private rooms, but you share the building's physical structure, foundation, and main water pipes.",
    definition: "A user-space process tree bounded by Linux namespaces (which create the illusion of dedicated system resources) and cgroups (which cap physical resource consumption). Because it shares the host Linux kernel directly, it starts in milliseconds with zero hypervisor hardware emulation.",
    practicalUsage: {
      scenario: "Running a production microservice while guaranteeing it cannot consume all server memory and crash other services.",
      codeOrCommand: "docker run -d --name payment-api --memory=\"512m\" --cpus=\"1.5\" -p 8080:8080 payment-service:v1.2",
      explanation: "The kernel immediately spawns the application process, restricts it to 512MB RAM via cgroups, gives it its own private network loopback via namespaces, and forwards host port 8080 into it."
    },
    practicalTips: [
      "If a container exceeds its memory limit, the Linux kernel terminates process 1 immediately with exit code 137 (OOMKilled) — monitor your memory headroom before setting hard limits in production.",
      "Always ensure your container application runs with an init process (like tini or dumb-init) or proper signal handling; otherwise, Unix signals like SIGTERM are ignored and \"docker stop\" hangs for 10 seconds before forcefully killing it with SIGKILL.",
      "Run \"ps aux | grep <your-app>\" on your host machine — you will see your containerized app running directly in the host process table, proving it is an ordinary Linux process."
    ],
    misconceptions: [
      "Myth: Containers run an operating system inside them. (Reality: Container images contain root filesystems and binaries, but zero operating system kernels — they execute directly on the host kernel.)",
      "Myth: Containers provide the same security boundary as VMs. (Reality: If an attacker exploits a Linux kernel vulnerability from within a container, they break out directly to the host.)"
    ],
    topics: ["docker", "kubernetes"],
    type: "concept",
    level: "beginner",
    relatedTerms: ["cgroups", "namespaces", "container-image"],
    appearsIn: [
      { kind: "learning-path-module", title: "Containers vs. VMs: what the kernel actually isolates", href: "/learning/paths/docker" }
    ]
  },
  {
    slug: "container-image",
    term: "Container Image",
    summary: "Immutable read-only tarball bundle containing root filesystem layers, binary dependencies, and OCI runtime metadata.",
    plainEnglish: "A container image is a frozen, read-only snapshot of everything an application needs to run: system libraries, code, dependencies, and configuration. When you run an image, Docker doesn't modify it; it simply stacks a thin writable scratchpad layer on top.",
    analogy: "If a container is a freshly baked cookie, the container image is the cookie cutter and recipe. You can stamp out hundreds of identical cookies from one cutter without altering the cutter itself.",
    definition: "An immutable, content-addressable static artifact comprising stacked read-only rootfs layers and a JSON configuration spec. Each build instruction creates a layer stored by its SHA-256 hash. At runtime, the container engine overlays these read-only layers with a transient read-write layer.",
    practicalUsage: {
      scenario: "Inspecting an image to audit which operating system libraries, environment variables, and ports it exposes.",
      codeOrCommand: "docker image inspect node:20-alpine --format='{{json .Config.Env}}'",
      explanation: "This command reads the image manifest JSON metadata without running any containers, revealing baked-in environment variables, entrypoint commands, and default working directories."
    },
    practicalTips: [
      "Never store credentials, private API keys, or database passwords in an image layer — even if you delete them in a later Dockerfile step, the secret remains forever accessible in the earlier layer history.",
      "Always pin base images to specific digest hashes or explicit semantic versions (e.g. \"node:20.11-alpine\") rather than mutable floating tags like \":latest\", which can break builds overnight when upstream updates.",
      "Use \"docker history <image-name>\" to see which exact line of your Dockerfile contributed the most megabytes to your final image."
    ],
    misconceptions: [
      "Myth: An image includes a bootable Linux kernel. (Reality: It only contains user-space files like /bin, /etc, and /usr; the kernel is supplied exclusively by the host machine.)",
      "Myth: Deleting a file in a later Dockerfile step makes the image smaller. (Reality: Because layers are immutable, the file is simply masked in the top layer; the disk size remains in the lower layer.)"
    ],
    topics: ["docker", "kubernetes"],
    type: "concept",
    level: "beginner",
    relatedTerms: ["container", "dockerfile", "unionfs", "oci-image-spec"],
    appearsIn: [
      { kind: "learning-path-module", title: "Image layers and Copy-on-Write storage drivers", href: "/learning/paths/docker" }
    ]
  },
  {
    slug: "cgroups",
    term: "cgroups (Control Groups)",
    summary: "Linux kernel mechanism metering and limiting hardware resource allocations (CPU, memory, disk I/O) for process groups.",
    plainEnglish: "cgroups are the resource bouncers of the Linux kernel. They tell a group of processes: \"You can only use up to 2 CPU cores and 1 gigabyte of RAM. If you try to take more, you get throttled or terminated.\" This prevents one rogue application from freezing your entire server.",
    analogy: "Think of cgroups like a monthly mobile data cap. If your plan allows 10GB of high-speed data, once you hit that ceiling, your carrier throttles your speed or cuts your connection so you don't overwhelm the shared network tower.",
    definition: "A Linux kernel subsystem (cgroups v1/v2) that meters, prioritizes, and limits hardware resources across process hierarchies. Container runtimes configure cgroup controllers (such as memory.max, cpu.max, and io.weight) to prevent noisy-neighbor workloads from exhausting host compute.",
    practicalUsage: {
      scenario: "Preventing a memory-hungry background job from consuming all host RAM and starving critical production databases.",
      codeOrCommand: "docker run -d --name worker --memory=\"1g\" --memory-swap=\"1g\" --cpu-shares=512 batch-job:v1",
      explanation: "Docker configures Linux cgroups under /sys/fs/cgroup/ to strictly cap physical RAM to 1GB and disable swap, ensuring the worker is killed cleanly rather than thrashing the host swap space."
    },
    practicalTips: [
      "Java applications before JDK 10 and Node.js older runtimes often read host CPU/RAM counts instead of container cgroup bounds, causing them to spawn too many worker threads and crash — use modern runtimes with container awareness.",
      "cgroup v2 provides a unified resource hierarchy and fixes significant memory accounting bugs present in cgroup v1, including accurately accounting for page cache buffers and writeback memory.",
      "Check \"/sys/fs/cgroup/memory.current\" inside a container to see exact real-time byte consumption measured directly by the kernel."
    ],
    misconceptions: [
      "Myth: cgroups hide processes from each other. (Reality: cgroups only meter and enforce hardware budgets; process isolation is handled entirely by Linux namespaces.)",
      "Myth: When a container reaches 100% CPU, it crashes. (Reality: CPU is a compressible resource — the kernel throttles the process execution cycles; only memory exhaustion causes immediate termination.)"
    ],
    topics: ["docker", "kubernetes"],
    type: "concept",
    level: "beginner",
    relatedTerms: ["namespaces", "container"],
    appearsIn: [
      { kind: "learning-path-module", title: "cgroups v2 resource bounds", href: "/learning/paths/docker" }
    ]
  },
  {
    slug: "namespaces",
    term: "Linux Namespaces",
    summary: "Kernel abstraction restricting what system resources (processes, network interfaces, mounts) a process tree can observe.",
    plainEnglish: "Namespaces are virtual blinders for programs. When a process runs inside a namespace, the Linux kernel lies to it: it tells the process that it is the only program on the computer (PID 1), that it has its own private network card, and that its own folder is the root of the entire hard drive.",
    analogy: "Imagine living in a movie set replica of a city. To you inside the set, it looks like a complete world with streets and storefronts. But to someone standing on the rooftop outside, you are just in a studio warehouse inside a real city with thousands of other buildings.",
    definition: "A Linux kernel feature that encapsulates and isolates system resources into virtualized views. The primary namespaces are PID (process tree), NET (network interfaces & iptables), MNT (filesystem mount points), IPC (inter-process communication), UTS (hostnames), and USER (UID/GID mappings).",
    practicalUsage: {
      scenario: "Debugging a network connection problem inside a container without installing networking diagnostic tools into the container image itself.",
      codeOrCommand: "pid=$(docker inspect -f '{{.State.Pid}}' my-container)\nsudo nsenter -t $pid -n ip addr",
      explanation: "This command enters the container network namespace from the host, using host utilities to inspect the container private network interface without polluting the image with curl or net-tools."
    },
    practicalTips: [
      "Never run a container with \"--net=host\" or \"--pid=host\" in production unless strictly necessary for node-level system agents, as this completely strips the namespace blinders and gives full host visibility.",
      "In Kubernetes, all containers inside the same Pod share the exact same NET and IPC namespaces — which is why they can communicate with each other over \"localhost\".",
      "Process ID 1 inside a PID namespace has special signal-handling rules in Linux; if PID 1 crashes, the kernel immediately terminates every other process in that namespace."
    ],
    misconceptions: [
      "Myth: Namespaces simulate a hardware CPU. (Reality: Namespaces do zero hardware virtualization; they are pure software filters inside the kernel routing system calls.)",
      "Myth: Root inside a container cannot affect the host. (Reality: By default, UID 0 inside a container is UID 0 on the host unless User Namespaces (userns) are explicitly configured.)"
    ],
    topics: ["docker"],
    type: "concept",
    level: "beginner",
    relatedTerms: ["cgroups", "container"],
    appearsIn: [
      { kind: "learning-path-module", title: "Containers vs. VMs", href: "/learning/paths/docker" }
    ]
  },
  {
    slug: "dockerfile",
    term: "Dockerfile",
    summary: "Declarative plain-text build manifest consumed by BuildKit to assemble container image layers sequentially.",
    plainEnglish: "A Dockerfile is an automated recipe card. You write step-by-step instructions (such as \"start with Node.js\", \"install dependencies\", \"copy code\", \"run server\"), and Docker executes them in order, capturing the result as a reusable container image.",
    analogy: "Like an Ikea furniture assembly manual: each page instructs you to fasten a specific piece. If you assemble up to step 4, you can pause, and if you want to make another table, you can reuse the pre-assembled legs from step 4 instead of starting from raw timber.",
    definition: "A plain-text manifest file containing sequential commands (FROM, RUN, COPY, ENV, ENTRYPOINT) parsed by BuildKit. Each instruction produces a distinct, cached read-only filesystem layer, ordered to maximize build cache reuse.",
    practicalUsage: {
      scenario: "Writing an optimized Node.js Dockerfile that caches dependency downloads so re-building code takes under 2 seconds.",
      codeOrCommand: "FROM node:20-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci --only=production\nCOPY . .\nEXPOSE 3000\nCMD [\"node\", \"server.js\"]",
      explanation: "By copying package.json and running npm ci before copying the rest of the application code, Docker caches the expensive dependency download step whenever you only edit code files."
    },
    practicalTips: [
      "Always order instructions from least frequently changed (base OS, package manager installs) to most frequently changed (application source code) to avoid busting the build cache.",
      "Always use the exec JSON form for CMD and ENTRYPOINT (CMD [\"node\", \"server.js\"]) instead of the shell form (CMD \"node server.js\"); the shell form wraps your app in /bin/sh, preventing OS termination signals from reaching your code.",
      "Create a .dockerignore file in your project root to exclude .git, node_modules, and local secrets from being sent in the build context."
    ],
    misconceptions: [
      "Myth: Every RUN instruction makes an image bloated. (Reality: With BuildKit cache mounts and multi-stage builds, intermediate files cleaned up in the same layer or earlier stages do not increase final image size.)",
      "Myth: EXPOSE automatically opens ports to the internet. (Reality: EXPOSE is purely documentation for engineers and orchestrators; you still must pass \"-p host:container\" at runtime to map traffic.)"
    ],
    topics: ["docker"],
    type: "tool",
    level: "beginner",
    relatedTerms: ["container-image", "multi-stage-build", "buildkit"],
    appearsIn: [
      { kind: "learning-path-module", title: "Writing production Dockerfiles", href: "/learning/paths/docker" }
    ]
  },
  {
    slug: "unionfs",
    term: "UnionFS / OverlayFS",
    summary: "Storage driver combining distinct read-only image layers and a read-write layer into a single unified directory tree.",
    plainEnglish: "OverlayFS is like stacking transparent plastic sheets on top of each other. The bottom sheets (image layers) are permanent and unchangeable. The top sheet (the container) is transparent and writable. When you look down through the stack, you see one seamless composite picture.",
    analogy: "Imagine an overhead projector transparency stack: sheet 1 has a map background, sheet 2 has highway lines, and sheet 3 has store labels. When stacked, you see a full map. If you write with a marker on the top sheet, you don't alter the underlying drawings.",
    definition: "A union mount filesystem implementation (standardized as overlay2 in Linux) that combines multiple directories into a single unified virtual mount. It presents lower read-only directories (lowerdir) and an upper read-write directory (upperdir) as a merged view (merged), executing Copy-on-Write on file changes.",
    practicalUsage: {
      scenario: "Running 50 identical microservice containers on a single host without duplicating 50 copies of a 500MB image on disk.",
      codeOrCommand: "docker run -d --name srv1 my-app:v1 && docker run -d --name srv2 my-app:v1",
      explanation: "Both containers share the exact same physical lowerdir image layers on disk; each container only consumes a few kilobytes for its private upperdir scratchpad."
    },
    practicalTips: [
      "Applications that perform heavy random write operations (like PostgreSQL, MySQL, or Elasticsearch) suffer severe latency on OverlayFS due to Copy-on-Write overhead — always write databases to Docker Volumes or host bind mounts.",
      "When a container deletes an existing file from a lower layer, OverlayFS creates a \"whiteout\" character device file in the upperdir to mask the file from view rather than deleting it from disk.",
      "Check \"docker system df\" to see how much disk space is shared across layers versus consumed by mutable container layers."
    ],
    misconceptions: [
      "Myth: Every container duplicates the entire filesystem of its base image. (Reality: Thousands of containers can point to the same shared base image layers, consuming near-zero extra disk space.)",
      "Myth: Deleting files inside a running container frees up host disk space. (Reality: Because the file is in a read-only lower layer, deleting it merely adds a whiteout marker to the upper layer, actually consuming a tiny bit more space.)"
    ],
    topics: ["docker"],
    type: "architecture_pattern",
    level: "intermediate",
    relatedTerms: ["container-image", "copy-on-write"],
    appearsIn: [
      { kind: "learning-path-module", title: "Image layers and Copy-on-Write storage drivers", href: "/learning/paths/docker" }
    ]
  },
  {
    slug: "copy-on-write",
    term: "Copy-on-Write (CoW)",
    summary: "Storage optimization strategy deferring file copies until modifications occur, sharing underlying layer blocks.",
    plainEnglish: "Copy-on-Write means: \"Don't bother copying anything until someone actually tries to edit it.\" If a container reads a 50MB configuration file from the base image, it reads directly from the shared layer. The moment it writes a change, Docker duplicates that single file up to the container's private scratchpad.",
    analogy: "Like sharing a Google Doc in 'view-only' mode: everyone reads the same master copy for free. But if you want to make edits, you must hit 'Make a copy' to get your own private version.",
    definition: "An optimization mechanism where processes share identical memory pages or disk files without duplication. Only when a process executes a write operation does the operating system make a physical copy for that specific process, isolating the mutation.",
    practicalUsage: {
      scenario: "Modifying a single configuration file in /etc/nginx/nginx.conf inside a running Nginx container.",
      codeOrCommand: "docker exec -it my-nginx sed -i 's/80/8080/' /etc/nginx/nginx.conf",
      explanation: "OverlayFS notices the write call, copies /etc/nginx/nginx.conf from the lower read-only image layer up to the upper read-write container layer, and applies the change there."
    },
    practicalTips: [
      "Modifying a large 5GB file inside an image layer forces OverlayFS to copy the entire 5GB file up to the container layer, causing a noticeable I/O freeze. Never modify massive files directly inside container layers; use mounted volumes.",
      "Copy-on-Write applies to both Linux memory management (via fork) and container disk storage (via OverlayFS).",
      "If you want to know what files a container has modified via Copy-on-Write, run \"docker diff <container-id>\" — files copied up and changed are marked with 'C'."
    ],
    misconceptions: [
      "Myth: Copy-on-Write copies the entire image when you modify a file. (Reality: Only the specific file being opened for writing is copied to the top layer.)",
      "Myth: Copy-on-Write is fast enough for production databases. (Reality: Database storage engines should never rely on CoW layers; database data must always reside in native volumes.)"
    ],
    topics: ["docker"],
    type: "architecture_pattern",
    level: "intermediate",
    relatedTerms: ["unionfs", "container-image"],
    appearsIn: [
      { kind: "learning-path-module", title: "Image layers and Copy-on-Write storage drivers", href: "/learning/paths/docker" }
    ]
  },
  {
    slug: "buildkit",
    term: "BuildKit",
    summary: "Concurrent, DAG-based image builder engine in Docker offering parallel step execution and secret mounting.",
    plainEnglish: "BuildKit is the modern engine that powers \"docker build\". The legacy builder ran Dockerfiles strictly line-by-line in slow serial order. BuildKit analyzes your Dockerfile like a graph, runs independent steps in parallel, and allows you to securely use API keys or SSH credentials during builds without baking them into the final image.",
    analogy: "Think of a chef in a restaurant kitchen: instead of boiling pasta, waiting 10 minutes, and only then starting to chop tomatoes, BuildKit chops the tomatoes, grills the chicken, and boils the pasta simultaneously on different burners.",
    definition: "The next-generation container image builder designed by the Moby project. It compiles Dockerfiles into a Low-Level Intermediate Representation (LLB) dependency graph, executing non-dependent build steps concurrently, supporting cache mounts, and enabling secret injection.",
    practicalUsage: {
      scenario: "Cloning a private Git repository or pulling private npm packages during build without leaving SSH keys in the image history.",
      codeOrCommand: "docker build --secret id=github_token,src=.env.token -t my-app .",
      explanation: "Inside the Dockerfile, \"RUN --mount=type=secret,id=github_token\" mounts the credential temporarily into RAM during that specific command; the secret is never committed to disk layers."
    },
    practicalTips: [
      "Use \"RUN --mount=type=cache,target=/root/.cache/pip\" or target=/root/.npm to persist package manager caches between builds so dependencies are not re-downloaded from scratch every time.",
      "Enable BuildKit explicitly in older environments with \"export DOCKER_BUILDKIT=1\"; it is enabled by default in all modern Docker Desktop and CLI releases.",
      "BuildKit supports exporting images in multiple formats directly, including OCI tarballs, local directories, or multi-platform manifests via \"--platform linux/amd64,linux/arm64\"."
    ],
    misconceptions: [
      "Myth: Docker build still executes one line at a time sequentially. (Reality: BuildKit analyzes dependencies and executes un-linked stages in parallel across multiple CPU cores.)",
      "Myth: Setting an ENV variable and unsetting it later hides a build secret. (Reality: The secret is permanently readable in the earlier layer history; use BuildKit secret mounts instead.)"
    ],
    topics: ["docker"],
    type: "tool",
    level: "intermediate",
    relatedTerms: ["dockerfile", "multi-stage-build"],
    appearsIn: [
      { kind: "learning-path-module", title: "BuildKit features: cache mounts & secrets", href: "/learning/paths/docker" }
    ]
  },
  {
    slug: "multi-stage-build",
    term: "Multi-stage Build",
    summary: "Dockerfile design pattern using multiple FROM instructions to separate build-time SDK dependencies from slim runtime artifacts.",
    plainEnglish: "A multi-stage build lets you use one heavy Docker image (packed with compilers, SDKs, and build tools) to build your application, and then copy only the finished binary into a tiny, lightweight image for production. This keeps your production images tiny, secure, and free of development clutter.",
    analogy: "Like a professional restaurant kitchen: the messy preparation (chopping vegetables, peeling onions, boiling stocks) happens in the back prep kitchen. Only the clean, finished plate is brought out to the customer dining room.",
    definition: "A Dockerfile pattern utilizing multiple FROM statements. Intermediate build stages compile code, test, and package artifacts, while the final stage inherits from a minimal runtime base (like Alpine or Distroless), copying only the compiled artifacts from earlier stages.",
    practicalUsage: {
      scenario: "Building a Go or Rust web server that drops final image size from 1.2GB down to just 15MB.",
      codeOrCommand: "FROM golang:1.22 AS builder\nWORKDIR /app\nCOPY . .\nRUN CGO_ENABLED=0 go build -o server .\n\nFROM alpine:3.19\nCOPY --from=builder /app/server /usr/local/bin/\nCMD [\"server\"]",
      explanation: "The heavy Go compiler and source files stay in the builder stage. The final production image only contains the lightweight Alpine OS and the 15MB compiled binary."
    },
    practicalTips: [
      "Name your stages clearly (e.g. \"FROM ... AS builder\", \"FROM ... AS tester\") so you can easily reference them with \"COPY --from=builder\" or target them in CI with \"--target builder\".",
      "Multi-stage builds dramatically shrink attack surface: CVE scanners won't find vulnerabilities in build tools or compilers in your production image because those tools simply do not exist in the final container.",
      "Use \"docker build --target tester .\" in your CI pipeline to run unit tests without building or publishing the final production container."
    ],
    misconceptions: [
      "Myth: You need separate Dockerfiles for development, testing, and production. (Reality: A single multi-stage Dockerfile can encapsulate development, testing, and production targets.)",
      "Myth: All stages in a multi-stage build end up in the final image. (Reality: Only the final FROM stage and what is explicitly copied into it constitutes the published image.)"
    ],
    topics: ["docker"],
    type: "architecture_pattern",
    level: "intermediate",
    relatedTerms: ["dockerfile", "buildkit"],
    appearsIn: [
      { kind: "learning-path-module", title: "Multi-stage build pipelines", href: "/learning/paths/docker" }
    ]
  },
  {
    slug: "oci-image-spec",
    term: "OCI Image Spec",
    summary: "Open Container Initiative specification defining container image tarball structures, manifests, and layer blobs.",
    plainEnglish: "The OCI Image Spec is the universal standard for container images. It ensures that an image built with Docker can be run by Podman, Kubernetes, containerd, AWS ECS, or Google Cloud without modification. It is the reason container technology isn't locked to a single vendor.",
    analogy: "Like the standard USB-C port: no matter whether your laptop is an Apple, Dell, or Lenovo, any USB-C cable will plug in and transfer power and data because everyone agreed on the exact physical and electrical specification.",
    definition: "An open governance specification maintained by the Linux Foundation. It defines the formal structure of container image manifests (JSON descriptors referencing content-addressable SHA-256 blobs), configuration descriptors, filesystem layer archives, and multi-architecture indexes.",
    practicalUsage: {
      scenario: "Building a single image tag that automatically serves ARM64 binaries to Apple Silicon Macs and AMD64 binaries to Linux cloud servers.",
      codeOrCommand: "docker buildx build --platform linux/amd64,linux/arm64 -t my-org/api:v1 --push .",
      explanation: "BuildKit creates an OCI Image Index manifest that points to two separate architecture blobs; when clients pull the image, their runtime automatically fetches the correct architecture."
    },
    practicalTips: [
      "Use tools like \"crane manifest <image>\" or \"skopeo inspect <image>\" to inspect OCI manifests and layer digests directly in remote registries without having to pull gigabytes of data.",
      "OCI digests (e.g. \"@sha256:45b2...\") are cryptographically immutable, whereas image tags (e.g. \":v1.0\") can be overwritten or moved; production Kubernetes deployments should pin digests for absolute immutability.",
      "The OCI specification also governs image distribution and runtime protocols (runc), forming the baseline for all cloud-native container tooling."
    ],
    misconceptions: [
      "Myth: Docker images are proprietary to Docker Inc. (Reality: Docker images conform to the vendor-neutral OCI specification, allowing any compliant runtime to execute them.)",
      "Myth: Image tags are guaranteed to be immutable. (Reality: Any registry user with write permissions can re-push a new image under an existing tag; only SHA-256 digests are immutable.)"
    ],
    topics: ["docker", "kubernetes"],
    type: "protocol",
    level: "intermediate",
    relatedTerms: ["container-image", "container-registry"],
    appearsIn: [
      { kind: "learning-path-module", title: "Deep dive into OCI spec", href: "/learning/paths/docker" }
    ]
  },
  {
    slug: "docker-build-cmd",
    term: "docker build",
    summary: "CLI command delegating Dockerfile parsing and layer assembly to the BuildKit engine.",
    plainEnglish: "The \"docker build\" command takes your Dockerfile and project folder (the build context) and packages them into a runnable container image. It executes each instruction, caching intermediate steps so subsequent builds take seconds.",
    analogy: "Like clicking 'Compile' in a software development environment: it turns your raw human-written source code into an optimized, self-contained binary artifact ready for distribution.",
    definition: "The CLI command that transmits a local build context to the container daemon or BuildKit worker. It parses instruction directives, executes intermediate build steps in isolated containers, and outputs an image with cryptographic layer checksums.",
    practicalUsage: {
      scenario: "Building and tagging an application for a staging deployment with custom build arguments.",
      codeOrCommand: "docker build -t my-company/web:staging --build-arg NODE_ENV=production -f Dockerfile.prod .",
      explanation: "Docker packages the current directory (.) as the context, injects the build-arg variable into the Dockerfile, and tags the resulting image as my-company/web:staging."
    },
    practicalTips: [
      "Be careful with the final argument in \"docker build .\": the dot (.) specifies the build context sent to the Docker daemon. If you run this in your home directory or root without a .dockerignore, Docker will attempt to send gigabytes of local files.",
      "Use \"--no-cache\" when you want to force fresh downloads of packages or verify that your Dockerfile builds cleanly from scratch without relying on local cache.",
      "Add \"--progress=plain\" to see full, untruncated console output from build steps, which is invaluable when debugging failing npm or pip compile errors."
    ],
    misconceptions: [
      "Myth: The dot (.) in \"docker build .\" specifies where the Dockerfile is located. (Reality: The dot specifies the build context directory to send to the daemon; Dockerfile location is set via \"-f\".)",
      "Myth: Build arguments (--build-arg) keep passwords secure. (Reality: Build-args are permanently visible in image history; never pass API keys or database passwords as build-args.)"
    ],
    topics: ["docker"],
    type: "command",
    level: "beginner",
    relatedTerms: ["dockerfile", "buildkit"],
    appearsIn: [
      { kind: "qa-challenge", title: "Docker CLI Fundamentals", href: "/learning/challenges/docker" }
    ]
  },
  {
    slug: "docker-run-cmd",
    term: "docker run",
    summary: "CLI command instantiating and launching a container with specified isolation boundaries, volumes, and ports.",
    plainEnglish: "The \"docker run\" command takes a static container image sitting on your disk, creates a new isolated sandbox, mounts necessary storage and network ports, and starts running your application inside it.",
    analogy: "Like opening an app on your phone: the app binary was installed on your flash storage, but clicking the icon spins up an active, running process in RAM with its own dedicated screen window.",
    definition: "The command that combines \"docker create\" and \"docker start\". It allocates a read-write container layer over the image, creates new kernel namespaces and cgroup limits, configures networking, and starts the container's PID 1 process.",
    practicalUsage: {
      scenario: "Spinning up a temporary PostgreSQL database for local integration testing that cleans itself up automatically upon exit.",
      codeOrCommand: "docker run --rm -d --name test-db -e POSTGRES_PASSWORD=secret -p 5432:5432 postgres:16-alpine",
      explanation: "Runs postgres in the background (-d), gives it a recognizable name, maps host port 5432 to container port 5432, and automatically deletes the container disk layer (--rm) as soon as it stops."
    },
    practicalTips: [
      "Always use the \"--rm\" flag for temporary one-off commands or migrations; otherwise, stopped containers accumulate on your hard drive and silently consume gigabytes of storage.",
      "Use \"-d\" (detached mode) for background servers, and \"-it\" (interactive pseudo-TTY) when you need to interact with a terminal shell directly.",
      "Map ports explicitly with \"-p host_port:container_port\" — remember the left side is what you type in your browser on your host machine, and the right side is what the app listens to inside."
    ],
    misconceptions: [
      "Myth: \"docker run\" and \"docker start\" are the same thing. (Reality: \"docker run\" creates a brand new container from an image; \"docker start\" resumes an existing stopped container.)",
      "Myth: Data written inside a container persists forever by default. (Reality: If you remove a container without mounting a volume, all data written to its writable layer is permanently erased.)"
    ],
    topics: ["docker"],
    type: "command",
    level: "beginner",
    relatedTerms: ["container", "docker-exec-cmd"],
    appearsIn: [
      { kind: "qa-challenge", title: "Docker Container Lifecycle", href: "/learning/challenges/docker" }
    ]
  },
  {
    slug: "docker-exec-cmd",
    term: "docker exec",
    summary: "CLI command spawning a new process inside the existing namespaces of a running container.",
    plainEnglish: "The \"docker exec\" command lets you step inside an already-running container to inspect files, check environment variables, test network connectivity, or debug live errors without restarting the app.",
    analogy: "Like using a maintenance keycard to walk into an operating office: the employees (your app) are already working inside, and you walk into their room to inspect the thermostat or check the printer without interrupting them.",
    definition: "A command that uses the Linux setns system call to attach a new process to the existing kernel namespaces (MNT, PID, NET) and cgroups of a running container target.",
    practicalUsage: {
      scenario: "Opening an interactive bash or sh shell inside a failing production container to test database connectivity.",
      codeOrCommand: "docker exec -it web-service /bin/sh",
      explanation: "Spawns an interactive shell process directly inside the namespaces of web-service, allowing you to run ping, env, or inspect application logs in real-time."
    },
    practicalTips: [
      "If you exit an interactive shell started with \"docker exec -it\", the main container keeps running undisturbed because your shell was a secondary process, not PID 1.",
      "You can run one-off commands without an interactive shell, such as \"docker exec my-postgres pg_dump -U postgres dbname > backup.sql\" to stream database dumps directly to your host machine.",
      "Minimalist images like Distroless or scratch do not contain /bin/sh or bash by design to harden security; to debug them, use ephemeral debug containers in Kubernetes or inspect from the host."
    ],
    misconceptions: [
      "Myth: \"docker exec\" restarts the container. (Reality: It leaves the container and its primary process running uninterrupted and merely attaches an auxiliary process.)",
      "Myth: \"docker exec\" requires SSH running in the container. (Reality: It connects directly via Linux kernel namespaces and the Docker daemon socket; no SSH daemon is required or recommended.)"
    ],
    topics: ["docker"],
    type: "command",
    level: "beginner",
    relatedTerms: ["container", "docker-run-cmd"],
    appearsIn: [
      { kind: "qa-challenge", title: "Docker Troubleshooting Commands", href: "/learning/challenges/docker" }
    ]
  },
  {
    slug: "docker-compose-cmd",
    term: "docker compose up",
    summary: "CLI command creating and starting multi-container services declared in a compose YAML manifest.",
    plainEnglish: "Instead of typing ten long \"docker run\" commands with port numbers, environment variables, and network flags every time you start a project, \"docker compose up\" reads a single YAML file and launches your entire application stack (frontend, backend, Redis, Postgres) in one command.",
    analogy: "Like a smart-home master switch: flipping 'Movie Mode' turns on the television, dims the ceiling lights, and switches on the soundbar all at once in the correct sequence.",
    definition: "The command line feature in Docker that parses a docker-compose.yml configuration to orchestrate multi-container application lifecycles on a single Docker host, configuring shared networks, storage volumes, and dependency startup orders.",
    practicalUsage: {
      scenario: "Launching a full development environment containing a Node API, Redis cache, and Postgres DB with persistent data.",
      codeOrCommand: "docker compose up -d --build",
      explanation: "Reads docker-compose.yml, creates an internal bridge network, builds out-of-date images, and starts all containers in detached mode in the background."
    },
    practicalTips: [
      "Use \"depends_on\" with healthchecks (condition: service_healthy) so your backend API waits until PostgreSQL is actually accepting connections, rather than crashing immediately on startup.",
      "Use modern \"docker compose\" (with a space) rather than the legacy Python-based \"docker-compose\" (with a hyphen); modern Compose is written in Go and baked directly into Docker CLI.",
      "Run \"docker compose down -v\" when you want to reset your local development environment completely, including deleting local test database volumes."
    ],
    misconceptions: [
      "Myth: Docker Compose is an alternative to Kubernetes for multi-server clusters. (Reality: Compose is designed primarily for local development and single-host setups; it does not handle multi-node scheduling or cluster auto-healing.)",
      "Myth: \"depends_on\" guarantees the database is ready for queries. (Reality: By default, depends_on only waits until the DB container process starts, not until the database finishes internal initialization — use healthchecks for that.)"
    ],
    topics: ["docker"],
    type: "command",
    level: "intermediate",
    relatedTerms: ["container"],
    appearsIn: [
      { kind: "learning-path-module", title: "Multi-container app orchestration", href: "/learning/paths/docker" }
    ]
  },
  {
    slug: "container-registry",
    term: "Container Registry",
    summary: "HTTP API service storing and serving versioned OCI image manifests and content-addressable layer blobs.",
    plainEnglish: "A container registry is an online catalog and storage warehouse for container images (like Docker Hub, GitHub Container Registry, AWS ECR, or Google Artifact Registry). It lets you upload (push) built images from CI/CD and download (pull) them onto production servers.",
    analogy: "Like the iOS App Store or npm for container images: developers publish tested, signed packages to the store, and servers download and install them whenever needed.",
    definition: "A network service implementing the OCI Distribution Specification. Registries maintain content-addressable storage for compressed layer tarballs and JSON manifests, providing authentication, vulnerability scanning, and access control for image distribution.",
    practicalUsage: {
      scenario: "Authenticating and pushing a newly built production image to a private cloud registry in GitHub Actions.",
      codeOrCommand: "echo $GHCR_TOKEN | docker login ghcr.io -u $GITHUB_ACTOR --password-stdin\ndocker tag my-app:v1 ghcr.io/my-org/my-app:v1\ndocker push ghcr.io/my-org/my-app:v1",
      explanation: "Authenticates securely via stdin, tags the local image with the registry domain prefix, and uploads the deduplicated layer blobs to GitHub Container Registry."
    },
    practicalTips: [
      "Configure automated registry lifecycle policies (e.g. \"delete untagged images older than 14 days\"); otherwise, daily CI builds will quietly fill terabytes of cloud storage and run up unexpected bills.",
      "Most enterprise registries offer automated vulnerability scanning: configure webhook policies to block deployments if an image contains unpatched critical CVEs.",
      "Registries perform layer deduplication: if 20 different images share the same Ubuntu base layer, the registry only stores one copy on its storage backend."
    ],
    misconceptions: [
      "Myth: Pushing an image uploads all files every time. (Reality: The registry checks layer SHA-256 hashes; only layers that have changed since the last push are transferred over the wire.)",
      "Myth: A public registry guarantees the image is safe. (Reality: Anyone can publish images to public registries like Docker Hub; always scan public images and verify provenance before running in production.)"
    ],
    topics: ["docker", "kubernetes"],
    type: "tool",
    level: "intermediate",
    relatedTerms: ["container-image", "oci-image-spec"],
    appearsIn: [
      { kind: "learning-path-module", title: "Image vulnerability scanning and registries", href: "/learning/paths/docker" }
    ]
  }
];
