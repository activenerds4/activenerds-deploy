import type { GlossaryEntry } from "../glossary-types";

export const kubernetesGlossary: GlossaryEntry[] = [
  {
    slug: "pod",
    term: "Pod",
    summary: "Smallest deployable unit in Kubernetes, grouping co-located containers sharing network namespaces and storage volumes.",
    plainEnglish: "A Pod is the smallest thing you can deploy in Kubernetes. Rather than running containers by themselves, Kubernetes always wraps them in a Pod. Most Pods run just one single container, but you can also put helper 'sidecar' containers inside the same Pod to handle logging, proxying, or security.",
    analogy: "Think of a pea pod: the pod is the outer protective shell, and the peas inside are your containers. The peas share the same pod shell, the same stem, and the same nutrients, living and dying together as a single unit.",
    definition: "The fundamental execution primitive in Kubernetes. A Pod encapsulates one or more co-located containers that share the same Linux network namespace (IP address and port space), IPC namespace, and storage volumes. Containers in a Pod communicate over localhost and share lifecycle schedules on a single cluster node.",
    practicalUsage: {
      scenario: "Inspecting a failing pod to determine whether the application crashed or ran out of memory.",
      codeOrCommand: "kubectl describe pod order-service-78f99c85b5-x2j4l\nkubectl logs order-service-78f99c85b5-x2j4l --previous",
      explanation: "Shows the Pod's lifecycle events, which node it was scheduled on, and retrieves the crash logs from the previous instance if the container restarted."
    },
    practicalTips: [
      "All containers inside a Pod share the IP address of that Pod — meaning two containers in the same Pod cannot listen on the same port (e.g., both cannot bind to :8080).",
      "Pods are strictly ephemeral and disposable: never configure IP addresses of Pods directly in application configs; always place a Kubernetes Service in front of them for stable DNS.",
      "If you see a Pod status in 'CrashLoopBackOff', use \"kubectl logs <pod> --previous\" to see the logs from the crashed container right before it died."
    ],
    misconceptions: [
      "Myth: You should pack an entire multi-tier stack (frontend, backend, database) inside a single Pod. (Reality: Each independent service should have its own Pod so they can scale, restart, and upgrade independently.)",
      "Myth: Pods can span across multiple cluster nodes. (Reality: A Pod is scheduled to exactly one physical or virtual node; all containers in that Pod execute on that same host.)"
    ],
    topics: ["kubernetes"],
    type: "concept",
    level: "beginner",
    relatedTerms: ["node", "deployment", "container"],
    appearsIn: [
      { kind: "learning-path-module", title: "Pods: the atomic unit of scheduling", href: "/learning/paths/kubernetes" }
    ]
  },
  {
    slug: "node",
    term: "Node",
    summary: "Worker machine (physical or VM) running kubelet, container runtime, and kube-proxy in a Kubernetes cluster.",
    plainEnglish: "A Node is a single worker computer (either a cloud virtual machine like an AWS EC2 instance or a bare-metal server in a data center) that belongs to your Kubernetes cluster. It provides the raw CPU, RAM, disk, and network hardware where your Pods actually execute.",
    analogy: "Think of Kubernetes like a shipping fleet: the control plane is the port dispatcher, and each Node is a cargo ship. The dispatcher decides which containers are loaded onto which cargo ship based on available deck space and weight limits.",
    definition: "A worker machine managed by the Kubernetes control plane. Each node runs the kubelet node-agent, an OCI container runtime (such as containerd), and kube-proxy to run and connect Pod workloads assigned by the control plane scheduler.",
    practicalUsage: {
      scenario: "Safely draining all traffic and evicting pods from a node before performing kernel updates or OS maintenance.",
      codeOrCommand: "kubectl cordon node-prod-worker-04\nkubectl drain node-prod-worker-04 --ignore-daemonsets --delete-emptydir-data",
      explanation: "Tells the scheduler not to place new pods on the node (cordon), and gracefully evicts existing pods to other healthy nodes in the cluster (drain) respecting disruption budgets."
    },
    practicalTips: [
      "Always set up PodDisruptionBudgets (PDB) across your deployments; otherwise, draining a node during routine maintenance might accidentally evict all replicas of a service simultaneously.",
      "If a node shows 'NotReady' status, it usually means the kubelet stopped reporting heartbeats to the API server due to disk exhaustion, memory pressure, or network partition.",
      "Use Node Labels and Node Selectors (or taints and tolerations) to pin GPU-intensive AI workloads exclusively to expensive GPU-backed nodes."
    ],
    misconceptions: [
      "Myth: If a node dies, all pods on it keep running somewhere else instantly. (Reality: The control plane waits for a node-monitor-grace-period (typically ~40s) before marking the node lost and rescheduling pods.)",
      "Myth: You should SSH into Kubernetes nodes to deploy software. (Reality: Nodes should be treated as disposable cattle; all workload configuration should go through the Kubernetes API declarative YAML.)"
    ],
    topics: ["kubernetes"],
    type: "concept",
    level: "beginner",
    relatedTerms: ["pod", "kubelet", "control-plane"],
    appearsIn: [
      { kind: "learning-path-module", title: "Kubernetes architecture: Control plane & Nodes", href: "/learning/paths/kubernetes" }
    ]
  },
  {
    slug: "deployment",
    term: "Deployment",
    summary: "Declarative controller managing stateless Pod replicas, progressive rollouts, and automatic rollbacks.",
    plainEnglish: "A Deployment tells Kubernetes: 'I want 5 copies of this web application running at all times. If one crashes, replace it. If I push a new version, roll it out gradually one pod at a time so users experience zero downtime.'",
    analogy: "Like an airline fleet manager: the manager guarantees that 10 flights are active on the Chicago-New York route daily. If plane #4 has a mechanical issue, the manager immediately dispatches an identical replacement plane from the hangar.",
    definition: "A higher-level Kubernetes controller object managing an underlying ReplicaSet. Deployments provide declarative updates for Pods, orchestrating zero-downtime rolling updates, replica scaling, health checks, and instant rollbacks to prior revision states.",
    practicalUsage: {
      scenario: "Deploying a new application version and instantly reverting if critical error alerts fire in production.",
      codeOrCommand: "kubectl set image deployment/frontend web=my-registry.com/frontend:v2.0\n# If errors spike:\nkubectl rollout undo deployment/frontend",
      explanation: "Executes a rolling update replacing v1 pods with v2 pods. If issues appear, the undo command reverts the ReplicaSet immediately back to the previous healthy revision."
    },
    practicalTips: [
      "Always define both readinessProbes and livenessProbes; without a readiness probe, Kubernetes sends incoming user traffic to new pods before they finish booting and connecting to databases.",
      "Set your rolling update strategy parameters: 'maxSurge: 25%' and 'maxUnavailable: 0' guarantees that you never drop below 100% capacity during application updates.",
      "Use 'kubectl rollout status deployment/<name>' in your CI/CD deployment pipelines to block until all updated pods pass health checks."
    ],
    misconceptions: [
      "Myth: Deployments are suitable for databases like MySQL or PostgreSQL. (Reality: Deployments are for stateless applications; stateful databases with persistent attached disks should use StatefulSets.)",
      "Myth: Changing a ConfigMap automatically restarts Deployment pods. (Reality: Deployments only trigger rollouts when the Pod template specification changes; changing a referenced ConfigMap does not restart pods automatically.)"
    ],
    topics: ["kubernetes"],
    type: "concept",
    level: "beginner",
    relatedTerms: ["pod", "reconciliation-loop"],
    appearsIn: [
      { kind: "learning-path-module", title: "Stateless applications with Deployments", href: "/learning/paths/kubernetes" }
    ]
  },
  {
    slug: "service-k8s",
    term: "Service (Kubernetes)",
    summary: "Abstract network endpoint presenting a stable virtual IP and DNS name across a dynamic pool of Pods.",
    plainEnglish: "Pods in Kubernetes are constantly dying, scaling, and getting new IP addresses. A Service gives your pods a permanent front door: a single unchanging IP address and internal domain name (like 'payment-service.default.svc.cluster.local') that automatically load-balances traffic across whichever pods are currently alive and healthy.",
    analogy: "Think of a company customer service hotline 1-800 number: customers dial the single hotline number, and the telephone system automatically routes the call to whichever support representative is currently at their desk.",
    definition: "An abstract REST resource that defines a logical set of Pods and a policy to access them. Services provide a stable ClusterIP, internal DNS name, and round-robin load balancing rules across target Pods matching a label selector.",
    practicalUsage: {
      scenario: "Connecting a frontend web service to a backend API without hardcoding fragile IP addresses.",
      codeOrCommand: "curl http://order-api.default.svc.cluster.local:8080/health",
      explanation: "CoreDNS resolves the service name to a virtual ClusterIP, and kube-proxy iptables rules distribute the request across healthy order-api pod replicas."
    },
    practicalTips: [
      "A Service only routes traffic to pods that pass their 'readinessProbe'; if all pods fail their readiness check, the Service returns 503 errors rather than sending traffic to unhealthy pods.",
      "The default Service type is ClusterIP (internal only); use 'NodePort' or 'LoadBalancer' (or an Ingress) only when you need traffic to enter from outside the cluster.",
      "A headless Service (ClusterIP: None) bypasses the virtual IP and returns raw pod IP addresses directly via DNS, which is essential for clustered databases like Kafka, Cassandra, or Zookeeper."
    ],
    misconceptions: [
      "Myth: A ClusterIP is a physical network interface you can ping with ICMP. (Reality: ClusterIPs are virtual IP tables rules that only handle TCP/UDP packets; they generally do not respond to ping commands.)",
      "Myth: A Service is an actual software proxy process running on a server. (Reality: A Service is just configuration state in etcd converted into Linux kernel netfilter/iptables or IPVS rules by kube-proxy.)"
    ],
    topics: ["kubernetes"],
    type: "concept",
    level: "beginner",
    relatedTerms: ["ingress", "pod", "kube-proxy"],
    appearsIn: [
      { kind: "learning-path-module", title: "Services and internal networking", href: "/learning/paths/kubernetes" }
    ]
  },
  {
    slug: "ingress",
    term: "Ingress",
    summary: "API object managing external HTTP/HTTPS routing rules to cluster-internal Services.",
    plainEnglish: "An Ingress is the airport customs gate for your cluster. Instead of paying cloud providers for an expensive separate load balancer for every single service, an Ingress provides a single smart entry point that routes requests based on domain names (like api.mycompany.com) and URL paths (like /users vs /orders) while handling SSL certificates.",
    analogy: "Like a hotel concierge in the lobby: visitors arrive at the main front entrance, and the concierge directs them to the restaurant on the 2nd floor, the spa on the 3rd floor, or conference rooms on the 4th floor.",
    definition: "A Kubernetes API resource that manages external access to internal Services, typically HTTP/HTTPS. Ingress rules define host routing, path matching, and SSL/TLS termination, translated into load balancer configurations by an active Ingress Controller (like NGINX, Traefik, or AWS ALB).",
    practicalUsage: {
      scenario: "Routing web traffic to two different internal microservices through a single public domain with automatic TLS.",
      codeOrCommand: "apiVersion: networking.k8s.io/v1\nkind: Ingress\nmetadata:\n  name: app-ingress\n  annotations:\n    cert-manager.io/cluster-issuer: letsencrypt-prod\nspec:\n  rules:\n  - host: myapp.com\n    http:\n      paths:\n      - path: /api\n        pathType: Prefix\n        backend:\n          service:\n            name: backend-service\n            port:\n              number: 8080",
      explanation: "Directs incoming requests to myapp.com/api to backend-service while managing TLS certificates automatically via cert-manager."
    },
    practicalTips: [
      "Creating an Ingress resource does nothing by itself unless an Ingress Controller (like ingress-nginx or envoy-gateway) is actually installed and running in your cluster.",
      "Pair your Ingress with cert-manager to get free, automated, auto-renewing Let's Encrypt SSL/TLS certificates for all your production domains.",
      "Watch out for pathType: Prefix vs Exact — misconfiguring path matching can unintentionally expose internal debug endpoints to the public internet."
    ],
    misconceptions: [
      "Myth: Kubernetes includes an Ingress Controller out of the box. (Reality: Kubernetes only provides the Ingress API spec; you must install a controller like NGINX, Traefik, or a cloud provider controller.)",
      "Myth: Ingress can handle any TCP/UDP protocol like raw databases or gaming servers. (Reality: Standard Ingress is strictly HTTP/HTTPS Layer 7; for raw TCP/UDP, use Gateway API or LoadBalancer services.)"
    ],
    topics: ["kubernetes"],
    type: "concept",
    level: "beginner",
    relatedTerms: ["service-k8s"],
    appearsIn: [
      { kind: "learning-path-module", title: "Ingress controllers & external routing", href: "/learning/paths/kubernetes" }
    ]
  },
  {
    slug: "control-plane",
    term: "Control Plane",
    summary: "The brain of Kubernetes managing cluster state, scheduling, API requests, and controller loops.",
    plainEnglish: "The Control Plane is the brain and nervous system of Kubernetes. It doesn't run your application containers; instead, it makes all the big decisions: it receives your commands (via kube-apiserver), saves the cluster state (in etcd), decides which worker machine should run each pod (via kube-scheduler), and constantly fixes problems when things crash (via kube-controller-manager).",
    analogy: "Like air traffic control at a major airport: the controllers sit in the tower looking at radar screens, directing which runways planes take off from and assigning gates. The controllers don't carry luggage or fly the planes, but the airport collapses without them.",
    definition: "The collection of core master processes (kube-apiserver, etcd, kube-scheduler, and kube-controller-manager) that maintain the desired state of the cluster, schedule workloads, respond to cluster events, and expose the management API.",
    practicalUsage: {
      scenario: "Checking the overall health and status of the cluster control plane components in production.",
      codeOrCommand: "kubectl get componentstatuses\n# On cloud managed clusters (EKS/GKE):\nkubectl get --raw='/readyz?verbose'",
      explanation: "Queries the API server readiness endpoint to verify that etcd, scheduler, and controller-manager are responsive and synchronized."
    },
    practicalTips: [
      "On managed cloud platforms like AWS EKS, Google GKE, or Azure AKS, the cloud provider manages, scales, backs up, and pays for the high-availability control plane for you.",
      "Never run production control planes on single nodes; high-availability requires at least 3 control plane nodes running an odd number of etcd members to maintain Raft consensus during node failure.",
      "If the control plane temporarily goes down, your currently running application pods on worker nodes continue running and serving customer traffic uninterrupted — you just cannot deploy changes or auto-scale until it recovers."
    ],
    misconceptions: [
      "Myth: If the control plane goes offline, all my websites go down immediately. (Reality: Worker nodes keep executing their current pods and routing network traffic; only management, scheduling, and auto-scaling pause.)",
      "Myth: The control plane runs application containers. (Reality: By default, control plane nodes are tainted with 'node-role.kubernetes.io/control-plane:NoSchedule' so application workloads never run on them.)"
    ],
    topics: ["kubernetes"],
    type: "concept",
    level: "intermediate",
    relatedTerms: ["etcd", "kubelet", "node"],
    appearsIn: [
      { kind: "learning-path-module", title: "Control plane vs worker node responsibilities", href: "/learning/paths/kubernetes" }
    ]
  },
  {
    slug: "kubelet",
    term: "kubelet",
    summary: "Node-level agent ensuring containers described in PodSpecs are running and healthy on each host.",
    plainEnglish: "The kubelet is the local on-site manager on every worker node. It communicates with the master control plane, takes orders ('run these 3 pods on your machine'), instructs the container runtime (like containerd) to download the images and start the containers, and monitors their health continuously.",
    analogy: "Like a construction site foreman: the architectural office (control plane) sends blueprints, and the foreman on the ground makes sure the workers actually lay the bricks, monitoring the site and reporting progress back to headquarters.",
    definition: "The primary node agent running on every node in the cluster. It registers the node with the API server, watches for assigned PodSpecs, instructs the local container runtime via CRI to start/stop containers, and executes liveness/readiness health probes.",
    practicalUsage: {
      scenario: "Diagnosing why a worker node suddenly stopped accepting pods and is listed as 'NotReady'.",
      codeOrCommand: "sudo journalctl -u kubelet -n 100 --no-pager",
      explanation: "Inspects the systemd service logs of the kubelet on the worker machine to diagnose container runtime socket errors, CNI plugin failures, or disk pressure conditions."
    },
    practicalTips: [
      "kubelet enforces node-level eviction thresholds (like nodefs.available < 10%); if a worker node runs low on disk, kubelet proactively evicts pods to prevent the node from crashing entirely.",
      "kubelet is one of the few Kubernetes components that runs as a native systemd service on the Linux host rather than as a container inside Kubernetes.",
      "Never let kubelet and the container runtime use different cgroup drivers (e.g. systemd vs cgroupfs); mismatched drivers cause subtle node instability and random pod crashes."
    ],
    misconceptions: [
      "Myth: kubelet schedules pods onto nodes. (Reality: kubelet has zero say in scheduling; the centralized kube-scheduler assigns pods to nodes, and kubelet simply executes what it is assigned.)",
      "Myth: kubelet manages container networking rules across nodes. (Reality: kubelet delegates network creation to CNI plugins like Calico or Cilium, and routing is handled by kube-proxy.)"
    ],
    topics: ["kubernetes"],
    type: "tool",
    level: "intermediate",
    relatedTerms: ["node", "control-plane", "cni"],
    appearsIn: [
      { kind: "learning-path-module", title: "Kubernetes architecture: Control plane & Nodes", href: "/learning/paths/kubernetes" }
    ]
  },
  {
    slug: "kube-proxy",
    term: "kube-proxy",
    summary: "Network proxy running on each node reflecting Kubernetes Services and programming local iptables or IPVS rules.",
    plainEnglish: "kube-proxy is the traffic cop on every node. It watches the API server for changes to Services and Pods, and writes routing rules directly into the Linux operating system kernel (using iptables or IPVS) so that when an app sends a request to a Service IP, the request gets forwarded to a healthy pod.",
    analogy: "Like an office building mailroom coordinator: every time an employee moves desks, the coordinator updates the internal routing directory on each floor so mail sent to 'Accounting Department' is delivered to the right desk.",
    definition: "A network proxy running on each node in the cluster. It maintains network rules in the host kernel (using iptables or IPVS) to implement the Kubernetes Service abstraction, forwarding traffic directed to ClusterIPs or NodePorts to backend Pod endpoints.",
    practicalUsage: {
      scenario: "Verifying that kube-proxy has registered endpoints for a backend service in the local node iptables.",
      codeOrCommand: "sudo iptables -t nat -L KUBE-SERVICES -n -v",
      explanation: "Displays the kernel NAT forwarding rules managed by kube-proxy, showing how incoming virtual ClusterIP packets are load-balanced to pod IPs."
    },
    practicalTips: [
      "For large clusters (over 1,000 services), switch kube-proxy mode from 'iptables' to 'IPVS'; IPVS uses efficient O(1) hash tables rather than O(N) sequential iptables chains, dramatically reducing packet processing latency.",
      "Modern eBPF-based networking tools like Cilium can replace kube-proxy entirely with high-performance eBPF programs running inside the kernel.",
      "kube-proxy only handles TCP, UDP, and SCTP Layer 4 stream routing — it does not inspect HTTP headers, cookies, or SSL certificates."
    ],
    misconceptions: [
      "Myth: kube-proxy actively proxies every individual packet through user-space. (Reality: In modern clusters, kube-proxy runs in iptables or IPVS mode, configuring the Linux kernel to forward packets directly at line speed.)",
      "Myth: kube-proxy manages pod-to-pod cross-node routing. (Reality: Pod-to-pod routing across physical machines is handled by the CNI plugin; kube-proxy only handles Service ClusterIP/NodePort translation.)"
    ],
    topics: ["kubernetes"],
    type: "tool",
    level: "intermediate",
    relatedTerms: ["service-k8s", "cni"],
    appearsIn: [
      { kind: "learning-path-module", title: "Services and internal networking", href: "/learning/paths/kubernetes" }
    ]
  },
  {
    slug: "etcd",
    term: "etcd",
    summary: "Consistent, highly-available distributed key-value store serving as the single source of truth for all Kubernetes cluster state.",
    plainEnglish: "etcd is the single source of truth for your entire Kubernetes cluster. Every deployment, every pod, every secret, and every config map is stored inside etcd as a key-value record. If a piece of information isn't saved in etcd, to Kubernetes, it doesn't exist.",
    analogy: "Like the central land registry database for a city: every property deed, boundary, and owner record is securely written to this ledger. No matter who claims to own a house, the official registry record is the ultimate legal truth.",
    definition: "A strongly consistent, distributed key-value store that implements the Raft consensus algorithm. It holds the complete specification and status of all cluster objects, storing revisions sequentially to support watch streams and optimistic concurrency control.",
    practicalUsage: {
      scenario: "Taking a production snapshot backup of etcd before performing a major cluster version upgrade.",
      codeOrCommand: "ETCDCTL_API=3 etcdctl snapshot save /var/backups/etcd-backup-$(date +%Y%m%d).db \\\n  --endpoints=https://127.0.0.1:2379 \\\n  --cacert=/etc/kubernetes/pki/etcd/ca.crt \\\n  --cert=/etc/kubernetes/pki/etcd/server.crt \\\n  --key=/etc/kubernetes/pki/etcd/server.key",
      explanation: "Creates an atomic, consistent point-in-time snapshot backup of the entire Kubernetes cluster database for disaster recovery."
    },
    practicalTips: [
      "etcd write performance depends strictly on disk fsync latency: always place etcd storage on dedicated high-speed NVMe SSD drives; shared spinning disks cause heartbeat timeouts and cluster-wide leader election storms.",
      "Always maintain an odd number of etcd members (3 or 5): 3 members can tolerate 1 failure; 5 members can tolerate 2 failures. An even number (like 4) provides no extra fault tolerance and increases split-brain risk.",
      "Never talk to etcd directly from application code in production; all interactions should pass through the kube-apiserver with proper RBAC authentication and schema validation."
    ],
    misconceptions: [
      "Myth: etcd stores plain JSON objects. (Reality: etcd stores data serialized as efficient Protobuf binary blobs under paths like '/registry/pods/default/my-pod'.)",
      "Myth: More etcd nodes make writes faster. (Reality: Raft consensus requires a majority quorum acknowledgment for every single write; adding more nodes actually slows down writes.)"
    ],
    topics: ["kubernetes"],
    type: "tool",
    level: "advanced",
    relatedTerms: ["control-plane"],
    appearsIn: [
      { kind: "learning-path-module", title: "etcd architecture & high availability", href: "/learning/paths/kubernetes" }
    ]
  },
  {
    slug: "cni",
    term: "CNI (Container Network Interface)",
    summary: "Standardized specification and plugin ecosystem providing IP address management and cross-node pod network connectivity.",
    plainEnglish: "Out of the box, Kubernetes doesn't know how to connect pods across different servers. CNI is the plugin standard that connects the pipes: plugins like AWS VPC CNI, Calico, or Cilium assign IP addresses to pods and create the virtual overlay network so a pod on Server A can talk directly to a pod on Server B.",
    analogy: "Like the telecom infrastructure connecting houses across cities: each home gets an assigned telephone number (IP address), and the underground fiber optic cables (CNI routing) carry phone calls between homes in different neighborhoods.",
    definition: "A Cloud Native Computing Foundation specification and library set for configuring network interfaces in Linux containers. CNI plugins (e.g. Cilium, Calico, Flannel) allocate IP addresses (IPAM) and establish cross-host routing overlays (VXLAN, Geneve) or native routing.",
    practicalUsage: {
      scenario: "Checking which CNI plugin is managing networking and confirming all node network interfaces are initialized.",
      codeOrCommand: "ls -la /etc/cni/net.d/\nkubectl get pods -n kube-system -l k8s-app=cilium",
      explanation: "Inspects the active CNI configuration file loaded by kubelet and checks the health of the CNI daemonset managing node networking."
    },
    practicalTips: [
      "AWS VPC CNI assigns native AWS VPC IP addresses directly to pods, meaning pods can be addressed directly by cloud firewalls and security groups without NAT translation overhead.",
      "Cilium uses Linux eBPF to route packets directly in the kernel, bypassing iptables completely and providing dramatic latency reductions and deep network security observability.",
      "If newly created pods get stuck in 'ContainerCreating' status with network plugin errors, check the CNI daemonset logs in the kube-system namespace."
    ],
    misconceptions: [
      "Myth: Kubernetes comes with built-in pod-to-pod cross-node routing. (Reality: Kubernetes requires a third-party CNI plugin installed to provide cross-host pod connectivity.)",
      "Myth: All CNI plugins use slow overlay networks. (Reality: Modern CNIs like AWS VPC CNI or Calico BGP route packets natively across physical networks without encapsulation overhead.)"
    ],
    topics: ["kubernetes"],
    type: "protocol",
    level: "advanced",
    relatedTerms: ["kubelet", "kube-proxy", "pod"],
    appearsIn: [
      { kind: "learning-path-module", title: "Pod networking & CNI plugins", href: "/learning/paths/kubernetes" }
    ]
  },
  {
    slug: "csi",
    term: "CSI (Container Storage Interface)",
    summary: "Standardized specification allowing third-party storage vendors to attach persistent block and file storage volumes to Pods.",
    plainEnglish: "CSI is the universal adapter plug for hard drives in Kubernetes. Whether you want to attach an AWS EBS disk, Google Cloud Persistent Disk, Azure Disk, Ceph, or a NetApp SAN to your container, CSI provides the standard plug so storage vendors can write one driver that works everywhere.",
    analogy: "Like a standard HDMI or USB port on a television: you can plug in a PlayStation, an Apple TV, or a Blu-ray player without the TV manufacturer needing custom built-in circuitry for every brand.",
    definition: "An industry standard interface specification enabling storage vendors to write plugins that provision, attach, and mount block and file storage systems to containerized workloads without touching core Kubernetes codebase.",
    practicalUsage: {
      scenario: "Declaring a PersistentVolumeClaim requesting a 50GB fast cloud SSD that is dynamically created by the CSI driver.",
      codeOrCommand: "apiVersion: v1\nkind: PersistentVolumeClaim\nmetadata:\n  name: postgres-data\nspec:\n  accessModes:\n    - ReadWriteOnce\n  storageClassName: gp3-fast\n  resources:\n    requests:\n      storage: 50Gi",
      explanation: "The cloud CSI driver watches this claim, provisions a real 50GB gp3 EBS volume on AWS, attaches it to the host EC2 instance, and mounts it into the Postgres pod."
    },
    practicalTips: [
      "ReadWriteOnce (RWO) means the disk volume can only be mounted by a single node at a time — standard for databases like Postgres and MySQL. For shared multi-pod writes, use ReadWriteMany (RWX) backed by NFS, EFS, or Ceph.",
      "CSI drivers support volume snapshots: you can take instant point-in-time storage backups using the VolumeSnapshot API for automated disaster recovery.",
      "Always set 'reclaimPolicy: Retain' on critical database StorageClasses to prevent accidental deletion of physical disks when a namespace is deleted."
    ],
    misconceptions: [
      "Myth: ReadWriteOnce means only one pod can access the storage. (Reality: It means only one node can attach the storage; multiple pods on that same node can share an RWO volume.)",
      "Myth: Storage volume code is compiled inside the Kubernetes binary. (Reality: CSI decoupled storage completely into external, out-of-tree plugins developed independently by vendors.)"
    ],
    topics: ["kubernetes"],
    type: "protocol",
    level: "advanced",
    relatedTerms: ["pod"],
    appearsIn: [
      { kind: "learning-path-module", title: "Persistent storage with CSI & PVCs", href: "/learning/paths/kubernetes" }
    ]
  },
  {
    slug: "reconciliation-loop",
    term: "Reconciliation Loop",
    summary: "Continuous control pattern comparing desired state against actual observed cluster state and executing corrective actions.",
    plainEnglish: "The reconciliation loop is the secret behind Kubernetes self-healing. It is an endless loop running inside every controller that asks: 'What did the engineer ask for (desired state)? What actually exists right now (actual state)? What actions must I take to make reality match the desire?'",
    analogy: "Like a home thermostat: you set it to 72°F (desired state). The thermometer checks the room and reads 68°F (actual state). The thermostat turns on the furnace until reality equals the setting, then idles and checks again.",
    definition: "The core architectural pattern powering Kubernetes controllers and Operators. The controller continuously observes the cluster state via informers, calculates the delta against desired specifications in etcd, and executes idempotent mutations to reconcile the difference.",
    practicalUsage: {
      scenario: "Simulating self-healing: terminating a healthy pod to watch the Deployment controller automatically recreate it within seconds.",
      codeOrCommand: "kubectl delete pod -l app=web\n# Immediately check:\nkubectl get pods -l app=web",
      explanation: "The Deployment reconciliation loop detects that only 2 pods exist when 3 were requested, and immediately calls the API to create pod #3 to restore desired state."
    },
    practicalTips: [
      "Reconciliation functions in custom controllers must be strictly idempotent: running the loop 10 times with the same input must produce the exact same outcome as running it once.",
      "Use exponential backoff when reconciliation errors occur to prevent thrashing the API server with thousands of failing requests per second during cloud outages.",
      "Level-triggered design: Kubernetes controllers react to current state rather than relying on historical event streams, making them resilient to missed network notifications."
    ],
    misconceptions: [
      "Myth: Kubernetes controllers only react when you type a kubectl command. (Reality: Controllers run continuous loops 24/7; if a pod crashes at 3:00 AM on a Sunday, the loop detects and heals it instantly.)",
      "Myth: Controllers run imperative shell scripts. (Reality: Controllers execute declarative Go reconciliation logic against the Kubernetes REST API.)"
    ],
    topics: ["kubernetes"],
    type: "architecture_pattern",
    level: "intermediate",
    relatedTerms: ["deployment", "control-plane"],
    appearsIn: [
      { kind: "learning-path-module", title: "Controllers & the reconciliation loop", href: "/learning/paths/kubernetes" }
    ]
  },
  {
    slug: "configmap-secret",
    term: "ConfigMap & Secret",
    summary: "API primitives separating non-sensitive configuration parameters and sensitive credentials from container application code.",
    plainEnglish: "ConfigMaps and Secrets let you separate your configuration from your container code. Instead of hardcoding database URLs, feature flags, or passwords inside your image, you save them in Kubernetes. When your container starts, Kubernetes injects them as environment variables or mounted files.",
    analogy: "Like plugging an appliance into a wall outlet: your microwave doesn't care whether the electricity comes from solar, nuclear, or hydro power. ConfigMaps provide the power settings from the outside without modifying the microwave internal circuits.",
    definition: "Kubernetes resources that decouple configuration artifacts from container image binaries. ConfigMaps store non-confidential key-value pairs; Secrets store confidential data (passwords, tokens, keys) base64-encoded, mountable as files or injected as environment variables.",
    practicalUsage: {
      scenario: "Injecting an API secret key as an environment variable into a running deployment securely.",
      codeOrCommand: "kubectl create secret generic stripe-credentials \\\n  --from-literal=api-key=sk_live_94829482948\n# In Pod spec:\n# env:\n#   - name: STRIPE_API_KEY\n#     valueFrom:\n#       secretKeyRef:\n#         name: stripe-credentials\n#         key: api-key",
      explanation: "Stores the secret in etcd and passes it directly into the container process memory as an environment variable without storing the key in Git."
    },
    practicalTips: [
      "By default, Kubernetes Secrets are merely base64-encoded, NOT cryptographically encrypted at rest. Always enable KMS envelope encryption for etcd in production (AWS KMS, GCP Cloud KMS, or HashiCorp Vault).",
      "Mounting ConfigMaps and Secrets as volume files allows Kubernetes to automatically update the files when the ConfigMap changes; injecting them as environment variables requires restarting the pod to pick up changes.",
      "Use tools like External Secrets Operator or Sealed Secrets to commit encrypted secret definitions safely to Git repositories for GitOps workflows."
    ],
    misconceptions: [
      "Myth: Base64 encoding provides security. (Reality: Base64 is simple encoding, not encryption; anyone who can read the secret can decode it instantly with 'base64 -d'.)",
      "Myth: Updating a Secret automatically updates environment variables in running containers. (Reality: Linux processes only read environment variables at startup; mounted files update dynamically, but env vars do not.)"
    ],
    topics: ["kubernetes"],
    type: "concept",
    level: "beginner",
    relatedTerms: ["pod", "deployment"],
    appearsIn: [
      { kind: "learning-path-module", title: "Configuration management with ConfigMaps & Secrets", href: "/learning/paths/kubernetes" }
    ]
  },
  {
    slug: "hpa",
    term: "HPA (Horizontal Pod Autoscaler)",
    summary: "Controller automatically scaling the number of Pod replicas up or down based on observed CPU, memory, or custom metrics.",
    plainEnglish: "HPA is your automated elasticity manager. When black Friday traffic hits and CPU usage spikes to 80%, HPA automatically spins up 15 extra pods to handle the load. When traffic drops at night, it gracefully scales back down to save cloud costs.",
    analogy: "Like an automatic lane expansion on a highway toll bridge: when traffic backs up during rush hour, the bridge authority opens 8 extra toll booths to clear the congestion, closing them once traffic subsides.",
    definition: "A Kubernetes controller that periodically queries the Metrics Server or custom Prometheus adapter to adjust the replica count of a Deployment or StatefulSet to match a target metric utilization threshold.",
    practicalUsage: {
      scenario: "Configuring auto-scaling between 2 and 20 pods whenever average CPU utilization exceeds 70%.",
      codeOrCommand: "kubectl autoscale deployment payment-api --cpu-percent=70 --min=2 --max=20\nkubectl get hpa payment-api --watch",
      explanation: "HPA monitors average CPU usage every 15 seconds, calculating desired replicas = ceil[currentReplicas * (currentMetric / targetMetric)]."
    },
    practicalTips: [
      "HPA requires resource requests to be configured on all containers in the target pods; if CPU requests are omitted, HPA cannot calculate percentage utilization and will fail to scale.",
      "Configure stabilization windows (behavior.scaleDown.stabilizationWindowSeconds: 300) to prevent 'flapping' — rapid scaling up and down during short bursty traffic spikes.",
      "Pair HPA with Kubernetes Cluster Autoscaler or Karpenter: when HPA scales out pods and the worker nodes run out of capacity, Karpenter automatically provisions new cloud VM instances in seconds."
    ],
    misconceptions: [
      "Myth: HPA can scale pods based on memory without risk. (Reality: Memory is not a compressible resource; applications rarely release allocated heap memory back to the OS immediately, causing HPA to scale out and never scale back down.)",
      "Myth: HPA scales immediately within 1 millisecond. (Reality: HPA polls metrics on a periodic interval (default 15s) and cloud VM provisioning takes 1-2 minutes; use pre-warmed capacity for massive instant flash sales.)"
    ],
    topics: ["kubernetes"],
    type: "tool",
    level: "intermediate",
    relatedTerms: ["deployment", "pod"],
    appearsIn: [
      { kind: "learning-path-module", title: "Autoscaling with HPA & VPA", href: "/learning/paths/kubernetes" }
    ]
  }
];
