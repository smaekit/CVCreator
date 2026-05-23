# 0001 — Theme usage is derived from PDF exports, not from theme selection

Status: Accepted · Date: 2026-05-22

## Context

The admin dashboard needs a "Theme usage" breakdown — for each of the three CV themes (Burgundy, Nordic, Charcoal), how often is it actually being used? This had to be defined precisely before implementation, because two reasonable interpretations exist:

1. **Selection-based**: which theme a user has chosen for a given CV.
2. **Export-based**: which theme each PDF was actually rendered with.

Today, theme is purely client-side state — the frontend's `cv-builder` reads/writes `localStorage["cv-theme"]` and passes the value as a query parameter (`?theme=…`) to `POST /api/cvs/{id}/pdf`. The server stores nothing about themes on the `CV` entity.

To enable theme analytics, we either add a `CV.ThemeKey` column (selection-based) or persist the theme on every PDF export (export-based) — or both.

## Decision

Theme analytics are derived from a new `PdfDownloads` audit table — `(Id, UserId, CvId, ThemeKey, GeneratedAt)` — populated by the `GeneratePdfCommand` handler after each successful render. We do **not** add a `CV.ThemeKey` column.

The `/api/admin/stats` response includes the full theme set (Burgundy / Nordic / Charcoal) even when a theme has zero exports, with counts grouped by `PdfDownloads.ThemeKey`.

## Consequences

**Positive**

- One new table covers PDF count, theme usage, daily PDF curve, and per-CV download counts.
- No frontend changes required to write theme to the server — the existing `?theme=` query parameter is already authoritative.
- Theme usage measures **intentional, completed exports** — the only theme choice that actually matters to a recruiter. Idle theme browsing in the builder doesn't pollute the metric.

**Negative**

- A CV whose owner never exports a PDF contributes nothing to the theme breakdown. This is *intentional* — those CVs aren't part of the funnel — but worth understanding when reading the dashboard.
- If we later decide to render the CV preview with the user's last-chosen theme on the server side (for shareable preview URLs, etc.), we'll need a `CV.ThemeKey` column at that point. That's an additive change and not a breaking one.

**Trade-off considered and rejected**

A `CV.ThemeKey` column was the natural alternative. It was rejected because:

- It would require the frontend to PATCH the CV every time the user switches themes in the builder — extra mutation, extra failure mode.
- Theme usage would become ambiguous: do we count selections (high, noisy) or exports (the metric we actually want)? Defining one canonically frees us from that ambiguity.
- The new `PdfDownloads` table is needed anyway for download counts; piggybacking theme on it costs nothing.
