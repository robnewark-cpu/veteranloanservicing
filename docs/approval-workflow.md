# Content Approval Workflow

_No content publishes automatically. Every new claim or page moves through these states._

```
Draft → Internal Review → Operations Review → Compliance Review → Legal Review → Approved → Published → Archived
```

| State | Gate | Who |
|-------|------|-----|
| Draft | Content written on a feature branch, not merged | Author (agent/owner) |
| Internal Review | Reads correctly, matches design system, links resolve | Owner |
| Operations Review | Operational claims (ACH, servicing, reporting) are accurate | Operations |
| Compliance Review | No prohibited claims; disclaimers present; NACHA wording correct | Compliance |
| Legal Review | No unlicensed/regulated overreach; scope notice intact | Legal (Robert Newark, attorney) |
| Approved | All reviews cleared; claims registry updated to Verified | Owner |
| Published | Merged to `main`, deployed | Owner (protected-branch merge) |
| Archived | Superseded content retained for record | Owner |

## Rules
- A claim cannot reach **Published** while it is `Placeholder` or `Prohibited` in the claims registry.
- The agent may produce **Draft** and open a PR; the merge to `main` (Published) is the owner's action.
- ACH language changes start in `ach-capability-statement.md`, then propagate.
- Case studies, testimonials, client logos require documented authorization before Compliance Review.
