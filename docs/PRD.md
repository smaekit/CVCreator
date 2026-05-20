# CVCreator — Product Requirements Document

**Status:** ready-for-agent
**Owner:** Marcus Jakobsson
**Created:** 2026-05-20

---

## Problem Statement

As a consultant who applies to many companies, I maintain the same underlying career history (assignments, skills, education, certifications, languages) but every assignment I apply for needs a CV tailored to that specific company — different highlighted projects, a different introduction angle, a different selection of skills on the front page, and increasingly in two languages (Swedish and English) depending on the client.

Today I copy the previous CV, rename it, hand-edit Word or Google Docs to swap in different content, and re-export to PDF. The process is slow, the layout drifts between exports, translations get out of sync, and I can never be sure the PDF I send is exactly what I saw on screen. There is no single source of truth for my professional history; it lives, fragmented, across many slightly-diverging copies of the same document.

I want a personal tool that holds my entire professional history once, lets me assemble company-specific CVs by selection rather than copy-paste, keeps Swedish and English in lockstep, and produces a PDF that is byte-for-pixel identical to what I preview in the browser.

## Solution

A multi-user web application built around two concepts:

- **Profile** — one per user; the canonical home of all raw career data (assignments, skills, education, certifications, languages, profile picture, introduction). Every text field exists as a Swedish + English pair.
- **CV** — many per user; a *named selection* over the Profile, targeted at a specific company, in a specific language. A CV holds selections (which assignments, skills, etc. are included), per-CV overrides (text edits that never leak back to the Profile), and front-page composition (highlighted assignments, freetext-headed groups of skills and certifications). Each CV is automatically named `{FirstName} {LastName}, {Company}, {SV|EN}`.

The user opens a split-panel **CV Builder** where toggling a selection on the left updates a live A4 preview on the right, with a dashed red boundary line marking the bottom of page 1 and a warning when content overflows. AI assistance (OpenAI `gpt-5-nano`) can improve or translate any text field via a side-by-side streaming modal. When the user clicks Download, PuppeteerSharp navigates to the very same preview component used in the browser and prints it to PDF — guaranteeing pixel parity by construction.

## User Stories

### Accounts & Authentication

1. As a new user, I want to register with email + password, so that I can have a private space for my profile and CVs.
2. As a returning user, I want to log in and receive a JWT, so that I can access my data across sessions.
3. As an authenticated user, I want my JWT to be attached automatically to API requests, so that I don't have to think about authentication after logging in.
4. As an authenticated user, I want protected routes to redirect me to login when my token has expired, so that I am never staring at a half-broken page.

### Profile — Personal Info

5. As a user, I want to set my first name and last name, so that they appear in CV file names and headers.
6. As a user, I want to upload a profile picture, so that it appears on every CV I generate.
7. As a user, I want my profile picture stored in Azure Blob Storage (Azurite locally), so that the database stays lean and images load fast.
8. As a user, I want a single Profile per account, so that I have one source of truth for my career history.

### Profile — Bilingual Text Fields

9. As a Swedish-speaking consultant, I want every freetext field to exist as a Swedish + English pair, so that I can target clients in either language.
10. As a user, I want a top-of-page `SV | EN` toggle on the profile editor, so that I can edit one language at a time without two textareas crowding every field.
11. As a user, I want to write my introduction in both languages, so that each CV's intro section is ready to go.
12. As a user, I want to translate one field from SV to EN (or vice versa) with one click, so that I don't have to leave the app to keep my languages in sync.
13. As a user, I want the "Translate" button to appear only when the other-language field is empty, so that I'm not tempted to overwrite a translation I already polished.

### Profile — Assignments

14. As a user, I want to create an assignment with a bilingual title and description, a client name, a start date, and an optional end date (null = ongoing), so that I capture each engagement properly.
15. As a user, I want to attach skills to an assignment, so that each CV can later show the skills exercised in that role.
16. As a user, I want to edit or delete an assignment, so that I can correct mistakes or retire stale entries.
17. As a user, I want to see all my assignments listed chronologically, so that I can scan my history at a glance.

### Profile — Skills, Education, Certifications, Languages

18. As a user, I want to create a skill with a name and an optional freetext category, so that I can group skills loosely (e.g., "Backend", "Cloud") without a rigid taxonomy.
19. As a user, I want to add education entries with a bilingual degree, a school, a start year, and an optional end year, so that I can list ongoing studies as well as completed ones.
20. As a user, I want to add certifications with a bilingual name, a year, and a link, so that recruiters can verify them.
21. As a user, I want to add spoken/written languages with a proficiency level (Native, Fluent, Professional, Basic), so that I can demonstrate communication skills relevant to the role.
22. As a user, I want full CRUD on every profile section, so that my profile stays current as my career evolves.

### CV List

23. As a user, I want a dashboard listing every CV I've ever created, so that I can find and reopen prior CVs.
24. As a user, I want each CV displayed as `{FirstName} {LastName}, {Company}, {SV|EN}`, so that I can identify which CV is which at a glance.
25. As a user, I want to delete a CV, so that obsolete applications can be cleared away.

### CV Creation

26. As a user, I want to create a new CV by entering a target company name and choosing SV or EN, so that the CV is named and bound to its target from the start.
27. As a user, I want a new CV to start with no selections, so that I begin from a deliberate blank slate and pick exactly what's relevant.

### CV Builder — Split Panel

28. As a user, I want a two-panel builder with selections on the left and a live preview on the right, so that I can see the effect of every change immediately.
29. As a user, I want the preview scaled down to fit the right panel (~60%) but otherwise pixel-identical to the eventual PDF, so that I trust what I see.
30. As a user, I want selections to save to the server automatically (debounced ~500ms) so that I never lose progress and never have to click "Save".
31. As a user, I want preview updates to feel instant (optimistic updates), so that the tool feels responsive even on a slow connection.

### CV Builder — Selecting Profile Data

32. As a user, I want a checkbox next to every assignment, skill, certification, education entry, and language, so that I can pick exactly which items appear on this CV.
33. As a user, I want to reorder items within a section, so that the most relevant content appears first.

### CV Builder — Front Page Composition

34. As a user, I want to mark up to 2 assignments as "highlighted", so that they appear prominently on the front page.
35. As a user, I want highlighted assignments rendered in a condensed style (no skills list) on the front page, so that the front page stays scannable.
36. As a user, I want to be prevented from highlighting more than 2 assignments, so that the front page layout stays predictable.
37. As a user, I want to create "front page groups" with my own bilingual header (e.g. "Cloud Skills" / "Molnkunskaper"), so that I can curate themed sections.
38. As a user, I want each front page group to contain a mix of skills *or* certifications, so that I can group items by topic regardless of their source section.
39. As a user, I want to reorder front page groups and items within them, so that I control the visual hierarchy.
40. As a user, I want a freetext "Years of experience" field per CV, so that I can phrase it naturally (e.g. "10+ years", "ca. 8 år").

### CV Builder — Per-CV Overrides

41. As a user, I want to edit the introduction inline on a specific CV without changing my profile's master introduction, so that I can tailor wording to one company without polluting other CVs.
42. As a user, I want to edit an assignment's description inline on a specific CV without changing the profile's master description, so that I can re-angle a project for a particular client.
43. As a user, I want overrides to be obviously distinct from inherited profile text (visual cue or revert button), so that I know which fields I've already tailored.

### CV Builder — A4 Boundary & Overflow

44. As a user, I want a dashed red line drawn at exactly the bottom of A4 page 1 in the preview, so that I can see at a glance whether the front page fits.
45. As a user, I want content that overflows page 1 visually flagged (yellow background on the overflowing region), so that I can find what to trim.
46. As a user, I want a warning banner at the top of the builder when the front page overflows, so that I notice the problem even if I'm scrolled away from the offending region.

### CV Builder — Bilingual Fallback Warnings

47. As a user creating an EN CV, I want fields with no English text to fall back to Swedish (with a yellow highlight) rather than render empty, so that the preview never shows blanks.
48. As a user, I want a banner showing the count of missing translations, so that I know exactly how much work is left before this CV is "clean".
49. As a user, I want the missing-translation highlight reproduced in the PDF, so that I won't accidentally send a half-Swedish CV to an English-only client.

### AI Assistance

50. As a user, I want to click "Improve" on any freetext field, so that the AI can refine my phrasing.
51. As a user, I want the AI's suggested text to stream into a side-by-side modal (original left, suggestion right), so that I can compare progressively as it generates.
52. As a user, I want to accept the suggestion (replacing the original) or reject it (keep the original), so that I retain full editorial control.
53. As a user, I want to click "Translate" on any field where the other-language version is empty, so that I can populate translations quickly.
54. As a user, I want translation to stream into the same side-by-side modal, so that the AI experience is consistent across improve and translate.
55. As a user, I want to cancel a stream mid-flight, so that I don't waste time on a clearly bad suggestion.

### PDF Export

56. As a user, I want a "Download PDF" button in the builder, so that I can export the finished CV.
57. As a user, I want the downloaded file named `{FirstName} {LastName}, {Company}, {SV|EN}.pdf`, so that the file system organises CVs sensibly.
58. As a user, I want the PDF to look pixel-identical to the browser preview, so that I trust what I send.
59. As a user, I want the PDF generated on the server (Puppeteer in the .NET container) rather than on my machine, so that the output is deterministic regardless of my OS or browser.
60. As an operator, I want the preview route to be reachable only with a 60-second token issued for a specific CV, so that the public route cannot be scraped or abused.

### Local Development

61. As a developer, I want `docker compose up` to start the API, frontend, Postgres, and Azurite, so that I can run the entire stack with one command.
62. As a developer, I want hot reload on both backend and frontend during local dev, so that iteration is fast.

### Production Deployment

63. As an operator, I want the app deployed to AKS with Postgres as a StatefulSet (not managed), so that infrastructure cost stays low.
64. As an operator, I want Azure Blob Storage used in production (Azurite emulator only locally), so that profile pictures persist across pod restarts.
65. As an operator, I want liveness and readiness probes on every deployment, so that Kubernetes can restart broken pods.

## Implementation Decisions

### Architectural Style

- **Backend** uses Clean Architecture with four projects: Domain, Application, Infrastructure, API. Domain has zero external dependencies. Application defines interfaces consumed by Infrastructure. The API project wires everything together.
- **CQRS via MediatR** — every API endpoint dispatches a command or query through MediatR; controllers are thin.
- **Frontend** uses feature-folder structure (`features/auth`, `features/profile`, `features/cv-builder`, `features/cv-preview`) with shared UI primitives and shared hooks.

### Domain Model (canonical)

Top-level aggregates: `Profile`, `Assignment`, `Skill`, `Education`, `Certification`, `Language`, `CV`. Joins: `AssignmentSkill`, `CVAssignment` (with `IsHighlighted`, `DescriptionOverride`, `DisplayOrder`), `CVCertification`, `CVEducation`, `CVLanguage`, `CVFrontPageGroup`, `CVFrontPageGroupItem` (polymorphic — `SkillId` *or* `CertificationId` nullable).

All bilingual content uses paired `*Sv` / `*En` columns (intentionally not a separate translations table — only two languages, fixed forever).

### Deep Modules (backend)

- **CV Composition Service** — pure: `(CV + joins + Profile + targetLang) → ResolvedCvViewModel`. Resolves overrides (override wins over profile master) and bilingual fallback (target lang wins; other lang as fallback flagged). This is the testable core; all CV rendering reads from its output.
- **Bilingual Text Resolver** — pure: `(textSv: string?, textEn: string?, target: 'SV'|'EN') → { text: string, fallbackUsed: boolean }`. Used by Composition Service and (indirectly) the frontend preview.
- **CV Name Generator** — pure: `({firstName, lastName, company, language}) → string`. Format: `"{First} {Last}, {Company}, {SV|EN}"`.
- **Highlight Constraint** — domain invariant enforced in `CV` aggregate: setting `IsHighlighted = true` on a 3rd `CVAssignment` throws a domain exception. Validated in the command handler so the API returns 400 not 500.
- **PDF Generator** — `IPdfGenerator.GenerateAsync(cvId, token) → byte[]`. Implementation uses PuppeteerSharp, navigates to the frontend `/cv/preview/{id}?token=`, waits for `Networkidle0`, calls `PdfAsync` with A4 + `PrintBackground = true`.
- **AI Text Service** — `IAiTextService.StreamImprove(text, lang) → IAsyncEnumerable<string>` and `.StreamTranslate(text, fromLang) → IAsyncEnumerable<string>`. Wraps the OpenAI SDK with `gpt-5-nano`.
- **File Storage** — `IFileStorage.UploadAsync(stream, contentType, key) → Uri`. Implementation uses `Azure.Storage.Blobs`; connection string swap drives Azurite vs. production.
- **Preview Token Service** — issue + validate JWTs scoped `{ cvId, exp: now+60s }`. Distinct signing key from the user JWT.

### Deep Modules (frontend)

- **CVPreview component** — pure render of `ResolvedCv` view model. Used by builder right-panel (CSS `transform: scale(~0.6)`) and the Puppeteer print route at full A4 size. **Single source of truth for CV visual.** Pixel parity is by construction, not by separate templates.
- **useCVBuilder hook** — owns selection + override state for one CV. Mutations are debounced ~500ms and applied optimistically via TanStack Query.
- **useAIStream hook** — reads an SSE response, exposes `{ streamedText, isStreaming, accept, cancel }`. Used by both Improve and Translate modals.
- **A4 Overflow Detector** — `ResizeObserver`-based hook returning `{ isOverflowing, overflowPx }`. Drives the yellow highlight on overflowing content and the top banner warning.
- **Bilingual Field Pair** — paired `<textarea>` (one visible per `SV|EN` toggle state) with an inline Translate button enabled only when the other-language field is empty.

### API Surface

- **Auth:** `POST /api/auth/register`, `POST /api/auth/login → JWT`.
- **Profile:** `GET/PUT /api/profile` + CRUD under `/api/profile/{assignments|skills|education|certifications|languages}`.
- **Profile Picture:** `POST /api/profile/picture` (multipart) → returns blob URL.
- **CVs:** `GET /api/cvs`, `POST /api/cvs`, `GET/PUT/DELETE /api/cvs/{id}`.
- **CV Preview & PDF:** `POST /api/cvs/{id}/preview-token` (issues 60s JWT), `GET /cv/preview/{id}?token=` (public React route used by Puppeteer), `POST /api/cvs/{id}/pdf` (returns binary PDF).
- **AI:** `POST /api/ai/improve` and `POST /api/ai/translate` — both return Server-Sent Events streams. Controllers use `IAsyncEnumerable<string>` over SSE; frontend consumes via `useAIStream`.

### Persistence

- PostgreSQL via Npgsql + EF Core 10. Single migration sets up Identity tables + domain schema.
- All FKs cascade-delete from Profile/CV root to keep cleanup atomic.
- `CVAssignment.DisplayOrder`, `CVFrontPageGroup.DisplayOrder`, `CVFrontPageGroupItem.DisplayOrder` are integers maintained client-side; backend trusts the client's ordering.

### Authentication

- ASP.NET Core Identity for user store. JWT issued on `/login`. Frontend stores JWT in `localStorage`; an Axios (or fetch wrapper) interceptor adds `Authorization: Bearer …` to every request.
- Protected route wrapper in React redirects to `/login` on 401.
- Preview tokens are a *separate* short-lived JWT class (different audience/signing key) scoped to one `cvId`, valid 60 seconds. Cannot be exchanged for a user session.

### PDF Pipeline

- Puppeteer runs inside the .NET container; Chromium is fetched at container build via `PuppeteerSharp.BrowserFetcher`.
- The .NET service requests a preview token, builds the URL `{frontendBaseUrl}/cv/preview/{cvId}?token={token}`, navigates with `WaitUntilNavigation.Networkidle0`, then prints with `PaperFormat.A4` and `PrintBackground = true`.
- Response is streamed as `application/pdf` with `Content-Disposition: attachment; filename="{FirstName} {LastName}, {Company}, {SV|EN}.pdf"`.

### Bilingual Fallback Semantics

- A field is "missing" in language X when its `*X` column is null or whitespace-only.
- Render order: target-language value if non-empty → other-language value wrapped in `translation-missing` CSS class (yellow highlight) → empty string (only reached when both languages are blank).
- Missing-translation counter at the top of the builder is computed from the `ResolvedCvViewModel`'s `fallbackUsed` flags so the count is always consistent with what's on screen.

### A4 Boundary

- Page 1 container: `width: 794px; min-height: 1123px` (A4 at 96dpi).
- Dashed red line at `y = 1123px` via absolutely-positioned `::after` pseudo-element.
- Overflow detection via `ResizeObserver` on the container, comparing `scrollHeight` to `1123`.
- The boundary line and overflow highlight are visible *only* in the builder preview, hidden in the Puppeteer-driven print route (CSS `@media print` or query-param gate).

### AI Streaming

- Backend controller returns SSE; `IAsyncEnumerable<string>` yielded by the OpenAI SDK is forwarded chunk-by-chunk:

```csharp
[HttpPost("improve")]
public async IAsyncEnumerable<string> ImproveText([FromBody] ImproveTextRequest req)
{
    await foreach (var chunk in _ai.StreamImprove(req.Text, req.Language))
        yield return chunk;
}
```

- Frontend `useAIStream` reads the response body as a `ReadableStream`, splits on SSE delimiters, appends to local state, and exposes `accept` (writes to the field) / `cancel` (aborts the fetch).

### CV Builder State Sync

- All toggle/override mutations dispatched through TanStack Query with a 500ms debounce.
- Optimistic updates: the local query cache is mutated immediately; the server response confirms or rolls back.
- On error, the cache rolls back and a toast surfaces the failure.

### File Storage

- One container in Azure Blob Storage for profile pictures. Object key format: `profile-pictures/{userId}/{uuid}.{ext}`.
- Local development uses Azurite via Docker Compose; the only difference between local and prod is the connection string (Azurite vs. real storage account).

### Deployment

- Multi-stage Dockerfiles: API uses `dotnet publish`; Frontend uses `bun build` + serves built assets via Nginx.
- Kubernetes manifests under `k8s/`: Deployments for API & frontend, Postgres as a StatefulSet with a PVC, Ingress fronting both.
- Secrets (DB password, OpenAI key, Azure Blob connection string, JWT signing keys) injected via K8s `Secret` mounts.
- `/health` endpoints for both API liveness and readiness; readiness checks DB connectivity.

## Testing Decisions

### What makes a good test in this project

- Tests assert **external behaviour**, not internal structure. A "good" CV Composition test feeds raw data in and asserts on the resolved view-model shape — it does not mock or peek into private helpers.
- Domain logic tests are pure: no DB, no HTTP, no DI container — instantiate the class and call its methods.
- Integration tests exercise HTTP → MediatR → EF → real Postgres (via TestContainers). They do not mock the database; mocking ORMs is forbidden because the historical risk is migrations / SQL drift, which mocks cannot catch.
- Frontend hook tests use real React Testing Library renders with MSW intercepting HTTP/SSE. They assert on observable outputs (returned values, calls into props), not on internal state.
- E2E tests cover only what unit + integration tests cannot — full-stack flows where the value is the integration itself (e.g., PDF pixel parity, AI modal end-to-end, A4 overflow warning).

### Modules to test

- **Core domain logic (xUnit + FluentAssertions, pure unit tests):**
  - CV Composition Service — many table-driven cases covering override resolution and bilingual fallback combinations.
  - Bilingual Text Resolver — cover all 9 combinations of (SV null/empty/value × EN null/empty/value) × 2 target languages.
  - CV Name Generator — covers SV/EN suffix, exact format.
  - Highlight Constraint — adding a 3rd highlighted assignment throws; un-highlighting then re-highlighting works.

- **MediatR handlers (xUnit + NSubstitute):** every command/query handler unit-tested with mocked repository interfaces. Assert that the handler calls the correct repository methods and returns the right shape on success/failure.

- **CRUD integration tests (xUnit + TestContainers + real Postgres):** Auth (register, login, JWT verification), Profile CRUD across every sub-resource, CV CRUD including selection joins. Run against a fresh Postgres container per fixture.

- **Frontend hooks (Vitest + React Testing Library + MSW):**
  - `useCVBuilder` — toggling a selection updates local state immediately, debounced mutation fires after 500ms, optimistic update rolls back on server error.
  - `useAIStream` — streamed chunks accumulate, `cancel` aborts the underlying fetch, `accept` writes the final text to the supplied setter.

- **Playwright E2E tests** — only flows whose value is full-stack integration:
  - Login → create profile data → create CV → toggle selections → live preview updates → A4 overflow warning surfaces when content is excessive.
  - PDF download — click Download, assert the response is a valid PDF with the correct `Content-Disposition` filename.
  - AI Improve modal end-to-end — click Improve, modal opens, streamed text accumulates, Accept replaces the field.
  - Bilingual fallback — create EN CV with one assignment missing `DescriptionEn`, assert the preview shows the SV text with the yellow `translation-missing` highlight.

### Prior art

This is a greenfield project — there is no prior art in the repo yet. Test conventions established by the first batch of tests (folder layout, fixture style, naming) are themselves a decision and should be conservative: one assertion focus per test, AAA layout, no hidden setup in base classes.

## Out of Scope

- **Multi-tenant / team features.** This is a single-user-per-account tool; no sharing, no collaboration, no role-based access.
- **CVs with more than two languages.** The dual-column model is deliberate; adding a third language would require a schema change and is explicitly excluded.
- **CV templates / theming.** One visual style only. No font picker, no colour picker, no layout variants.
- **CV versioning / history.** Edits overwrite. No undo beyond the browser's textarea undo. No "previous version" recovery.
- **PDF page 2+ design optimisation.** Only page 1 is constrained to A4. Pages 2+ are allowed to flow naturally.
- **Email delivery / sharing links.** Users download PDFs and send them via their own channels.
- **Analytics / tracking of which CVs were sent where.** No application tracking is built in.
- **OAuth / social login.** Email + password only at launch.
- **Password reset / email verification.** Excluded for the first cut; manual re-registration is acceptable.
- **Rate limiting on AI endpoints.** Trust the single-user assumption for now; add when usage justifies it.
- **Mobile-responsive builder.** The builder is a desktop-only experience; mobile users get a read-only CV list.
- **Importing data from LinkedIn / résumé parsers.** All data entered by hand initially.

## Further Notes

- **Why one shared CVPreview component:** the entire pixel-parity guarantee rests on the fact that the browser preview and the PDF are produced by the *same* React component running in *the same* environment (a real browser). Any deviation — a separate print template, a `@page` CSS rule that diverges between contexts, a font that loads only in one — defeats the design. Treat the rule "preview and PDF must render the same component" as load-bearing.

- **Why Puppeteer over wkhtmltopdf or similar:** wkhtmltopdf is unmaintained; native PDF libraries demand a separate template; only headless Chromium gives us "render the React app and print it" with full CSS support.

- **Why no auto-calculated years of experience:** consultants phrase this nuancedly (e.g., "10+ years in backend, 4 years in cloud"). Auto-calculating from assignment date ranges loses the phrasing and gains very little. Freetext is correct.

- **Why highlighted assignments are capped at 2:** layout. The condensed-highlight style consumes ~1/3 of the front page; three of them push everything else off page 1.

- **Why front-page groups can mix skills and certifications but nothing else:** these are the items short enough to live in a small box. Assignments, education, and languages have their own sections.

- **Why bilingual fallback never blocks:** the user wants to send the CV. A missing translation should be highly visible (yellow highlight, counter) but never prevent export. Trust the user to decide whether half-translated is acceptable.

- **Why the preview route requires a token rather than the user's JWT:** Puppeteer runs server-side and would need to forward the user's JWT through to the frontend route — possible but coupling. A scoped 60-second token issued by the API, validated by the same API on the preview route's data-fetching call, is a tighter trust boundary.

- **Why .NET 10 + Postgres + AKS rather than a serverless stack:** chosen for personal familiarity and longevity (.NET 10 LTS to Nov 2028). Cost is not optimised for; control and learning value are.

- **Why `gpt-5-nano`:** cheap, fast, sufficient for proofreading-style improvements and SV↔EN translation. Will revisit if quality is insufficient on translation specifically.

- **Build phase ordering:** the plan's eight phases (Scaffolding → Auth → Profile → CV Builder → PDF → AI → Tests → Docker/AKS) are the intended implementation sequence. Tests are listed as a discrete phase but the agent should write tests alongside each feature where the domain logic is pure (Composition, Bilingual Resolver, Name Gen, Highlight Constraint) — there is no reason to defer those.
