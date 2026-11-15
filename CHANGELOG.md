# Changelog

## 0.2.0-rc.1 — 2026-11-15

Release candidate for review; production remains on the previous private version.

- Add email/password login, email confirmation, approval, password recovery and administrator TOTP.
- Apply caller-scoped authorization to inventory, import, refresh, MCP, scenarios and account administration.
- Add PostgreSQL RLS migration for approved inventory readers, own-user scenarios, restricted administration and updater accounts.
- Move saved scenarios from shared-browser storage to user-owned records, with a four-record database quota.
- Add immutable-to-client audit events and an administrator read view.
- Preserve the existing observatory and add a development-only demonstration.
- Add automated API authorization tests, PostgreSQL policy tests, and a validation-only GitHub Actions workflow.

Publication is blocked until a real Supabase staging project is connected, the migration is applied, Auth/SMTP/MFA integration passes and the privacy notice is finalized. No production D1 data or audience has been changed.

## Previous version

Archived GitHub branch: `archive/observatorio-pre-auth-rls-2026-11-15`.
GitHub commit: `bc0984c7bf20e0b70a2dfc4f195030bb2976f73f`.
Deployed Site version: 13, source commit `3f9d50372f2ae3626b5931b7dc71318eba3618f1`.
Both commits have the same source tree `c017955ace4a17357e2972aac5d2fa11d155536f`.
