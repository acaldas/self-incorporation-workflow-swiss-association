import { useState } from "react";
import type { SwissAssociationState } from "document-models/swiss-association";
import type { DocumentDispatch } from "@powerhousedao/reactor-browser";
import type { SwissAssociationAction } from "document-models/swiss-association";
import { setMultisigConfig } from "document-models/swiss-association";
import { FormField } from "./FormField.js";
import { SectionCard } from "./SectionCard.js";

interface Props {
  state: SwissAssociationState;
  dispatch: DocumentDispatch<SwissAssociationAction>;
  onNext: () => void;
  onBack: () => void;
}

const PLATFORMS = ["Safe Multisig", "Other"] as const;

export function StepMultisigConfig({ state, dispatch, onNext, onBack }: Props) {
  const [needsMultisig, setNeedsMultisig] = useState<boolean | null>(
    state.multisig ? true : null,
  );
  const existing = state.multisig;
  const existingPlatform = existing?.platform ?? "Safe Multisig";
  const isExistingCustomPlatform =
    existingPlatform !== "Safe Multisig" && existingPlatform !== "Other";
  const [selectedPlatform, setSelectedPlatform] = useState<
    "Safe Multisig" | "Other"
  >(isExistingCustomPlatform ? "Other" : existingPlatform);
  const [customPlatformName, setCustomPlatformName] = useState(
    isExistingCustomPlatform ? existingPlatform : "",
  );
  const [address, setAddress] = useState(existing?.address ?? "");
  const [keysTotal, setKeysTotal] = useState(existing?.keysTotal ?? 3);
  const [decisionQuorum, setDecisionQuorum] = useState(
    existing?.decisionQuorum ?? 2,
  );
  const [privateChannel, setPrivateChannel] = useState(
    existing?.privateChannel ?? "",
  );
  const [availabilityThreshold, setAvailabilityThreshold] = useState(
    existing?.availabilityThreshold ?? "48 hours",
  );
  const [internalPolicyLink, setInternalPolicyLink] = useState(
    existing?.internalPolicyLink ?? "",
  );
  const [multisigDate, setMultisigDate] = useState(
    existing?.multisigDate ?? "",
  );
  const [emergencyProcedures, setEmergencyProcedures] = useState(
    existing?.emergencyProcedures ?? "",
  );

  function handleSave() {
    const resolvedPlatform =
      selectedPlatform === "Other"
        ? customPlatformName.trim()
        : "Safe Multisig";

    dispatch(
      setMultisigConfig({
        platform: resolvedPlatform,
        address,
        keysTotal,
        decisionQuorum,
        privateChannel: privateChannel || undefined,
        availabilityThreshold: availabilityThreshold || undefined,
        internalPolicyLink: internalPolicyLink || undefined,
        multisigDate: multisigDate || undefined,
        emergencyProcedures: emergencyProcedures || undefined,
      }),
    );
    onNext();
  }

  const isValid =
    (selectedPlatform === "Safe Multisig" ||
      customPlatformName.trim() !== "") &&
    address.trim() !== "" &&
    keysTotal >= 1 &&
    decisionQuorum >= 1 &&
    decisionQuorum <= keysTotal;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">
          Treasury Governance
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Configure how your association manages its on-chain treasury.
        </p>
      </div>

      <SectionCard title="Multisig Wallet">
        <p className="text-sm text-slate-700 mb-4">
          Does your team need a multisig wallet to manage association funds?
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setNeedsMultisig(true)}
            className={`px-5 py-2 rounded-lg text-sm font-medium border transition-colors ${
              needsMultisig === true
                ? "bg-red-600 border-red-600 text-white"
                : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
            }`}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => {
              setNeedsMultisig(false);
              onNext();
            }}
            className={`px-5 py-2 rounded-lg text-sm font-medium border transition-colors ${
              needsMultisig === false
                ? "bg-red-600 border-red-600 text-white"
                : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
            }`}
          >
            No
          </button>
        </div>
      </SectionCard>

      {needsMultisig === false && null}
      {needsMultisig !== true ? (
        <div className="flex justify-between pt-2">
          <button type="button" onClick={onBack} className="sw-btn-secondary">
            ← Back
          </button>
        </div>
      ) : (
        <>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-1">
            <p className="font-medium text-slate-700">Swiss law note</p>
            <p>
              Swiss law does not yet explicitly govern multisig rules in
              association statutes. Best practice: define multisig rules in a
              separate Multisig Participation Agreement referenced as a
              "Reglement" in the Statuten.
            </p>
          </div>

          <SectionCard title="Wallet Setup">
            <FormField label="Platform">
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.map((p) => (
                  <button
                    key={p}
                    onClick={() => setSelectedPlatform(p)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                      selectedPlatform === p
                        ? "bg-red-600 border-red-600 text-white"
                        : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              {selectedPlatform === "Other" && (
                <input
                  type="text"
                  placeholder="Platform name (required)"
                  className="sw-input mt-2"
                  value={customPlatformName}
                  onChange={(e) => setCustomPlatformName(e.target.value)}
                />
              )}
            </FormField>

            <FormField
              label="Wallet Address"
              required
              hint="The multisig wallet address (e.g. 0x...)"
            >
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="0x0000000000000000000000000000000000000000"
                className="sw-input font-mono text-sm"
              />
            </FormField>

            <FormField
              label="Multisig Date"
              hint="Date the MPA will be / was executed (may differ from founding date)"
            >
              <input
                type="date"
                value={multisigDate}
                onChange={(e) => setMultisigDate(e.target.value)}
                className="sw-input"
              />
            </FormField>
          </SectionCard>

          <SectionCard title="Signing Threshold">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Total Signers" required>
                <input
                  type="number"
                  value={keysTotal}
                  min={1}
                  max={20}
                  onChange={(e) => setKeysTotal(parseInt(e.target.value) || 1)}
                  className="sw-input"
                />
              </FormField>
              <FormField label="Required to Sign (Quorum)" required>
                <input
                  type="number"
                  value={decisionQuorum}
                  min={1}
                  max={keysTotal}
                  onChange={(e) =>
                    setDecisionQuorum(parseInt(e.target.value) || 1)
                  }
                  className="sw-input"
                />
              </FormField>
            </div>
            {keysTotal >= 1 && decisionQuorum >= 1 && (
              <div className="mt-3 p-3 bg-slate-50 rounded-lg flex items-center gap-3">
                <div className="w-12 h-12 bg-white border border-slate-200 rounded-xl flex flex-col items-center justify-center flex-shrink-0">
                  <span className="text-lg font-bold text-slate-900 leading-none">
                    {decisionQuorum}
                  </span>
                  <span className="text-xs text-slate-400">of {keysTotal}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">
                    {decisionQuorum}-of-{keysTotal} multisig
                  </p>
                  <p className="text-xs text-slate-500">
                    {decisionQuorum > keysTotal
                      ? "⚠ Quorum cannot exceed total signers"
                      : decisionQuorum === keysTotal
                        ? "Unanimous — all signers must approve every transaction"
                        : `${keysTotal - decisionQuorum} signer${keysTotal - decisionQuorum > 1 ? "s" : ""} can be unavailable without blocking transactions`}
                  </p>
                </div>
              </div>
            )}
          </SectionCard>

          <SectionCard title="Governance Details">
            <FormField
              label="Coordination Channel"
              hint="e.g. Discord channel, Telegram group, Slack"
            >
              <input
                type="text"
                value={privateChannel}
                onChange={(e) => setPrivateChannel(e.target.value)}
                placeholder="#treasury-signers"
                className="sw-input"
              />
            </FormField>
            <FormField
              label="Availability Threshold"
              hint="Maximum acceptable response time for urgent transactions"
            >
              <input
                type="text"
                value={availabilityThreshold}
                onChange={(e) => setAvailabilityThreshold(e.target.value)}
                placeholder="48 hours"
                className="sw-input"
              />
            </FormField>
            <FormField
              label="Internal Policy Link"
              hint="URL to treasury / finance control policy"
            >
              <input
                type="url"
                value={internalPolicyLink}
                onChange={(e) => setInternalPolicyLink(e.target.value)}
                placeholder="https://notion.so/your-finance-policy"
                className="sw-input"
              />
            </FormField>
          </SectionCard>

          <SectionCard title="Emergency Procedures">
            <FormField
              label="Emergency Key Recovery Procedure"
              hint="Leave blank to use the default clause drafted by Claude"
            >
              <textarea
                value={emergencyProcedures}
                onChange={(e) => setEmergencyProcedures(e.target.value)}
                rows={4}
                placeholder="Leave blank to auto-populate with a standard emergency procedure clause..."
                className="sw-input resize-none"
              />
            </FormField>
            {!emergencyProcedures && (
              <p className="text-xs text-slate-500 mt-1">
                A default procedure covering key loss, incapacitation, and
                dispute resolution will be inserted when the MPA is generated.
              </p>
            )}
          </SectionCard>

          <div className="flex justify-between pt-2">
            <button onClick={onBack} className="sw-btn-secondary">
              ← Back
            </button>
            <button
              onClick={handleSave}
              disabled={!isValid}
              className="sw-btn-primary"
            >
              Save & Continue →
            </button>
          </div>
        </>
      )}
    </div>
  );
}
