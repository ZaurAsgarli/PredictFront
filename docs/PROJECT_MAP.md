# PredictBack Protocol — Project Map

## Purpose

This document serves as a high-level table of contents for the PredictBack Protocol repository. It is intended for reviewers and contributors who need to understand system boundaries, data flow, and business intent without reading implementation details.

## Primary architectural entry points

- **Global protocol overview** — `README.md`  
  Describes the PredictBack ecosystem as a hybrid DPM, including the three-port decomposition (8000/3000/3001) and the core operating philosophies (source of truth, RBAC, observability, integrity).

- **Oversight layer (admin)** — `apps/admin/README.md`  
  Explains how the protocol is governed and monitored: ML insights, security event logging, disputes, and controlled user state transitions. Focuses on operational value and incident response posture.

- **Trading interface (user UI)** — `apps/frontend/README.md`  
  Explains the user journey (discovery → analysis → execution → payout), the visual logic of charts and leaderboards, and the performance model used to avoid request storms and UI instability.

## Backend workspace (engine room)

The backend runs in a separate workspace directory (`PredictBack`). Its canonical documentation is:

- **Backend engine room** — `PredictBack/backend_api/README.md`  
  Explains the data model architecture (markets, trades, positions), the AI security layer (risk and anomaly detection), the Web3 simulation/event model, and the scalability posture for large datasets.

Additional backend documentation that remains relevant for reviewers:

- **Testing** — `PredictBack/TESTING_GUIDE.md`  
  End-to-end testing philosophy and audit-oriented validation.

- **Database layer** — `PredictBack/database_layer/docs/*` and `PredictBack/database_layer/erd.md`  
  Normalization notes, explain plans, and schema-level reasoning.

- **Smart contracts** — `PredictBack/smart_contracts/README.md`  
  Contract architecture and development/testing structure.

## How to use this map (review workflow)

- **System intent**: start with `README.md`.
- **Operational controls**: read `apps/admin/README.md`.
- **User experience and performance boundaries**: read `apps/frontend/README.md`.
- **Data truth and security logic**: read `PredictBack/backend_api/README.md`.

