# PredictBack Protocol — Trading Interface (Port 3000)

## Purpose: the execution environment

The Trading Interface is the primary user surface of PredictBack Protocol. It is designed to convert curiosity into participation through a predictable, low-friction trading loop, while preserving strict security boundaries:

- The frontend is a **presentation layer**.
- The backend is the **source of truth**.
- User actions are expressed as **intents** (requests), not as authoritative state transitions.

## The trading loop (user journey)

The platform’s core user journey is intentionally cyclical:

- **Discovery**: browse markets, filter by category, and identify opportunities.
- **Analysis**: evaluate market context via price history and trade activity.
- **Execution**: submit a trade intent; the backend validates and records the result.
- **Payout / outcome**: observe resolution, settlement events, and position outcomes.

This loop is optimized for clarity and repeat engagement while minimizing accidental misuse.

## Visual logic (how users interpret the protocol)

The UI is designed to translate complex market mechanics into legible signals:

- **“Heartbeat” price history**: time-series movement as a proxy for collective belief updates.
- **Trade activity**: recent trades provide market participation context without revealing private or sensitive data.
- **Gamified leaderboards**: competitive framing that increases retention and encourages sustained participation.

## Performance model (stability under high-frequency data)

Because market activity can spike, the UI emphasizes stability:

- **Deduplicated requests**: identical requests reuse a single in-flight promise to avoid request storms.
- **Fail-fast behavior**: rate limits and authorization failures are not retried automatically.
- **Explicit loading and empty states**: the interface remains usable even under partial data availability.

## Trust boundaries and data integrity

The Trading Interface follows a strict integrity model:

- **No frontend-authoritative balances**: balances and positions must be sourced from the backend and/or explicit wallet consent.
- **No privileged data leakage**: administrative-only data (e.g., full wallet/contract addresses) must not be exposed to non-admin users.
- **Backend-enforced permissions**: the frontend may hide UI controls, but the backend enforces access and policy.

## Relationship to the other two ports

- **Port 8000 (Django REST Engine)**: validates and records all actions; computes analytics; emits security/ML telemetry.
- **Port 3001 (Admin Dashboard)**: provides oversight, dispute resolution, and security monitoring using the same backend.

