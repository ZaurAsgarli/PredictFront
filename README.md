# PredictBack Protocol

## Project overview

PredictBack Protocol is a hybrid Decentralized Prediction Market (DPM) designed to bridge the performance and ergonomics of Web2 execution with the auditability and settlement guarantees of Web3 systems.

At a business level, the protocol’s value proposition is:

- **Truth aggregation at scale**: markets route diverse opinions into probabilistic price signals.
- **AI-secured trading**: risk scoring and anomaly detection reduce manipulation and abuse.
- **On-chain fidelity**: settlements and event trails preserve verifiability (with optional simulation for local development).

## The three-port ecosystem

The system is intentionally decomposed into three runtime surfaces with distinct responsibilities and security boundaries:

- **Port 8000 — Django REST Engine (Source of Truth & AI Scoring)**  
  The canonical authority for identities, markets, trades, analytics, and security telemetry. It enforces authorization and preserves audit trails.

- **Port 3000 — User Execution Environment (Trading & Social UI)**  
  The user-facing interface for discovery, analysis, and trade execution. It is a presentation layer: it requests data and submits intents, but does not define truth.

- **Port 3001 — Admin Intelligence Dashboard (Security & Oversight)**  
  An oversight surface for operational control: disputes, user status transitions, security telemetry, and ML-driven signals. It is not a “different backend”; it is a different view over the same backend.

## Core philosophies

- **Backend as the source of truth**: the frontend never “guesses” authoritative values.
- **Role-based access control (RBAC)**: administrative visibility is a permissioned lens over shared endpoints, not a separate API universe.
- **Observability by design**: security events, ML detections, and admin actions must be traceable and reviewable.
- **Integrity over convenience**: stability mechanisms (deduplication, request governors, safe fallbacks) exist to protect correctness and system health.

## End-to-end system flow (high level)

- **Market lifecycle**: market creation → liquidity/participation → price evolution → resolution → settlement/audit.
- **Trade lifecycle**: client intent → backend validation → position/trade recording → analytics updates → ML/security evaluation.
- **Oversight lifecycle**: anomaly detection → alert surfaced → admin review → action (block/unblock, accept/reject dispute) → audit log.

## Documentation map

- **Oversight layer**: `apps/admin/README.md`
- **Trading interface**: `apps/frontend/README.md`
- **Engine room (backend)**: see backend workspace `backend_api/README.md`
- **Repository map**: `docs/PROJECT_MAP.md`
