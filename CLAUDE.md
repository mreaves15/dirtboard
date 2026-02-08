# CLAUDE.md - DirtBoard AI Assistant Rules

## 🎯 Project Context
DirtBoard is a land deal pipeline tracker for Putnam County, FL land flipping.
**Stack**: Next.js 16 + Supabase + Tailwind + shadcn/ui

## ⚠️ CRITICAL RULE: TDD IS MANDATORY (HUMAN-RUNNER MODE)

### TDD Enforcement Workflow (Strict Token Efficiency)
**The AI writes the code. The Human runs the tests.**

```
┌─────────────────────────────────────────────────────────────────┐
│  🛑 HARD STOP: YOU MUST END YOUR RESPONSE AFTER WRITING TESTS  │
│     DO NOT write implementation code in the same response!      │
└─────────────────────────────────────────────────────────────────┘
```

1. **WRITE TEST FIRST** - Create/update test file with assertions that WILL FAIL.
2. **END RESPONSE** - Stop typing. Do NOT continue to implementation.
3. **ASK FOR RED** - Your response MUST end with: "Please run the test to confirm RED: `npm run test:run`"
4. **WAIT** - Do nothing until user replies with failure output or "RED confirmed".
5. **THEN IMPLEMENT** - Only after RED confirmed, write minimal code to pass (GREEN).
6. **REFACTOR** - Improve code while keeping tests green.

### ❌ FORBIDDEN (Common Mistakes)
- Writing test file AND implementation file in same response
- Assuming tests will fail without user confirmation
- Saying "this should fail" then immediately fixing it
- Batching test updates with implementation updates
- **Running tests yourself** - ALWAYS ask user to run them

### ✅ CORRECT Response Pattern
```
[Write test file changes only]

---
Please run the test to confirm RED:
npm run test:run
```
Then STOP. Wait for user.

**BLOCKING RULE**: If a test file doesn't exist for new code, create it FIRST.

## 💰 Token Efficiency Rules

### Terminal & Testing
* **NO AUTOMATED TESTING**: Do NOT run `npm test`, `npm run test:run`, etc.
* **Reason**: Prevents context bloat from massive terminal logs.
* **Action**: Ask the user to run the command.

### Git & Large Files
* **NO LOCKFILES**: Do not read `package-lock.json`.
* **LARGE DIFFS**: If diff > 50 lines, ask for summary.

## 📐 Code Patterns

### Test File Structure
```
src/
  app/
    properties/
      page.tsx
      [id]/
        page.tsx
  hooks/
    useProperties.ts
  lib/
    api.ts

__tests__/ (or co-located .test.tsx files)
  Same structure as src/
```

### Supabase Client Pattern
```typescript
import { supabase } from '@/lib/supabase'

const { data, error } = await supabase
  .from('properties')
  .select('*')
  .eq('id', id)
  .single()

if (error) throw error
return data
```

### React Hook Pattern
```typescript
export function useProperties() {
  const [data, setData] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // fetch, mutate, return
}
```

## 🔑 Development Philosophy

### Red-Green-Refactor
1. Write failing test (RED)
2. Implement minimal code (GREEN)
3. Refactor while keeping tests green

### Test Coverage
- Test happy path
- Test error cases
- Test edge cases

### Data Model (from PRD)
See `/home/mattreaves/clawd/lead-tracker-prd.md` for full schema.

Key tables:
- `properties` - Main pipeline tracker
- `contacts` - Phone/email/address per property
- `comps` - Comparable sales
- `activity_log` - All changes
- `saved_views` - Custom filters

## 🚀 Quick Commands

```bash
# Development
npm run dev

# Type check
npx tsc --noEmit

# Tests (USER runs these, not AI)
npm run test:run

# Lint
npm run lint
```
