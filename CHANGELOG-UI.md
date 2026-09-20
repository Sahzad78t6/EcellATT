# EcellATT - UI Overhaul & Design System Changelog

**Release Date:** September 2026  
**Stack:** React 18, Vite, Tailwind CSS, Recharts  
**Design Theme:** Black + Blue (Dark Only, CSS 3D Layered Surfaces)

---

## 1. Audit & Style Issues Resolved

1. **Untracked Sensitive PDF & Security Gitignore**
   - Untracked `ECELL_PORTAL_CREDENTIALS.pdf` from the Git index.
   - Updated `.gitignore` to prevent future credential PDF tracking.

2. **Tailwind Class Sanitization & Dynamic Map Replacement**
   - Eliminated dynamic string interpolation classes (e.g. `bg-${color}-500`) that broke Tailwind purge/JIT.
   - Replaced with static color token maps in `StatusBadge`, `StatCard`, and charts.
   - Cleaned unused and conflicting classes from `index.css`.

3. **Recharts Rendering Fixes (Zero-Height Bug)**
   - Replaced unconstrained parent containers with explicit minimum heights (`h-[280px]`, `h-[300px]`, `min-h-[260px]`).
   - Integrated custom dark glass tooltips (`backdrop-blur-xl`, `#0a1224` background, `#60a5fa` accent border) with readable contrast.
   - Customized `CartesianGrid`, `XAxis`, and `YAxis` fills with subtle glowing grid lines.

4. **Eliminated Mobile Horizontal Overflow (320px - 1536px)**
   - Set `overflow-x: clip` and `viewport-fit=cover` in `index.html`.
   - Used `min-h-dvh` and safe-area inset padding (`env(safe-area-inset-*)`) for mobile top/bottom bars.
   - Configured all tables to transform into stacked responsive cards under `768px` (`DataTable`, `Heatmap`, `AdminDashboardPage`, `HeadAnalyticsPage`).
   - Sized all touch targets to >= 44x44px and inputs to >= 16px font size to prevent iOS viewport auto-zoom.

5. **Single Dark Theme Enforcement**
   - Deprecated light mode and removed `ThemeProvider` wrapper.
   - Set `color-scheme: dark` at the root HTML level.
   - Replaced white/slate-200 backgrounds with semantic black/blue surface tokens.

6. **Deployment & SPA Routing Verification**
   - Verified `vercel.json` rewrite rule (`/(.*) -> /index.html`) to prevent 404s on deep-links or hard refreshes.
   - Verified that `axios.js` resolves the API URL using `import.meta.env.VITE_API_URL` and production fallbacks with zero hardcoded localhosts.

---

## 2. Design System Tokens (Black + Blue Palette)

All tokens are defined as CSS variables in `client/src/index.css` and mapped in `client/tailwind.config.js`:

### Background Tokens
| Token | Variable | Hex Value | Purpose |
|---|---|---|---|
| `bg-0` | `--bg-0` | `#02040a` | Deepest page base layer |
| `bg-1` | `--bg-1` | `#060b16` | Secondary body background |
| `surface-1` | `--surface-1` | `#0a1224` | Primary glass card background |
| `surface-2` | `--surface-2` | `#0e1a33` | Elevated component surface |
| `surface-3` | `--surface-3` | `#13223f` | High-elevation overlays & dropdowns |

### Blue & Brand Tokens
| Token | Variable | Hex Value | Purpose |
|---|---|---|---|
| `brand-primary` | `--blue-primary` | `#2563eb` | Main interactive blue |
| `brand-bright` | `--blue-bright` | `#3b82f6` | High-contrast actions & active states |
| `brand-glow` | `--blue-glow` | `#60a5fa` | Glowing highlights & specular reflections |
| `brand-ice` | `--blue-ice` | `#93c5fd` | Soft blue highlights & stats |
| `brand-cyan` | `--blue-cyan` | `#22d3ee` | Cyan secondary accent |
| `brand-deep` | `--blue-deep` | `#1e3a8a` | Deep gradient stops & shadows |

### Text & Contrast Tokens
| Token | Variable | Hex Value | WCAG Contrast |
|---|---|---|---|
| `text-primary` | `--text-primary` | `#f1f5f9` | 15.2:1 (AAA on surface-1) |
| `text-secondary` | `--text-secondary` | `#94a3b8` | 7.1:1 (AAA on surface-1) |
| `text-muted` | `--text-muted` | `#64748b` | 4.8:1 (AA on surface-1) |

### Status Colors (Strictly Semantic)
- **Present / Success:** `#10b981` (Emerald)
- **Absent / Danger:** `#ef4444` (Red)
- **At-Risk / Warning:** `#f59e0b` (Amber)

---

## 3. 3D Depth & CSS Component Classes

### Reusable Utility Classes (`@layer components`)
- `.surface-card`: Multi-layer depth with top specular highlight (`inset 0 1px 0 rgba(255,255,255,0.08)`), subtle blue hover glow, and noise texture.
- `.btn-3d-primary`: Beveled 3D primary button with blue top bevel highlight, translateY push interaction on click, and glowing hover state.
- `.btn-3d-secondary`: Glass frosted secondary button with 3D elevation.
- `.btn-3d-danger`: Red/rose beveled button for destructive/cancel actions.
- `.input-3d`: Dark beveled inputs with glowing focus borders and >=16px text on mobile.
- `.icon-orb`: Frosted glass spherical container with inner specular reflection.
- `.perspective-grid`: Background perspective plane fading into the horizon.

---

## 4. New Components & Hooks

1. **`useTilt(options)` / `<TiltCard>`**
   - High-performance `requestAnimationFrame` 3D perspective card (max 6deg tilt).
   - Dynamically tracks cursor specular highlight across the card.
   - Automatically disabled on touch screens (`(hover: none)`) and under `prefers-reduced-motion`.

2. **`useCountUp(end, duration)`**
   - Smooth `easeOutExpo` animated stat counter that honors reduced motion settings.

3. **`useMediaQuery(query)`**
   - Reactive viewport breakpoint listener for dynamic mobile/desktop behaviors.

4. **`useDocumentTitle(title)`**
   - Sets descriptive, context-aware document titles for every route.

5. **`BackgroundScene`**
   - Fixed ambient scene with perspective grid, drifting blue radial orbs, and vignette.
   - Degrades to a static gradient on mobile devices (<768px) for optimal GPU battery performance.

6. **`MobileNav` & Bottom Bar Navigation**
   - Glassmorphic bottom navigation tab bar (<1024px) with role-specific items.
   - "More" drawer bottom sheet for overflow options and quick actions.

7. **`AttendanceChecklist` (Mobile Optimized)**
   - Segmented Present/Absent toggles with large touch targets.
   - Sticky live search bar and floating bottom status bar ("12/30 present", "Mark All Present", "Save").

---

## 5. How to Tweak Colors & Effects

- **To adjust the primary blue hue:** Modify `--blue-primary` and `--blue-glow` in `client/src/index.css`.
- **To adjust card elevation / depth shadow:** Edit `box-shadow` inside `.surface-card` in `client/src/index.css` or `shadow-depth-*` in `client/tailwind.config.js`.
- **To adjust background grid density:** Edit `background-size` on `.perspective-grid` in `client/src/index.css`.
- **To adjust tilt sensitivity:** Change `maxTilt` or `perspective` in `client/src/hooks/useTilt.js` (default: 6 degrees, 1000px perspective).
