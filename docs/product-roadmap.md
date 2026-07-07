# Triggr.pro — Product Roadmap

> **App Vision:** The definitive training companion for ISSF and NRAI competitive shooters — from a shot log on Day 1 to an AI coach in Phase 4.

---

## Overview

| Phase | Name | Core Value | Target User State |
|---|---|---|---|
| **V1** | Shot Log + Analytics | Log sessions, track trends | Beginner → Club-level shooter |
| **V2** | Match Intelligence | Competition prep, peaking, MQS tracking | Club → State-level shooter |
| **V3** | Social + Team Layer | Training communities, coach-athlete workflows | State → National-level |
| **V4** | AI Coach + Target Scan | Autonomous coaching, vision-based scoring | Serious competitor + Coach |

---

## Phase 1 — Shot Log & Training Analytics

**Theme: Replace the notebook.**

Every competitive shooter keeps a manual training diary — a notebook, a spreadsheet, or a voice note. It's fragmented, non-searchable, and produces no useful insights. V1 kills the notebook.

### Pain Points Solved

- **No structured session log** — shooters lose historical data when notebooks fill up or are lost
- **No trend visibility** — can't spot if performance degraded over 3 weeks or correlate bad days with sleep/heat
- **Manual score calculation** — prone to errors, especially in rapid-fire formats
- **No ISSF/NRAI format awareness** — generic apps don't know that 10m Air Pistol has 60 shots in qualification

### Core Features

| Feature | What It Does |
|---|---|
| **Event Selector** | Choose event from ISSF/NRAI catalog (Air Pistol, Air Rifle, 25m RFP, 50m 3P, etc.) — pre-fills shot count, series structure, time limits |
| **Shot Logger** | Input scores per series; decimal scoring (0.0–10.9) for air events, integer for 50m/25m |
| **Session Summary** | Auto-calculates total, group average, best/worst series, X-count |
| **Session Notes** | Free-text log: conditions, equipment, mental state, ammo batch |
| **Progress Charts** | Weekly/monthly average trend lines per event — visual slope shows trajectory |
| **Personal Bests** | Auto-tracks PB per event, auto-highlights when broken |
| **Streak Tracker** | Consecutive training days, sessions this week vs. target |
| **Offline First** | All data local by default; no login required for V1 |

### V1 Tech Stack (Lean)

- React Native (Expo) for iOS + Android
- SQLite (local) via Expo SQLite
- Recharts / Victory Native for chart rendering
- Events catalog seeded from `docs/events.md`

### V1 Monetisation Model

Free, zero friction. Build the habit. Data is the moat.

---

## Phase 2 — Match Intelligence

**Theme: Train with a purpose.**

Once a shooter has 4–8 weeks of V1 data, V2 unlocks the _why_ — connecting training patterns to competition outcomes and helping plan peak performance windows.

### Pain Points Solved

- **No MQS tracking** — shooters have to manually check NRAI match book rules to know if they qualify for Nationals, Khelo India, or State selection trials
- **No competition calendar integration** — preparation is reactive, not periodised
- **No qualifier simulation** — training scores don't map to competition pressure contexts
- **Equipment tracking is nonexistent** — no link between rifle/pistol lot, pellet batch, and score variance

### Core Features

| Feature | What It Does |
|---|---|
| **MQS Dashboard** | Per event, shows current MQS threshold, shooter's best qualifying score, gap, and validity window (NRAI MQS valid for 2 years) |
| **Competition Log** | Add competition results separately from training; compare to training averages on same period |
| **Peak Planning** | Mark competition date; app backtracks to suggest taper/load weeks |
| **Equipment Log** | Tag sessions with pistol/rifle serial, pellet lot, sight settings; run correlation on scores |
| **Series Heatmap** | Calendar heatmap of session scores — visualise hot/cold training blocks |
| **Target Event Analytics** | Per-event deep-dive: best/worst day of week, time of day, indoor vs. outdoor |
| **Export** | PDF session reports for coach review; CSV for manual analysis |

### V2 Monetisation

Freemium — V1 features free, V2 features behind ₹199/month or ₹1499/year subscription.

---

## Phase 3 — Social + Team Layer

**Theme: Shooting is coached, not solo.**

National-level shooters work in academies and state units. Coaches need to review multiple athletes simultaneously. This phase creates the coach–athlete relationship layer that transforms Triggr from a personal tool into a team platform.

### Pain Points Solved

- **Coaches have no visibility** into athlete training between camps — they only see camp data
- **No structured feedback loop** — coaching notes are verbal or WhatsApp messages, lost in 3 days
- **Inter-shooter comparison is manual** — selection trials shortlisting is done on paper
- **No team-level analytics** — SAI, state associations, and academies have zero data infrastructure

### Core Features

| Feature | What It Does |
|---|---|
| **Team Profiles** | Coach creates a team; sends invite code to athletes |
| **Coach Dashboard** | View all athletes' weekly summaries, trend charts, session notes in one screen |
| **Feedback Threads** | Coach posts typed feedback on a session; athlete sees it inline next to that session's data |
| **Comparison View** | Overlay two athletes' event averages over a time range — selection shortlisting tool |
| **Training Plan Assignments** | Coach assigns a weekly session target (e.g., "3× 60-shot AP qualification this week") |
| **Milestone Alerts** | Coach gets push notification when athlete breaks PB or hits MQS |
| **Academy / Club Accounts** | Institution-level admin account; roster management; bulk data export |

### V3 Monetisation

- Athlete: ₹199/month (same as V2)
- Coach account: ₹499/month (up to 15 athletes)
- Academy/Club: ₹2999/month (unlimited athletes + admin portal)

---

## Phase 4 — AI Coach + Target Scan

**Theme: The range in your pocket.**

This is the product's defining feature and main long-term competitive moat. No general-purpose sports app can replicate domain-specific AI that understands ISSF target geometry, calling patterns, and hold analysis. This phase ships two interlinked capabilities: **vision-based automatic scoring** and **AI-generated coaching feedback**.

### Pain Points Solved

- **Manual score input is slow and error-prone** — especially in rapid-fire where there's no time between series
- **Shooters can't diagnose their own shot patterns** — without a coach, they don't know if a 7.8 left came from trigger pull, grip pressure, or follow-through
- **Post-session analysis is subjective and generic** — "shoot more 10s" is not coaching
- **Access to quality coaching is geographically unequal** — most serious shooters in Tier 2/3 cities have no access to certified coaches

### Core Features

#### Target Scan (Computer Vision)

| Feature | What It Does |
|---|---|
| **Camera Scan** | Point phone at physical target after a series; app detects target type (ISSF AP 10m, AR 10m, 50m Prone, etc.) |
| **Ring Detection** | CV model identifies each hole's position on the target face; maps to decimal score |
| **Auto-Import** | Detected scores flow directly into the active session log — zero manual input |
| **Group Analysis** | Measures group size (mm), group centre offset from 10-ring, radial distribution |
| **Shot Pattern Map** | Visual overlay showing all shots on a rendered target — position, spread, outliers |
| **Sighter Analysis** | Separate sighter tracking; flags if sighters differ significantly from scoring shots (sight setting issue vs. execution issue) |

#### AI Coaching Engine

| Feature | What It Does |
|---|---|
| **Series Review** | After each scanned series, AI generates a 2–4 line analysis: pattern type (e.g., "consistent left group"), likely cause (e.g., "dominant eye trigger tension"), corrective cue |
| **Session Debrief** | End-of-session summary: what improved, what regressed, priority for next session |
| **Pattern Memory** | AI tracks recurring patterns across sessions — "you drift left in series 4–6 consistently across 3 weeks" |
| **Condition Correlation** | Cross-references notes (wind, heat, fatigue) with score drops — surfaces non-obvious causes |
| **Drill Recommendations** | Suggests specific dry-fire or live-fire drills mapped to detected weaknesses |
| **Pre-Competition Briefing** | Night before a match, AI generates a personalised focus list based on recent training data |

### V4 Technical Architecture

| Component | Technology |
|---|---|
| Target Detection | Fine-tuned YOLOv8 / Roboflow model trained on ISSF target images |
| Score Extraction | Custom CV pipeline: perspective correction → ring detection → decimal mapping |
| AI Coach LLM | GPT-4o or Gemini 1.5 Pro with shooting-domain system prompt + session history context |
| Embedding Store | pgvector (Supabase) for long-term session pattern retrieval |
| Edge Inference | On-device ONNX model for scan (privacy + offline); cloud LLM for coaching text |

### V4 Monetisation

- **AI Coach add-on**: ₹499/month (on top of base subscription)
- **B2B: SAI / NIS Licensing**: White-label platform sold to national/state academies — annual license ₹5L–₹20L depending on roster size
- **International**: Expand to ISSF member nations (similar pain point globally) — USD pricing

---

## Build Order Summary

```
V1 (0–3 months)  → Shot log, session summary, progress charts, events catalog
V2 (3–7 months)  → MQS tracker, competition log, equipment log, peak planning, export
V3 (7–12 months) → Coach-athlete layer, team dashboards, feedback threads, academy accounts
V4 (12–20 months)→ Target scan CV model, AI coaching engine, pattern memory, B2B licensing
```

---

## Key Design Principles Across All Phases

1. **Offline-first** — A shooter at an indoor range often has no signal. Every core feature works without internet.
2. **Format-aware** — The app understands ISSF rules, NRAI MQS values, series structures, and scoring systems natively — it is not a generic logger adapted for shooting.
3. **Speed of input** — Logging a 60-shot session must take under 3 minutes in V1. V4 reduces this to under 30 seconds with auto-scan.
4. **Coach-athlete trust** — Feedback and data sharing are always athlete-controlled. Coaches see only what athletes choose to share.
5. **Competitive data moat** — Every session logged builds a longitudinal training dataset that becomes a shooter's most valuable performance asset over years of use.
