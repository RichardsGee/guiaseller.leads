# GuiaSeller Leads — Sprint Planning Template

> **How to Plan and Execute a Sprint (Repeating Template)**
> Reuse for every sprint: W1, W2, W3, ... W8+

---

## Sprint Information

```yaml
Sprint:
  Number: 1                          # Sprint sequence (1, 2, 3...)
  Wave: 1                            # Which wave (1-4)
  Timeline: "Week 1-2 (26 Feb - 11 Mar)"
  Goal: "Setup foundation: DB, Auth, CI/CD"
  Team_Size: 5 FTE
```

---

## 1. Sprint Goal (Write FIRST — 2-3 sentences)

### Template

> **[Sprint Goal]**
>
> We will complete [Epic 1.1, 1.2, 1.7] to establish the foundation.
>
> Success = Database operational, Auth secure, CI/CD automated.

### Example (Sprint 1)

> **Wave 1: Foundation Setup**
>
> We will setup dual PostgreSQL databases, implement Firebase authentication, and establish automated CI/CD pipeline.
>
> Success = All infrastructure ready, auth flows tested, deployments automated.

---

## 2. Story Selection (From STORY-INDEX.md)

### Sprint 1: Foundation (W1-W2)

| Story ID | Title | Points | Assignee | Priority |
|----------|-------|--------|----------|----------|
| 1.1.1 | Dual database setup | 8 | @data-engineer | MUST |
| 1.1.2 | Prisma ORM implementation | 13 | @dev | MUST |
| 1.1.3 | Firebase configuration | 5 | @dev | MUST |
| 1.2.1 | Firebase Auth integration | 8 | @dev | MUST |
| 1.2.2 | JWT middleware | 5 | @dev | MUST |
| 1.2.3 | RBAC setup | 8 | @dev | SHOULD |
| 1.7.1 | GitHub Actions workflows | 8 | @devops | MUST |
| 1.7.2 | Railway/Vercel deployment | 5 | @devops | MUST |
| 1.7.3 | Environment secrets | 3 | @devops | MUST |
| 1.7.4 | Monitoring setup | 5 | @devops | SHOULD |

**Total Points:** ~68 (stretch goal for 2-week sprint, 5 FTE)

**MoSCoW Breakdown:**
- **MUST:** 15 stories (non-negotiable, blocking Wave 2)
- **SHOULD:** 2-3 stories (optimization, nice-to-have)
- **COULD:** (none - scope locked)

---

## 3. Acceptance Criteria & Definition of Ready (DOR)

### What Makes a Story "Ready to Start"?

Before assigning to developer:

- [ ] **Description clear** — Developer understands what to build
- [ ] **AC specified** — Acceptance criteria detailed (3-5 criteria)
- [ ] **Dependencies mapped** — What's blocking? What's it blocking?
- [ ] **Design available** — Figma/mockups (if UI story)
- [ ] **Resources identified** — Any external APIs? Database tables?
- [ ] **Estimation agreed** — Developer reviewed, agreed on points

### Example: Story 1.1.2 (Prisma ORM)

**Title:** Implement Prisma ORM with dual database routing

**Description:**
Set up Prisma as the ORM layer for both guiaseller (read-only) and leads (full CRUD) databases. Configure connection pooling, handle dual-database context in service layer.

**Acceptance Criteria:**
- [ ] Prisma initialized in project
- [ ] `prisma/schema.prisma` defines all entities (Lead, LeadHistory, AdminUser, etc.)
- [ ] Two datasources configured (guiaseller + leads)
- [ ] Connection pooling optimized (PgBouncer or Prisma default)
- [ ] Service layer abstracts dual-DB calls (no raw connections in routes)
- [ ] Migrations generated and reversible
- [ ] Tests verify reads from guiaseller, writes to leads only

**Dependencies:**
- **Blocks:** 1.2.1, 1.3.1, 1.3.2, 1.4.1 (everything after foundation)
- **Blocked by:** 1.1.1 (database setup must exist first)

**Resources:**
- guiaseller DB credentials (for read-only user)
- leads DB credentials (for full-access user)
- Prisma docs: https://www.prisma.io/

**Points:** 13 (high complexity: dual DB routing, migrations)

---

## 4. Definition of Done (DOD) — Every Story Must Satisfy

### Code Quality

- [ ] Code review approved (1+ approver)
- [ ] CodeRabbit review: PASS (zero CRITICAL issues)
- [ ] Tests pass (unit + integration, if applicable)
- [ ] No console.log() debugging left
- [ ] No hardcoded secrets or credentials

### Testing

- [ ] Unit tests: > 80% coverage (for services)
- [ ] Integration tests: API endpoints verified (if backend)
- [ ] Manual testing: Developer verified behavior
- [ ] Edge cases tested (null, empty, error states)

### Documentation

- [ ] Inline code comments (for complex logic)
- [ ] README updated (if new setup step)
- [ ] API docs updated (if new endpoint)
- [ ] Deployment notes (if infra change)

### Performance & Security

- [ ] No N+1 queries (database)
- [ ] No unencrypted sensitive data
- [ ] API rate limiting in place (if public endpoint)
- [ ] CORS configured correctly

### Deployment Readiness

- [ ] Migrations included (if database change)
- [ ] Environment variables documented
- [ ] Backwards compatible (no breaking changes)
- [ ] Works in both dev and staging

---

## 5. Sprint Execution: Daily Standup

### Daily Standup Template (15 min)

**When:** 10am Monday-Friday
**Duration:** 15 minutes max
**Format:** Async Slack OR synchronous huddle

### What Each Person Says (2 min each)

**Template:**
```
✅ Yesterday: [Completed]
🔄 Today: [Working on]
🚧 Blocker: [Any blockers?]
```

**Example (Day 3 of Sprint 1):**

```
@dev1:
✅ Yesterday: Completed database setup (1.1.1), tested connections
🔄 Today: Starting Prisma ORM implementation (1.1.2), meeting with @data-engineer
🚧 Blocker: Need guiaseller DB read-only user credentials (waiting on ops)

@dev2:
✅ Yesterday: Firebase project created, auth config started
🔄 Today: Firebase Auth endpoints (signin, signup, refresh)
🚧 Blocker: None

@devops:
✅ Yesterday: GitHub Actions templates drafted
🔄 Today: Implement lint + test workflows
🚧 Blocker: Need Railway API token
```

### Escalation Protocol

**If blocker not resolved in 24h:**
- Escalate to PM (Morgan)
- Morgan finds resolution
- Document in sprint notes

---

## 6. Sprint Review & Metrics (Friday EOD)

### Story Completion Checklist

```yaml
Sprint_1_Completion:
  Total_Points_Planned: 68
  Points_Completed: [XX]
  Completion_Rate: [XX%]

  Stories:
    - "1.1.1": ✅ DONE
    - "1.1.2": ✅ DONE
    - "1.1.3": ✅ DONE
    - "1.2.1": 🔄 IN_PROGRESS
    - "1.2.2": 🔄 IN_PROGRESS
    - "1.2.3": 📋 NOT_STARTED
```

### Burndown Chart

Plot this Friday:

```
Points Remaining vs Sprint Days

68 |●●●●●●●●●●
   | ●●●●●
   |  ●●●
   |   ●
   |    ●
 0 |____●_____ (target line)
   M  T  W  Th F
```

**Interpretation:**
- If below target line = on track ✅
- If above target line = falling behind ⚠️
- If trending up = rework / scope creep 🚨

---

## 7. Sprint Retrospective: What Went Well? What Didn't?

### Retro Template (30 min, Friday 4pm)

**Attendees:** Full team

**Format:**
1. What went well? (5 min)
2. What didn't go well? (5 min)
3. What should we change? (10 min)
4. Action items (5 min)

### Example (End of Sprint 1)

**What Went Well:**
- ✅ Database setup completed faster than expected (good teamwork)
- ✅ CI/CD pipeline automated (team loved not manual deploys)
- ✅ Daily standups kept blockers visible

**What Didn't Go Well:**
- ❌ Firebase setup took longer (API key issues)
- ❌ One PR review took 3 days (too slow feedback loop)
- ❌ Forgot to update .env template doc

**What Should We Change:**
- Code review SLA: 24-hour max (assign reviewers upfront)
- Firebase setup: pre-test API keys before sprint starts
- Documentation: require README update in PR checklist

**Action Items:**
1. @dev1: Setup code review rotation (by Monday)
2. @devops: Pre-test credentials (next sprint kickoff)
3. @pm: Add doc check to PR template (by next sprint)

---

## 8. Metrics Tracking (Weekly)

### Track These Every Friday

| Metric | W1 | W2 | W3 | Target |
|--------|----|----|----|----|
| **Sprint Velocity** (pts/week) | 68 | ? | ? | 65-70 |
| **Burndown Rate** (%) | 90% | ? | ? | 95%+ |
| **Code Coverage** (%) | 65% | ? | ? | 80%+ |
| **Bugs Found** | 3 | ? | ? | < 5/sprint |
| **PR Review Time** (hours) | 24h | ? | ? | < 24h |
| **Team Mood** (1-5) | 4.5 | ? | ? | > 4 |

### Trend Analysis

- ✅ **Velocity trending up** = Team getting faster
- ❌ **Velocity dropping** = Scope issues / blockers
- ✅ **Coverage trending up** = Quality improving
- ❌ **Bugs trending up** = Need more testing

---

## 9. Sprint Board Organization (GitHub Issues)

### GitHub Board Columns

```
[To Do] → [In Progress] → [In Review] → [Done]
```

### Automation

- **Auto-move to "In Review":** When PR created
- **Auto-move to "Done":** When PR merged
- **Auto-add labels:** bug, feature, debt, blocked

### Example (Sprint 1 Board)

```
To Do (8):                In Progress (4):        In Review (2):
- 1.1.1 [8]              - 1.1.1 ✓ [8]          - 1.2.1 [PR#3]
- 1.1.2 [13]             - 1.1.2 [13]           - 1.2.2 [PR#4]
- 1.1.3 [5]              - 1.2.1 [8]
- 1.2.1 [8]              - 1.7.1 [8]
- 1.2.2 [5]                                      Done (5):
- 1.2.3 [8]                                      ✅ 1.1.1
- 1.7.1 [8]                                      ✅ 1.7.2
- 1.7.2 [5]                                      ✅ 1.7.3
```

---

## 10. Common Pitfalls & How to Avoid Them

### Pitfall 1: Overcommitting

**Problem:** "Let's do 100 points in 2 weeks!"
**Reality:** Team burns out, quality suffers

**Solution:** Estimate conservatively (65-70 pts/2w for 5 FTE)

### Pitfall 2: Scope Creep

**Problem:** Mid-sprint: "Oh we should also add X"
**Reality:** Sprint goal not met, timeline slips

**Solution:** Lock sprint scope Monday morning. New requests → next sprint

### Pitfall 3: Skipping Tests

**Problem:** "We'll test later to save time"
**Reality:** Bugs in production, team stressed

**Solution:** Test coverage required in Definition of Done. No exceptions.

### Pitfall 4: Poor Code Review

**Problem:** "Reviewed looks good" (2-min review)
**Reality:** Bugs slip through, architecture inconsistent

**Solution:** Thorough review (30+ min), checklist, CodeRabbit automation

### Pitfall 5: Not Talking to Each Other

**Problem:** Two devs build same feature separately
**Reality:** Duplicate work, merge conflicts, frustration

**Solution:** Daily standup + GitHub labels. Check before starting.

---

## 11. Sprint Template (Copy-Paste for Next Sprint)

### How to Reuse This Template

1. Copy this file → `docs/SPRINT-PLANNING-TEMPLATE.md`
2. Update sprint number (Sprint 2, 3, 4...)
3. Fill in stories from STORY-INDEX.md
4. Hold kickoff meeting (60 min)
5. Execute for 2 weeks
6. Retro Friday EOD
7. Repeat

---

## 12. Success Criteria: Sprint Completed ✅

Your sprint is successful if:

- [ ] **Sprint goal achieved** (most stories completed)
- [ ] **Code quality maintained** (DOD met, CodeRabbit: PASS)
- [ ] **No critical bugs** found in sprint
- [ ] **Team morale positive** (> 4/5 in retro)
- [ ] **Team velocity stable or improving** (not declining)
- [ ] **Zero unplanned work** derailed sprint

---

## Quick Reference: Sprint Checklist

### Monday (Sprint Start)
- [ ] Kickoff meeting (90 min)
- [ ] Stories assigned
- [ ] GitHub board updated
- [ ] Slack channel active

### Daily (M-F)
- [ ] 10am standup (15 min)
- [ ] Update GitHub board
- [ ] Any blockers escalated

### Friday (Sprint End)
- [ ] All work merged or documented
- [ ] Sprint review (30 min)
- [ ] Retrospective (30 min)
- [ ] Metrics updated
- [ ] Next sprint planned

---

## Contact & Escalation

**Questions?** Slack #guiaseller-leads-team

**Blocker?** Ping @morgan (PM) for immediate resolution

**Not understanding a story?** Call quick sync (15 min) with assignee + author

---

**Document Status:** ✅ READY FOR USE
**Version:** 1.0 (repeating template for all sprints)
**Last Updated:** 26/02/2026

