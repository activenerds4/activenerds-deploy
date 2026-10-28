import type { CheatSheet } from "../cheatsheet-types";

export const kubernetesCheatSheet: CheatSheet = {
  topicSlug: "kubernetes",
  topicName: "Kubernetes",
  description: "Quick reference guide for kubectl commands, pod debugging, workloads, services, and cluster operations.",
  lastUpdated: "2026-07-25",
  sections: [
    {
      title: "Core kubectl & Declarative Apply",
      items: [
        { command: "kubectl apply -f manifest.yaml", description: "Declaratively create or update cluster resources using 3-way merge patch.", relatedGlossaryTerm: "kubectl-apply-cmd" },
        { command: "kubectl get pods -A -o wide", description: "List all Pods across all namespaces with Node assignment IPs.", relatedGlossaryTerm: "kubectl-get-cmd" },
        { command: "kubectl describe pod pod_name", description: "Fetch detailed events, status state, and volume mounts of a resource.", relatedGlossaryTerm: "pod" },
        { command: "kubectl delete -f manifest.yaml", description: "Gracefully terminate resources declared in target YAML manifest.", relatedGlossaryTerm: "kubectl-apply-cmd" }
      ]
    },
    {
      title: "Pod Inspection & Debugging",
      items: [
        { command: "kubectl logs -f pod_name -c container_name", description: "Tail container stdout/stderr logs continuously for a target Pod container.", relatedGlossaryTerm: "pod" },
        { command: "kubectl exec -it pod_name -- /bin/bash", description: "Open interactive terminal shell in target Pod container.", relatedGlossaryTerm: "kubectl-exec-cmd" },
        { command: "kubectl port-forward pod/pod_name 8080:80", description: "Forward local port 8080 directly to target Pod port 80.", relatedGlossaryTerm: "pod" },
        { command: "kubectl cp pod_name:/path/to/file ./file", description: "Copy files to or from container filesystem.", relatedGlossaryTerm: "kubectl-exec-cmd" }
      ]
    },
    {
      title: "Deployments & Scaling",
      items: [
        { command: "kubectl scale deployment/my-app --replicas=5", description: "Imperatively adjust desired replica count for target Deployment.", relatedGlossaryTerm: "deployment" },
        { command: "kubectl rollout status deployment/my-app", description: "Watch progressive rollout status of active deployment revision.", relatedGlossaryTerm: "deployment" },
        { command: "kubectl rollout history deployment/my-app", description: "List previous revision history snapshots stored for rollback.", relatedGlossaryTerm: "deployment" },
        { command: "kubectl rollout undo deployment/my-app", description: "Rollback deployment to previous revision state immediately.", relatedGlossaryTerm: "deployment" }
      ]
    },
    {
      title: "Services & Ingress",
      items: [
        { command: "kubectl get svc,ep", description: "List internal ClusterIP/NodePort Services alongside active pod Endpoint IPs.", relatedGlossaryTerm: "service-k8s" },
        { command: "kubectl expose deployment my-app --port=80 --type=ClusterIP", description: "Create internal Service exposing deployment Pods on port 80.", relatedGlossaryTerm: "service-k8s" },
        { command: "kubectl get ingress", description: "List configured Ingress HTTP routing rules and external load balancer IPs.", relatedGlossaryTerm: "ingress" }
      ]
    },
    {
      title: "ConfigMaps & Secrets",
      items: [
        { command: "kubectl create configmap my-config --from-file=config.properties", description: "Generate ConfigMap resource from a local raw file payload.", relatedGlossaryTerm: "configmap" },
        { command: "kubectl create secret generic my-secret --from-literal=key=val", description: "Create base64-encoded secret payload imperatively.", relatedGlossaryTerm: "secret-k8s" }
      ]
    }
  ]
};
