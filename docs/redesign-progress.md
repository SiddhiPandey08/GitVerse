# GitVerse Redesign Progress

## Locked Design Tokens
- **Neutrals**:
  - `bg`: `#0a0a0b` (canvas background)
  - `surface`: `#111113` (card/panel background)
  - `raised`: `#17171a` (hover, table stripes, input bg)
  - `border`: `#232326` (default hairline 1px border)
  - `borderStrong`: `#2e2e33` (active/focus border)
  - `ink`: `#ededef` (text-primary)
  - `muted`: `#a1a1a6` (text-secondary)
  - `faint`: `#6b6b72` (text-muted, captions)
- **Semantic Colors**:
  - `primary`: `#4C5BFF` (hover `#8C96FF`)
  - `success`: `#3DDC97`
  - `warning`: `#FFB547`
  - `danger`: `#FF5C6C`
  - `branch`: `#A78BFA`
  - `info`: `#4FD1E8`
- **Typography**:
  - UI & Body: `General Sans`, -apple-system, sans-serif
  - Monospace / Technical: `Fira Code`, monospace (`<Mono>`)
  - Display / Logo / Hero: `Sharpie`, sans-serif
- **Borders & Radii**:
  - 1px hairline border policy (`#232326`)
  - Radii: 4px (`sm`), 6px (`md`), 8px (`lg`), 9999px (`pill`)
  - Flat panels with borders, no gradients/glow/glassmorphism/colored drop shadows

## Phase Checklist
- [x] **Phase 1: Tokens and Typography** (Done)
  - [x] Update `src/theme/theme.js` with new tokens, typography scale, component overrides
  - [x] Update `src/index.css` with CSS custom properties (`--gv-*`) & reset overrides
  - [x] Create `src/components/common/Mono.jsx`
  - [x] Create `src/components/common/StatusChip.jsx`
  - [x] Create `/docs/redesign-progress.md`
- [x] **Phase 2: Shared Chrome & Feedback Components** (Done)
  - [x] `src/components/navbar/Navbar.jsx` (theme tokens, Sharpie logo, primary button, Octicon GitBranch)
  - [x] `src/components/common/LoadingState.jsx` (Skeletons for lists/cards/text)
  - [x] `src/components/common/EmptyState.jsx` (optional action CTA, text-light typography)
  - [x] `src/components/common/NotFound.jsx` (Mono 404, neutral copy, primary button)
  - [x] `src/components/common/icons.js` (verified Octicons & Phosphor icons)
- [ ] **Phase 3: Auth Pages** (Next)
  - [ ] `src/components/auth/LogIn.jsx`
  - [ ] `src/components/auth/SignUp.jsx`
  - [ ] `src/components/auth/auth.css`
- [ ] **Phase 4: App Shell & User Pages**
  - [ ] `src/components/dashboard/Dashboard.jsx` & `dashboard.css`
  - [ ] `src/components/user/Profile.jsx` & extract `ProfileTabs.jsx`
  - [ ] `src/components/repo/StarredRepos.jsx`
  - [ ] `src/components/user/EditProfile.jsx`
- [ ] **Phase 5: Repository Workspace**
  - [ ] `src/components/repo/RepositoryDetails.jsx` (Dialog confirm, dynamic visibility, metadata)
  - [ ] `src/components/repo/RepoFiles.jsx` (Skeleton loader, copy/tooltips)
  - [ ] `src/components/repo/CommitHistory.jsx` (Relative time tooltip, copy hash, StatusChip)
  - [ ] `src/components/repo/RepoReadme.jsx` (Token-based markdown styles)
  - [ ] `src/components/repo/CreateRepository.jsx` (Clean form, token borders)
- [ ] **Phase 6: Landing Page Cleanup**
  - [ ] `src/components/landing/Landing.jsx` (Copy diet, eliminate style tag collisions)
- [ ] **Phase 7: Responsive & Quality Verification**
  - [ ] Mobile navigation drawer, responsive grids, keyboard navigation, build check

## Completed Files
- `frontend/src/theme/theme.js`
- `frontend/src/index.css`
- `frontend/src/components/common/Mono.jsx`
- `frontend/src/components/common/StatusChip.jsx`
- `frontend/src/components/navbar/Navbar.jsx`
- `frontend/src/components/common/LoadingState.jsx`
- `frontend/src/components/common/EmptyState.jsx`
- `frontend/src/components/common/NotFound.jsx`
- `docs/redesign-progress.md`

## Decisions and Skipped Items
- Preserved legacy CSS variables in `index.css` under aliases so landing page continues functioning until Phase 6 refactor.
- `<Mono>` encapsulates `Fira Code` with fallbacks for all technical identifiers.
- `<StatusChip>` implements semantic color mapping (12% alpha background, 30% alpha border) without arbitrary decoration.
- Navbar uses theme-driven `background.paper` and hairline `divider` border with `GitBranch` mark and Sharpie wordmark.
- `<LoadingState>` defaults to structured skeleton rows, eliminating layout jump.
- `<EmptyState>` supports standard action buttons with router Link support.

## Exact Next Step
- Execute **Phase 3 (Auth Pages)**:
  1. `LogIn.jsx`: remove radial gradient pseudo-element, enforce clean centered card (max-width 440px) on `background.default`, apply GitVerse logo header, theme inputs.
  2. `SignUp.jsx`: remove `#233B5D` & `#F4F1BB` hardcoded cream/navy palette, match LogIn structure.
  3. `auth.css`: clean up dead rules and align with design tokens.
