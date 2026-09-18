# Design & Build Stack

Everything wired into this project, what it does, and where it lives.

## 1. MCP servers (live tooling for Claude)

| Server | Status | Config |
|---|---|---|
| **Playwright** | ✅ connected | global `~/.claude.json` → `@playwright/mcp@latest` |
| **Figma** | ✅ connected | official Figma desktop connector (`mcp.figma.com`) |
| **21st.dev** | ⚠️ needs API key | project `.mcp.json` → `https://21st.dev/api/mcp` |

**21st.dev setup —** grab a free key at <https://21st.dev/mcp>, then:

```bash
echo 'export API_KEY_21ST="your_key_here"' >> ~/.zshrc && source ~/.zshrc
```

Restart Claude Code and the `21st` server picks it up from `.mcp.json`. The key is read from the
environment, so nothing secret is committed.

> Note: `@modelcontextprotocol/server-figma` and `@modelcontextprotocol/server-playwright` do not
> exist on npm (404). The working equivalents are Figma's own hosted MCP server and
> `@playwright/mcp` — both already connected above.

## 2. Design skills (judgment & taste engines)

Installed to `~/.claude/skills/`, so they are available in **every** project.

| Skill | Source | Invoke |
|---|---|---|
| **impeccable** | [pbakaus/impeccable](https://github.com/pbakaus/impeccable) @ `f2c7051` | `/impeccable [shape\|audit\|animate\|polish…]` |
| **emil-design-eng** | [emilkowalski/skill](https://github.com/emilkowalski/skill) @ `85e8e23` | `/emil-design-eng` |
| **taste** | written for this setup | `/taste` |

- **impeccable** — structured design audits, refuses generic AI-slop (cheap glassmorphism, stock
  gradients), enforces a craft floor before any UI edit.
- **emil-design-eng** — animation and polish judgment: spring physics, no `ease-in` on entrances,
  sub-300ms UI motion, the invisible details.
- **taste** — the house style: the specific type, color, spacing and motion *values* the other two
  can't know. **Edit `~/.claude/skills/taste/SKILL.md` and fill in every `[SET]` marker** with your
  real brand rules — until then it defaults to the Resend/Linear end of the spectrum.

To update either upstream skill later:

```bash
npx skills add https://github.com/pbakaus/impeccable --skill impeccable
```

## 3. Component & visual libraries

| Package | Purpose |
|---|---|
| `motion` ^13 | Framer Motion's successor — the animation engine everything else builds on |
| `tsparticles` + `@tsparticles/react` + `@tsparticles/slim` | Optimized interactive particle backgrounds |
| `cn` (via `@/lib/utils`) | Class composition — shadcn 4.x now ships this as a package |
| `lucide-react` | Icon set — real icons, never emoji |
| `shadcn` | Component registry CLI — also how Motion Primitives is pulled in |

Initialized with `components.json` → style `base-nova`, base color **neutral**, CSS variables on.
Neutral (not slate/stone) is deliberate — it matches the `taste` color rules.

**Motion Primitives** (<https://motion-primitives.com>) is copy-in, not a dependency. Pull a
component when you need it:

```bash
npx shadcn@latest add "https://motion-primitives.com/c/text-effect.json"
```

Verified working — `text-effect` is already pulled into `src/components/ui/` as a smoke test.
Delete it if unused. Note the CLI exits `1` after a successful add; the files still land.

## 4. Generators (browser tools, no install)

- **Haikei** — <https://haikei.app> — organic SVG blobs, waves, gradients. Export the SVG, then ask
  Claude to convert it into a React component.
- **Realtime Colors** — <https://realtimecolors.com> — harmonious palettes across light and dark.
  Copy the CSS variables straight into `src/app/globals.css`.

## 5. Aesthetic benchmarks (reference only)

Point Claude at these and say *"match this level of execution."*

- **Mobbin** — <https://mobbin.com> — how the best apps handle specific UX flows.
- **Refero** — <https://refero.design> — web inspiration by UI element (hero, pricing, nav).
- **Resend** — <https://resend.com> — the execution benchmark. Monochrome, high-contrast, hairline
  borders, perfect typography. This is what `taste` is tuned to.

## Working loop

1. `/impeccable` to set direction and audit — it loads `taste` values as constraints.
2. Build. Pull components from **21st.dev** (MCP) or **Motion Primitives** rather than hand-rolling.
3. `/emil-design-eng` to review motion before shipping.
4. **Playwright MCP** to actually drive the UI and confirm it works.
