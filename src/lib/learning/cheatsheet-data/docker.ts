import type { CheatSheet } from "../cheatsheet-types";

export const dockerCheatSheet: CheatSheet = {
  topicSlug: "docker",
  topicName: "Docker",
  description: "Quick reference guide for Docker commands, Dockerfile directives, Compose syntax, and storage drivers.",
  lastUpdated: "2026-07-25",
  sections: [
    {
      title: "Image Commands",
      items: [
        { command: "docker build -t name:tag .", description: "Build an image from a Dockerfile in current directory using BuildKit.", relatedGlossaryTerm: "docker-build-cmd" },
        { command: "docker pull name:tag", description: "Fetch an image manifest and layer blobs from an OCI registry.", relatedGlossaryTerm: "container-registry" },
        { command: "docker push name:tag", description: "Upload local image layers and manifest to a target registry.", relatedGlossaryTerm: "container-registry" },
        { command: "docker images", description: "List locally cached images with repository, tag, ID, and size.", relatedGlossaryTerm: "container-image" },
        { command: "docker rmi image_id", description: "Remove specified image layers from host local storage if unused.", relatedGlossaryTerm: "container-image" },
        { command: "docker history image_id", description: "Inspect step instructions and size contribution of each layer blob.", relatedGlossaryTerm: "unionfs" },
        { command: "docker inspect image_id", description: "Output full JSON metadata spec for an image manifest.", relatedGlossaryTerm: "oci-image-spec" }
      ]
    },
    {
      title: "Container Lifecycle Commands",
      items: [
        { command: "docker run -d -p 8080:80 --name app image", description: "Launch container detached in background with host-to-container port mapping.", relatedGlossaryTerm: "docker-run-cmd" },
        { command: "docker ps -a", description: "List all container process instances (running, stopped, exited).", relatedGlossaryTerm: "container" },
        { command: "docker exec -it container_id /bin/sh", description: "Open an interactive pseudo-TTY shell inside a running container.", relatedGlossaryTerm: "docker-exec-cmd" },
        { command: "docker logs -f --tail 100 container_id", description: "Stream container stdout/stderr log stream continuously.", relatedGlossaryTerm: "container" },
        { command: "docker stop container_id", description: "Send SIGTERM signal to main process, defaulting to SIGKILL after 10 seconds.", relatedGlossaryTerm: "container" },
        { command: "docker rm -f container_id", description: "Forcefully kill running container process and delete its top write layer.", relatedGlossaryTerm: "container" },
        { command: "docker stats", description: "Display live stream of container CPU, memory, network I/O usage.", relatedGlossaryTerm: "cgroups" }
      ]
    },
    {
      title: "Docker Compose",
      items: [
        { command: "docker compose up -d", description: "Build, recreate, and start multi-container environment in detached mode.", relatedGlossaryTerm: "docker-compose-cmd" },
        { command: "docker compose down -v", description: "Stop services and purge internal networks and named volume mounts.", relatedGlossaryTerm: "docker-compose-cmd" },
        { command: "docker compose logs -f service_name", description: "Tail output logs for a specific service defined in compose file.", relatedGlossaryTerm: "docker-compose-cmd" },
        { command: "docker compose ps", description: "List status and ports of containers linked to current compose context.", relatedGlossaryTerm: "docker-compose-cmd" }
      ]
    },
    {
      title: "Dockerfile Directives",
      items: [
        { command: "FROM image:tag AS stage", description: "Specify base image layer and assign stage name for multi-stage builds.", relatedGlossaryTerm: "multi-stage-build" },
        { command: "RUN command", description: "Execute shell build command, committing output as a new read-only image layer.", relatedGlossaryTerm: "dockerfile" },
        { command: "COPY --from=stage src dst", description: "Copy files from host build context or earlier stage build artifact.", relatedGlossaryTerm: "multi-stage-build" },
        { command: "ENV KEY=VALUE", description: "Set environment variable persistent in both build steps and runtime process.", relatedGlossaryTerm: "dockerfile" },
        { command: "CMD [\"executable\", \"arg1\"]", description: "Define default execution arguments for container launch (overridable by CLI).", relatedGlossaryTerm: "dockerfile" },
        { command: "ENTRYPOINT [\"executable\"]", description: "Set fixed binary executable for container runtime process.", relatedGlossaryTerm: "dockerfile" }
      ]
    }
  ]
};
