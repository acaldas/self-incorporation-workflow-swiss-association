import { useState } from "react";
import type {
  SwissAssociationState,
  PrimaryLanguage,
} from "document-models/swiss-association";
import type { DocumentDispatch } from "@powerhousedao/reactor-browser";
import type { SwissAssociationAction } from "document-models/swiss-association";
import {
  setAssociationName,
  setAssociationSeat,
  setFiscalDetails,
  setPurpose,
} from "document-models/swiss-association";
import { FormField } from "./FormField.js";
import { SectionCard } from "./SectionCard.js";

interface Props {
  state: SwissAssociationState;
  dispatch: DocumentDispatch<SwissAssociationAction>;
  onNext: () => void;
}

export function StepAssociationDetails({ state, dispatch, onNext }: Props) {
  const [nameEn, setNameEn] = useState(state.nameEn ?? "");
  const [nameDe, setNameDe] = useState(state.nameDe ?? "");
  const [seatCity, setSeatCity] = useState(state.seatCity ?? "Zug");
  const [seatCanton, setSeatCanton] = useState(
    state.seatCanton ?? "Canton Zug",
  );
  const [registeredAddress, setRegisteredAddress] = useState(
    state.registeredAddress ?? "",
  );
  const [fiscalYearEnd, setFiscalYearEnd] = useState(
    state.fiscalYearEnd ?? "31 December",
  );
  const [membershipFee, setMembershipFee] = useState(
    state.membershipFee ?? "none",
  );
  const [primaryLanguage, setPrimaryLanguageState] = useState<PrimaryLanguage>(
    state.primaryLanguage ?? "EN",
  );
  const [purposeEn, setPurposeEn] = useState(state.purposeEn ?? "");
  const [purposeDe, setPurposeDe] = useState(state.purposeDe ?? "");

  function handleSave() {
    if (nameEn)
      dispatch(setAssociationName({ nameEn, nameDe: nameDe || undefined }));
    if (seatCity && seatCanton)
      dispatch(
        setAssociationSeat({
          seatCity,
          seatCanton,
          registeredAddress: registeredAddress || undefined,
        }),
      );
    dispatch(
      setFiscalDetails({ fiscalYearEnd, membershipFee, primaryLanguage }),
    );
    if (purposeEn)
      dispatch(setPurpose({ purposeEn, purposeDe: purposeDe || undefined }));
    onNext();
  }

  const isValid =
    nameEn.trim() !== "" &&
    seatCity.trim() !== "" &&
    registeredAddress.trim() !== "" &&
    purposeEn.trim() !== "";

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">
          Association Details
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Define the identity and purpose of your Swiss association. This
          information will appear in your Articles of Association.
        </p>
      </div>

      <SectionCard title="Identity">
        <FormField label="Association Name (English)" required>
          <input
            type="text"
            value={nameEn}
            onChange={(e) => setNameEn(e.target.value)}
            placeholder="e.g. Open Protocol Foundation"
            className="sw-input"
          />
        </FormField>
        <FormField
          label="Primary Working Language"
          hint="Choose the single language used while drafting inputs in this editor."
        >
          <div className="flex gap-3">
            {(["EN"] as PrimaryLanguage[]).map((lang) => (
              <button
                key={lang}
                onClick={() => setPrimaryLanguageState(lang)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  primaryLanguage === lang
                    ? "bg-red-600 border-red-600 text-white"
                    : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs font-medium text-amber-800 mb-1">
              Swiss filing note
            </p>
            <p className="text-xs text-amber-700">
              Official filing outputs will still require German translations of
              required sections before submission in Switzerland.
            </p>
          </div>
        </FormField>
      </SectionCard>

      <SectionCard title="Registered Seat">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="City" required>
            <input
              type="text"
              value={seatCity}
              onChange={(e) => setSeatCity(e.target.value)}
              placeholder="Zug"
              className="sw-input"
            />
          </FormField>
          <FormField label="Canton" required>
            <input
              type="text"
              value={seatCanton}
              onChange={(e) => setSeatCanton(e.target.value)}
              placeholder="Canton Zug"
              className="sw-input"
            />
          </FormField>
        </div>
        <FormField
          label="Registered Address"
          hint="Domicile provider address"
          required
        >
          <input
            type="text"
            value={registeredAddress}
            onChange={(e) => setRegisteredAddress(e.target.value)}
            placeholder="c/o Provider, Bahnhofstrasse 1, 6300 Zug"
            className="sw-input"
          />
        </FormField>
      </SectionCard>

      <SectionCard title="Fiscal">
        <FormField label="Fiscal Year End">
          <input
            type="text"
            value={fiscalYearEnd}
            onChange={(e) => setFiscalYearEnd(e.target.value)}
            placeholder="31 December"
            className="sw-input"
          />
        </FormField>
        <FormField
          label="Annual Membership Fee"
          hint="Enter an amount (e.g. CHF 100) or 'none'"
        >
          <input
            type="text"
            value={membershipFee}
            onChange={(e) => setMembershipFee(e.target.value)}
            placeholder="none"
            className="sw-input"
          />
        </FormField>
      </SectionCard>

      <SectionCard title="Purpose Clause">
        <FormField
          label="Purpose (English)"
          required
          hint="2–4 sentences. This appears directly in Art. 2 of your Articles of Association."
        >
          <textarea
            value={purposeEn}
            onChange={(e) => setPurposeEn(e.target.value)}
            rows={4}
            placeholder="The purpose of the Association is to support and fund the development of open source software as a public good..."
            className="sw-input resize-none"
          />
        </FormField>
        {purposeEn && (
          <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs font-medium text-amber-800 mb-1">
              Legal note
            </p>
            <p className="text-xs text-amber-700">
              The English version will prevail unless you update the language
              clause. Ensure the purpose is exclusively non-commercial for Art.
              60 ZGB compliance.
            </p>
          </div>
        )}
      </SectionCard>

      {!isValid && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
          Please fill in all required fields before continuing:{" "}
          {[
            !nameEn.trim() && "Association Name (English)",
            !seatCity.trim() && "City",
            !registeredAddress.trim() && "Registered Address",
            !purposeEn.trim() && "Purpose (English)",
          ]
            .filter(Boolean)
            .join(", ")}
          .
        </div>
      )}
      <div className="flex justify-end pt-2">
        <button
          onClick={handleSave}
          disabled={!isValid}
          className="sw-btn-primary"
        >
          Save & Continue →
        </button>
      </div>
    </div>
  );
}
