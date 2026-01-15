# PredictBack Protocol — Admin Intelligence Dashboard (Port 3001)

## Purpose: the oversight layer

The Admin Intelligence Dashboard is the protocol’s operational control plane. It provides administrators with a coherent, permissioned view of platform health, security posture, and market integrity—while remaining coupled to the canonical backend as the source of truth.

At a business level, this surface exists to:

- **Protect market integrity**: detect anomalies, reduce manipulation, and preserve fair outcomes.
- **Reduce operational latency**: surface risks early and enable rapid intervention.
- **Maintain auditability**: ensure actions (blocks, dispute resolutions) are traceable and reviewable.

## System monitoring (signals and telemetry)

The dashboard is organized around “signals” that describe whether the protocol is healthy:

- **ML insights**: model-derived signals describing risk, manipulation likelihood, and behavioral anomalies.
- **Security logs**: authentication and access events, suspicious activity traces, and administrative actions.
- **System health**: summarized service state for operational confidence during incident response.

## Oversight tools (actions and governance)

Administrative capabilities are expressed as controlled state transitions:

- **Disputes**: review and resolve disputes with explicit accept/reject actions.
- **User role transitions**: restore trading access or enforce bans, with auditable intent.
- **Incident response**: correlate security events and ML signals to support rapid containment.

## Analytics (money flow and approval logic)

Analytics panels are decision aids, not accounting systems:

- **Money flow**: a high-level proxy for platform activity, derived from authoritative trade events and summarized over time.
- **Trade review**: ranked lists that prioritize “high impact” behavior for manual review.

## Security boundaries and trust model

- **Backend remains authoritative**: this UI does not define truth; it requests, renders, and submits actions.
- **RBAC is the boundary**: administrative visibility is a permissioned lens, not a separate backend.
- **Observability is first-class**: every administrative action must be reviewable and attributable.

## Documentation pointer

For repository-wide navigation, see `docs/PROJECT_MAP.md`.