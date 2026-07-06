
## Post-merge review debt
- **§4 contributor-agreement term clauses — UNREVIEWED.** CLI rewrote the three termType 
  clauses (FIXED_DATE / ON_SOW_COMPLETION / NOTICE) from broken source "OR" fragments into full 
  sentences. Merged without human/legal review. Verify each reads as a coherent standalone 
  contract term before these generate for real entities. Check: notice clause names who may give 
  notice + period; fixed-date clause states end/renewal behavior; SOW-completion clause defines 
  the trigger. Grep: TERM: in the contributor agreement template.
- Contributor collection reducer: only smoke tests + one legacy-doc regression test — below 95% 
  coverage gate. Add scenario tests.
