# CLAUDE.md - DirtBoard AI Assistant Rules

> Extends global `~/.claude/CLAUDE.md` (Think Before Acting, Simplicity, Surgical Changes, Goal-Driven, Stop-and-Report). DirtBoard-specific rules below.

## 🎯 Project Context
DirtBoard is a land deal pipeline tracker for Putnam County, FL land flipping.
**Stack**: Next.js 16 + Supabase + Tailwind + shadcn/ui

## ⚠️ CRITICAL RULE: TDD IS MANDATORY

### TDD Enforcement Workflow
1. **WRITE TEST FIRST** - Create/update test file with assertions that WILL FAIL.
2. **RUN TESTS** - Run `npm run test:run` to confirm RED.
3. **IMPLEMENT** - Write minimal code to pass (GREEN).
4. **RUN TESTS AGAIN** - Confirm GREEN.
5. **REFACTOR** - Improve code while keeping tests green.

**BLOCKING RULE**: If a test file doesn't exist for new code, create it FIRST.

## 💰 Token Efficiency Rules

### Terminal & Testing
* Run `npm run test:run` directly to verify RED/GREEN.

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

# Tests
npm run test:run

# Lint
npm run lint
```
