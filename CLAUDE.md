# CVCreator

Multi-user CV Creator web app. One Profile per user, many CVs per user. Each CV is a named selection of profile data targeted at a specific company, exportable as a pixel-perfect A4 PDF in Swedish or English.

**Brand split**: the user-facing app is branded **Pitchpaper** (marketing landing, sidebar wordmark, browser title, copy in auth pages). The codebase, .NET namespaces (`CVCreator.Domain`, `CVCreator.API`, …), folder names, and k8s manifests all remain `CVCreator`. Don't propose a code-side rename unless asked — the namespaces, CI, and infra would all churn.

## Architecture

Clean Architecture with CQRS:

```
CVCreator.Domain        — entities, domain services, view models; zero external dependencies
CVCreator.Application   — commands/queries via MediatR, interfaces
CVCreator.Infrastructure — EF Core, Identity, Azure Blob, PuppeteerSharp, OpenAI
CVCreator.API           — thin controllers, DI wiring
frontend/               — React 19 + Vite + TypeScript + Tailwind CSS v4
```

## Running Locally

```bash
# Start Postgres + Azurite
docker compose up -d postgres azurite

# Backend (port 5000)
dotnet run --project src/CVCreator.API

# Frontend (port 5173)
cd frontend && bun dev
```

Full stack via Docker Compose:
```bash
docker compose up
```

## Tests

```bash
# Domain unit tests
dotnet test tests/CVCreator.Domain.Tests

# Integration tests (TestContainers — needs Docker)
dotnet test tests/CVCreator.Integration.Tests

# Frontend tests
cd frontend && bun run test

# All .NET tests
dotnet test
```

## Key Gotchas

**Auth scheme**: Use `AddIdentityCore` (NOT `AddIdentity`) in `Program.cs`. `AddIdentity` internally sets cookies as the default auth scheme, which silently breaks JWT Bearer — every protected endpoint returns 401.

**Integration test fixture**: `IntegrationTestFixture.cs` uses `WebApplicationFactory<Program>` with TestContainers Postgres. It overrides JWT config via `AddInMemoryCollection` and swaps `IFileStorage` for `FakeFileStorage`. The using `Microsoft.Extensions.Configuration` must be present.

**Bilingual fields**: All user-facing text fields come in `Sv`/`En` pairs. `BilingualTextResolver.Resolve(textSv, textEn, target)` returns `{ Text, FallbackUsed }`. Never block on missing translation — always fall back silently, surface the fallback count as a warning in the builder.

**CV composition**: `CVCompositionService.Compose(...)` is pure — no DB access, no side effects. It produces a `ResolvedCv` view model from raw entities. The PDF route and the builder right-panel both render the same `CVPreview.tsx` component.

**PDF generation**: PuppeteerSharp navigates to `/cv/preview/{id}?token=<preview-token>` (60s JWT, audience `CVCreator.Preview`). The preview token is issued by `IPreviewTokenService` and validated by a separate policy on that route.

**Highlighted assignments**: Maximum 2 per CV. Enforced in `UpdateCvSelectionsCommand`. Front page shows them condensed (no skill tags).

**A4 boundary**: `useA4Overflow` uses `ResizeObserver`. In jsdom tests, mock it: `global.ResizeObserver = class { observe(){} unobserve(){} disconnect(){} }`.

**AI streaming**: `IAiTextService` returns `IAsyncEnumerable<string>`. The API controller yields chunks directly. The frontend `useAIStream` hook reads the response body stream via `ReadableStream`.

**CV naming**: Auto-generated as `{FirstName} {LastName}, {Company}, {SV/EN}` — do not add logic to this.

**Frontend routes**: `/` is the **public landing** (`features/landing/LandingPage.tsx`), no auth required. The CV list lives at `/cvs` (was at `/`). Login navigates to `/cvs` on success; the sidebar's "My CVs" link and the builder's back arrow both target `/cvs`. The fallback `*` route redirects to `/`. Public routes (`/`, `/login`, `/register`, `/cv/preview/:id`) render outside `AppLayout`; protected routes go through `<ProtectedRoute><AppLayout/>`. The full-screen builder (`/cv/:id`) is protected but skips the sidebar shell.

**CV themes**: `CvTheme` (in `cv-preview/cvThemes.ts`) has an optional `monoFont` field. When set, skill chips in `CVPreview.tsx` render in that font (with +2% letter-spacing) and fall back to `bodyFont` otherwise. Burgundy uses IBM Plex Mono; Charcoal uses JetBrains Mono; Nordic leaves it unset. Each theme also pairs its own display/body fonts — don't add fonts to `index.html` unless a theme actually uses them.

**Auth pages**: `LoginPage.tsx` and `RegisterPage.tsx` share `AuthShell.tsx` (split editorial layout — dark editorial side + cream form side) and the `TextField` / `SubmitButton` primitives exported from it. Keep visual changes in `AuthShell`, not the individual pages.

**Profile/builder shared primitives**: `AssignmentsSection.tsx` exports `SectionCard`, `EmptyState`, `IconButton`, and `FieldLabel` which the other profile sections (Skills/Education/Certifications/Languages) import. `CvBuilderPage.tsx` has its own per-section accent palette (`ACCENT` map) — these are visually aligned with the profile palette but defined locally so the builder stays a single-file page.

## Stack Versions

| | Version |
|---|---|
| .NET | 10 LTS |
| EF Core / Npgsql | 10.x |
| React | 19 |
| TypeScript | ~6.0 |
| Tailwind CSS | v4 |
| Vitest | v4 |
| OpenAI model | gpt-5-nano |

## Project Structure

```
src/
  CVCreator.Domain/
    Entities/          — Profile, CV, Assignment, Skill, Education, etc.
    Services/          — BilingualTextResolver, CVCompositionService, CVNameGenerator
    ViewModels/        — ResolvedCv and nested record types
  CVCreator.Application/
    Auth/              — Register, Login commands
    Profiles/          — GetProfile, UpdateProfile, UploadPicture commands
    CVs/               — CreateCv, ListCvs, UpdateCvSelections, GetResolvedCv, etc.
    Common/Interfaces/ — IApplicationDbContext, ICurrentUserService, IFileStorage, etc.
  CVCreator.Infrastructure/
    Persistence/       — AppDbContext (EF Core + Npgsql)
    Identity/          — IdentityService, JwtService, PreviewTokenService
    Storage/           — AzureBlobStorage, FakeFileStorage (test double)
    AI/                — OpenAiTextService
    Pdf/               — PuppeteerPdfGenerator
  CVCreator.API/
    Controllers/       — AuthController, ProfileController, CvsController, AiController
    Services/          — CurrentUserService
tests/
  CVCreator.Domain.Tests/       — pure unit tests, no DB
  CVCreator.Integration.Tests/  — TestContainers Postgres, WebApplicationFactory
frontend/
  src/
    features/
      landing/         — LandingPage (public marketing, "Pitchpaper" brand)
      auth/            — LoginPage, RegisterPage, shared AuthShell
      profile/         — BilingualFieldPair, picture upload, all profile sections
      cvs/             — CvListPage (CV gallery at /cvs) + cvsApi
      cv-builder/      — split panel, useAIStream, useMissingTranslations
      cv-preview/      — CVPreview.tsx (shared), cvThemes.ts, useA4Overflow
    components/
      layout/          — AppLayout (sidebar shell), Sidebar (Pitchpaper wordmark, /cvs nav)
      ui/              — shadcn-style primitives (button, sheet, switch, tooltip)
k8s/                   — Kubernetes manifests (AKS production)
```

## K8s Manifests (Production — AKS)

Apply in order:
```bash
kubectl apply -f k8s/namespace.yaml
kubectl create secret generic cvcreator-secrets --namespace=cvcreator \
  --from-literal=postgres-password=<...> \
  --from-literal=jwt-secret=<...> \
  --from-literal=openai-api-key=<...> \
  --from-literal=azure-storage-connection-string=<...>
kubectl apply -f k8s/postgres-statefulset.yaml
kubectl apply -f k8s/api-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/ingress.yaml
```

Postgres runs as a StatefulSet (not AKS managed DB) to avoid managed DB costs.
