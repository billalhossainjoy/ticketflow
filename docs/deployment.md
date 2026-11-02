# TicketFlow Deployment

## Overview

TicketFlow runs as Docker containers on an ARM64 Debian home server
named `oparadox`.

GitHub Actions verifies the code, publishes an API image to GitHub
Container Registry (GHCR), and deploys it over SSH through Tailscale.

The API image is tagged with the Git commit SHA so each deployment
can be traced to its source revision.

## Workflow files

| File                                    | Responsibility                                    |
| --------------------------------------- | ------------------------------------------------- |
| `.github/workflows/ci.yml`              | Triggers, concurrency, and execution order        |
| `.github/workflows/verify.yml`          | Formatting, types, tests, and Docker image checks |
| `.github/workflows/publish.yml`         | Publish AMD64 and ARM64 API images to GHCR        |
| `.github/workflows/deploy.yml`          | Fetch secrets, connect to the server, and deploy  |
| `.github/workflows/infisical-check.yml` | Manually diagnose Infisical authentication        |

Pull requests run verification. Pushes to `main` also publish and deploy.

## Runtime configuration

Production services are defined in `deploy/compose.production.yml`.

- `api` runs the Express API on container port 3000.
- The host port binds to `127.0.0.1:3000`.
- `cloudflared` is configured to reach the API at `http://api:3000`.
- Both services share the `app` Docker bridge network.
- The API health endpoint is `/health/live`.

## Verification status

- Initial API deployment: reported successful.
- Public HTTPS access through Cloudflare Tunnel: verification pending.
- Automatic rollback: not implemented.

## Operational checks

Run these commands on `oparadox`.

### List running containers

```bash
docker ps --filter label=com.docker.compose.project=ticketflow
```

### Check the API locally

```bash
curl --fail-with-body --max-time 10 \
  http://127.0.0.1:3000/health/live
```

Expected response: `{"status":"ok"}`.

### Read container logs

```bash
docker logs --tail 50 ticketflow-api-1
docker logs --tail 50 ticketflow-cloudflared-1
```

Confirm container names with `docker ps` first.

### Check public HTTPS access

Run from another machine, replacing `YOUR_API_HOSTNAME`:

```bash
curl --fail-with-body --max-time 20 \
  https://YOUR_API_HOSTNAME/health/live
```

A running tunnel container alone does not prove public access works.

## Deployment failures

| Failure                         | First action                                                                                 |
| ------------------------------- | -------------------------------------------------------------------------------------------- |
| Infisical rejects OIDC          | Run the connection-check workflow and compare its subject with the saved trust configuration |
| Tailscale rejects OIDC          | Inspect the trust credential's rejection details                                             |
| SSH host verification fails     | Verify the server's host key before updating known hosts                                     |
| SSH authentication fails        | Check that the deployment private key matches an authorized public key                       |
| Image pull fails                | Check the image tag and GHCR access                                                          |
| API health check fails          | Inspect API logs and container state                                                         |
| Cloudflare cannot reach the API | Check the tunnel route, shared network, and API health                                       |

A failed deployment does not automatically require reverting the merge.
Fix configuration failures and retry the failed job.

If application code is faulty, merge a fix or revert through a pull request.
Automatic rollback is not currently implemented.
