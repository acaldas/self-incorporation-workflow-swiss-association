import { useState } from "react";
import type { DocumentDispatch } from "@powerhousedao/reactor-browser";
import type {
  ContributorAgreement,
  ContributorTermType,
  SwissAssociationAction,
} from "document-models/swiss-association";
import { updateContributorAgreement } from "document-models/swiss-association";
import { FormField } from "./FormField.js";
import { SectionCard } from "./SectionCard.js";

interface Props {
  agreement: ContributorAgreement;
  dispatch: DocumentDispatch<SwissAssociationAction>;
  disabled?: boolean;
}

const TERM_OPTIONS: { value: ContributorTermType; label: string }[] = [
  { value: "FIXED_DATE", label: "Fixed date" },
  { value: "ON_SOW_COMPLETION", label: "On SOW completion" },
  { value: "NOTICE", label: "Notice" },
];

interface FormShape {
  contractorIsEntity: boolean;
  termType: ContributorTermType;
  contractorName: string;
  contractorNationality: string;
  contractorAddress: string;
  entityName: string;
  entityType: string;
  entityJurisdiction: string;
  role: string;
  contractDate: string;
  workStartDate: string;
  workEndDate: string;
  terminationNoticePeriod: string;
  sowNumber: string;
  services: string;
  fteHours: string;
  compensation: string;
  denominationType: string;
  denominationCurrency: string;
}

// Date scalars are stored as full ISO datetimes; <input type="date"> works in
// date-only (yyyy-mm-dd), so convert on the way in and out.
function toDateInput(value: string | null | undefined): string {
  return value ? value.slice(0, 10) : "";
}
function toIsoDate(value: string): string | undefined {
  return value ? `${value}T00:00:00.000Z` : undefined;
}

function initForm(a: ContributorAgreement): FormShape {
  return {
    contractorIsEntity: a.contractorIsEntity,
    termType: a.termType,
    contractorName: a.contractorName ?? "",
    contractorNationality: a.contractorNationality ?? "",
    contractorAddress: a.contractorAddress ?? "",
    entityName: a.entityName ?? "",
    entityType: a.entityType ?? "",
    entityJurisdiction: a.entityJurisdiction ?? "",
    role: a.role ?? "",
    contractDate: toDateInput(a.contractDate),
    workStartDate: toDateInput(a.workStartDate),
    workEndDate: toDateInput(a.workEndDate),
    terminationNoticePeriod: a.terminationNoticePeriod ?? "",
    sowNumber: a.sowNumber ?? "",
    services: a.services ?? "",
    fteHours: a.fteHours ?? "",
    compensation: a.compensation ?? "",
    denominationType: a.denominationType ?? "",
    denominationCurrency: a.denominationCurrency ?? "",
  };
}

export function ContributorAgreementForm({
  agreement,
  dispatch,
  disabled = false,
}: Props) {
  const [form, setForm] = useState<FormShape>(() => initForm(agreement));
  const [savedAt, setSavedAt] = useState<string | null>(null);

  function update<K extends keyof FormShape>(key: K, value: FormShape[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setSavedAt(null);
  }

  function handleSave() {
    dispatch(
      updateContributorAgreement({
        id: agreement.id,
        contractorIsEntity: form.contractorIsEntity,
        termType: form.termType,
        contractorName: form.contractorName || undefined,
        contractorNationality: form.contractorNationality || undefined,
        contractorAddress: form.contractorAddress || undefined,
        entityName: form.entityName || undefined,
        entityType: form.entityType || undefined,
        entityJurisdiction: form.entityJurisdiction || undefined,
        role: form.role || undefined,
        contractDate: toIsoDate(form.contractDate),
        workStartDate: toIsoDate(form.workStartDate),
        workEndDate: toIsoDate(form.workEndDate),
        terminationNoticePeriod: form.terminationNoticePeriod || undefined,
        sowNumber: form.sowNumber || undefined,
        services: form.services || undefined,
        fteHours: form.fteHours || undefined,
        compensation: form.compensation || undefined,
        denominationType: form.denominationType || undefined,
        denominationCurrency: form.denominationCurrency || undefined,
      }),
    );
    setSavedAt(new Date().toLocaleTimeString());
  }

  return (
    <div className="space-y-6">
      <SectionCard title="Contractor">
        <FormField label="Contractor type">
          <div className="flex gap-2">
            {[
              { entity: false, label: "Individual" },
              { entity: true, label: "Legal entity" },
            ].map((opt) => (
              <button
                key={opt.label}
                type="button"
                disabled={disabled}
                onClick={() => update("contractorIsEntity", opt.entity)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  form.contractorIsEntity === opt.entity
                    ? "bg-red-600 border-red-600 text-white"
                    : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </FormField>

        {form.contractorIsEntity && (
          <>
            <FormField label="Entity name">
              <input
                type="text"
                disabled={disabled}
                value={form.entityName}
                onChange={(e) => update("entityName", e.target.value)}
                placeholder="Quadrille LLC"
                className="sw-input"
              />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Entity type">
                <input
                  type="text"
                  disabled={disabled}
                  value={form.entityType}
                  onChange={(e) => update("entityType", e.target.value)}
                  placeholder="LLC"
                  className="sw-input"
                />
              </FormField>
              <FormField label="Jurisdiction">
                <input
                  type="text"
                  disabled={disabled}
                  value={form.entityJurisdiction}
                  onChange={(e) => update("entityJurisdiction", e.target.value)}
                  placeholder="Delaware, USA"
                  className="sw-input"
                />
              </FormField>
            </div>
          </>
        )}

        <FormField
          label={form.contractorIsEntity ? "Signing agent name" : "Full name"}
        >
          <input
            type="text"
            disabled={disabled}
            value={form.contractorName}
            onChange={(e) => update("contractorName", e.target.value)}
            placeholder="Adelaide Edward Albl"
            className="sw-input"
          />
        </FormField>

        {!form.contractorIsEntity && (
          <FormField label="Nationality">
            <input
              type="text"
              disabled={disabled}
              value={form.contractorNationality}
              onChange={(e) => update("contractorNationality", e.target.value)}
              placeholder="Swiss"
              className="sw-input"
            />
          </FormField>
        )}

        <FormField label="Address">
          <input
            type="text"
            disabled={disabled}
            value={form.contractorAddress}
            onChange={(e) => update("contractorAddress", e.target.value)}
            placeholder="8 The Green, Suite A, Dover, Delaware 19901, USA"
            className="sw-input"
          />
        </FormField>
      </SectionCard>

      <SectionCard title="Engagement">
        <FormField label="Role / title with the OH">
          <input
            type="text"
            disabled={disabled}
            value={form.role}
            onChange={(e) => update("role", e.target.value)}
            placeholder="Financial and Professional Services Consultant"
            className="sw-input"
          />
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Contract date">
            <input
              type="date"
              disabled={disabled}
              value={form.contractDate}
              onChange={(e) => update("contractDate", e.target.value)}
              className="sw-input"
            />
          </FormField>
          <FormField label="Work start date">
            <input
              type="date"
              disabled={disabled}
              value={form.workStartDate}
              onChange={(e) => update("workStartDate", e.target.value)}
              className="sw-input"
            />
          </FormField>
        </div>

        <FormField label="Term">
          <div className="flex flex-wrap gap-2">
            {TERM_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                disabled={disabled}
                onClick={() => update("termType", opt.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  form.termType === opt.value
                    ? "bg-red-600 border-red-600 text-white"
                    : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </FormField>

        {form.termType === "FIXED_DATE" && (
          <FormField label="Work end date">
            <input
              type="date"
              disabled={disabled}
              value={form.workEndDate}
              onChange={(e) => update("workEndDate", e.target.value)}
              className="sw-input"
            />
          </FormField>
        )}
        {form.termType === "NOTICE" && (
          <FormField
            label="Termination notice period"
            hint="Calendar days of prior written notice"
          >
            <input
              type="text"
              disabled={disabled}
              value={form.terminationNoticePeriod}
              onChange={(e) =>
                update("terminationNoticePeriod", e.target.value)
              }
              placeholder="30"
              className="sw-input"
            />
          </FormField>
        )}
      </SectionCard>

      <SectionCard title="Statement of Work">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="SOW number">
            <input
              type="text"
              disabled={disabled}
              value={form.sowNumber}
              onChange={(e) => update("sowNumber", e.target.value)}
              placeholder="SOW-001"
              className="sw-input"
            />
          </FormField>
          <FormField label="Annual hours (FTE)">
            <input
              type="text"
              disabled={disabled}
              value={form.fteHours}
              onChange={(e) => update("fteHours", e.target.value)}
              placeholder="1800"
              className="sw-input"
            />
          </FormField>
        </div>
        <FormField label="Services & deliverables">
          <textarea
            disabled={disabled}
            value={form.services}
            onChange={(e) => update("services", e.target.value)}
            rows={4}
            placeholder="Describe the services and deliverables to be provided…"
            className="sw-input resize-none"
          />
        </FormField>
      </SectionCard>

      <SectionCard title="Compensation">
        <FormField label="Compensation" hint="Free-text (MVP)">
          <input
            type="text"
            disabled={disabled}
            value={form.compensation}
            onChange={(e) => update("compensation", e.target.value)}
            placeholder="5,000 per month excl. VAT"
            className="sw-input"
          />
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Denomination type">
            <input
              type="text"
              disabled={disabled}
              value={form.denominationType}
              onChange={(e) => update("denominationType", e.target.value)}
              placeholder="Fiat / crypto (stablecoin)"
              className="sw-input"
            />
          </FormField>
          <FormField label="Currency">
            <input
              type="text"
              disabled={disabled}
              value={form.denominationCurrency}
              onChange={(e) => update("denominationCurrency", e.target.value)}
              placeholder="CHF / USDC"
              className="sw-input"
            />
          </FormField>
        </div>
      </SectionCard>

      {!disabled && (
        <div className="flex items-center gap-3">
          <button type="button" onClick={handleSave} className="sw-btn-primary">
            Save details
          </button>
          {savedAt && (
            <span className="text-xs text-slate-500">Saved at {savedAt}</span>
          )}
        </div>
      )}
    </div>
  );
}
