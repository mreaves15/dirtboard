# Properties Schema Audit — 2026-04-19

Audit of the `properties` table in Supabase (project `uwmxejewudmhvabrhqps`) for redundant, inconsistent, overloaded, or unused columns. Snapshot at 2873 total rows.

## Summary

69 columns on `properties`. ~28 actively rendered in UI (~40%). Several patterns of bad data modeling identified. Recommendations below, scored by impact.

---

## Bad modeling — rename / consolidate

### 1. `property_type` — inconsistent values
**Rows populated:** 2639 (of 2873)

| Value | Count |
|---|---|
| `vacant_land` | 1788 |
| `raw_land` | 832 |
| `unknown` | 234 |
| `mobile_home` | 8 |
| `residential` | 5 |
| `single_family` | 3 |
| `institutional` | 1 |
| `improved` | 1 |
| `vacant` | 1 |

Two tags for the same concept (`vacant_land` / `raw_land`). Also redundant with `improvement_value=0` (qualification criteria) and `dor_code='00'` (county PA source of truth). Three ways to know it's raw land.

**Options:** (a) normalize all values to a single enum, (b) drop entirely and derive from `improvement_value` + `dor_code`.

### 2. `disqualification_reason` (1435) + `disqualification_notes` (1324) — near-duplicate
Two separate text columns, nearly 1:1 populated. One is redundant. Merge to single column.

### 3. `deal_verdict` — 5 rows populated
Values: `pass` (3), `qualified` (1), `strong_lead` (1). Semantically overlaps with `status`. Dead column. Drop.

### 4. `is_tax_delinquent_motivated` — 1 row populated
Derivable from `tax_status='delinquent'` + `years_delinquent`. Drop.

### 5. Triple sale-price fields — confusing names
Three distinct columns (all 0 rows — deal pipeline empty):
- `accepted_price` — offer accepted by seller
- `actual_purchase_price` — paid at closing (may differ)
- `sale_price` — resold to end buyer

Distinct semantics, confusingly named. If kept, rename for clarity (e.g. `buy_accepted`, `buy_final`, `resale_price`).

---

## Dead / near-dead columns — drop candidates

| Column | Rows | Notes |
|---|---|---|
| `mortgage_details` | 0 | Text field; `has_mortgage` (12 rows) covers the flag |
| `tax_sale_date` | 0 | Never populated |
| `has_power_at_road` | 3 | Effectively unused |
| `asking_price` | 3 | Only relevant for listed-land leads (listing-analyzer skill) |
| `is_tax_delinquent_motivated` | 1 | See #4 above |
| `deal_verdict` | 5 | See #3 above |

---

## Empty but legitimate — keep

All deal-close pipeline columns have 0 rows because no deal has closed yet. Don't drop — will be needed once pipeline produces deals. These need UI before they can be populated:

- `offer_amount`, `offer_date`, `counter_amount`, `offer_status`, `accepted_price`
- `closing_date`, `actual_purchase_price`, `sale_price`, `actual_profit`

---

## Signal-weak — revisit

### `is_inherited` — 2781 / 2873 (96.8%)
Historical population rate is high because probate was the early pipeline. But Marion and Highlands are full raw-land rosters (not probate-only), so going forward this flag carries real signal — keep. Consider it may skew historical analyses.

---

## UI gaps — columns with data but no display

Columns populated in DB but not surfaced in the UI (from earlier UI audit):

**Tax/lien detail:** `years_delinquent` (201), `has_tax_certificate` (194), `tax_sale_date` (0), `lien_details` (9 JSONB)
**Physical:** `has_road_access` (138), `road_type` (121), `is_landlocked` (85), `has_wetlands` (1279), `allows_mobile_homes` (222)
**PA data:** `dor_code` (2569), `legal_description` (1021)
**Pricing:** `price_per_acre` (773), `annual_assessment` (182)
**Sale history:** `last_sale_date` (446), `last_sale_price` (446) — drives the recent-sale DQ rule, not shown anywhere

---

## Methodology

- Column list: `information_schema.columns`
- Usage: `COUNT(col)` per column
- UI coverage: grep `src/` for column-name references
