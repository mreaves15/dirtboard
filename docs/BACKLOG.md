# DirtBoard Backlog

Active work tickets for the DirtBoard app. Scan top-down by priority.

**Format:** `- [ ] **[priority]** description — rationale / link to source doc`
**Priorities:** `high` / `med` / `low`

---

## Schema cleanup — `properties` table
_Source: [2026-04-19 properties schema audit](./audits/2026-04-19-properties-schema-audit.md)_

- [x] ~~**[high]** Normalize `property_type` values~~ — done 2026-04-26. Mapped 9 values → `raw_land`/`improved`/`mobile_home`/NULL. Default dropped, CHECK constraint added. UI dropdown + TS type narrowed.
- [x] ~~**[high]** Merge `disqualification_notes` into `disqualification_reason`~~ — done 2026-04-26. Reframed: not duplicates (reason=enum, notes=context). Normalized 94 rows of malformed/freeform values in `reason` (28 distinct → 18 canonical). Added `recent_arms_length_sale` + `hoa_buyer_pool_restriction` to enum. Added CHECK constraint. TS type synced.
- [x] ~~**[med]** Replace freeform `window.prompt` in property detail `handleDisqualify` with a dropdown of `DisqualificationReason` enum values~~ — done 2026-04-27. Inline form panel with select + textarea, pre-fills existing reason/notes when re-disqualifying. Confirm button disabled until reason selected. Browser-verified.
- [x] ~~**[med]** Drop dead columns: `mortgage_details` (0 rows), `tax_sale_date` (0), `has_power_at_road` (3), `is_tax_delinquent_motivated` (1), `deal_verdict` (5).~~ — done 2026-04-27. Migration `drop_dead_property_columns` applied. Removed Deal Verdict cell + Tax Delinquent badge from detail page. Types/schema.sql/mock-data synced. `DealVerdict` enum deleted. Browser-verified.
- [ ] **[med]** Rename triple sale-price fields for clarity: `accepted_price` → `buy_accepted`, `actual_purchase_price` → `buy_final`, `sale_price` → `resale_price`.
- [ ] **[low]** Revisit `asking_price` — only 3 rows, only relevant for listed-land leads (listing-analyzer). Keep or drop.

## UI gaps — columns with data but no display
_Source: [2026-04-19 properties schema audit](./audits/2026-04-19-properties-schema-audit.md)_

- [ ] **[med]** Add UI for deal-close pipeline (`offer_amount`, `offer_date`, `counter_amount`, `offer_status`, `closing_date`, `actual_purchase_price`, `sale_price`, `actual_profit`) — currently no form exists, so all are 0 rows.
- [ ] **[med]** Surface tax detail on property detail page: `years_delinquent` (201 rows), `has_tax_certificate` (194), `taxes_owed` (239).
- [ ] **[med]** Display `last_sale_date` / `last_sale_price` on property detail — drives the 5-year recent-sale DQ rule but not shown anywhere (446 rows populated).
- [ ] **[med]** Surface `annual_assessment` on detail page when `has_hoa=false` (SBD/improvement-district margin math, 182 rows).
- [ ] **[low]** Surface physical-access fields: `has_road_access` (138), `road_type` (121), `is_landlocked` (85), `allows_mobile_homes` (222).
- [ ] **[low]** Display `has_wetlands` badge on list/detail views (1279 rows populated, never shown).
- [ ] **[low]** Add lien viewer for `lien_details` JSONB — 9 rows have structured data, never rendered.
