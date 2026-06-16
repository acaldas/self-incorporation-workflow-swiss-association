import { useState } from "react";
import { generateId } from "document-model";
import type {
  SwissAssociationState,
  AssociationMember,
  MemberType,
} from "document-models/swiss-association";
import type { DocumentDispatch } from "@powerhousedao/reactor-browser";
import type { SwissAssociationAction } from "document-models/swiss-association";
import {
  addBoardMember,
  updateBoardMember,
  removeBoardMember,
  copyFoundingMembersToBoard,
} from "document-models/swiss-association";
import { FormField } from "./FormField.js";
import { SectionCard } from "./SectionCard.js";

interface Props {
  state: SwissAssociationState;
  dispatch: DocumentDispatch<SwissAssociationAction>;
  onNext: () => void;
  onBack: () => void;
}

type MemberForm = {
  id: string;
  type: MemberType;
  name: string;
  nationalityOrCountry: string;
  residenceOrCity: string;
  representative: string;
};

function emptyForm(): MemberForm {
  return {
    id: generateId(),
    type: "NATURAL_PERSON",
    name: "",
    nationalityOrCountry: "",
    residenceOrCity: "",
    representative: "",
  };
}

function BoardMemberCard({
  member,
  onEdit,
  onRemove,
}: {
  member: AssociationMember;
  onEdit: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-start justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-colors">
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
            member.type === "NATURAL_PERSON"
              ? "bg-blue-100 text-blue-700"
              : "bg-violet-100 text-violet-700"
          }`}
        >
          {member.type === "NATURAL_PERSON" ? "P" : "E"}
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">{member.name}</p>
          <p className="text-xs text-slate-500 mt-0.5">
            {member.residenceOrCity} · {member.nationalityOrCountry}
          </p>
          {member.representative && (
            <p className="text-xs text-slate-400 mt-0.5">
              Rep: {member.representative}
            </p>
          )}
          <span
            className={`inline-block mt-1.5 px-2 py-0.5 rounded text-xs font-medium ${
              member.type === "NATURAL_PERSON"
                ? "bg-blue-50 text-blue-600"
                : "bg-violet-50 text-violet-600"
            }`}
          >
            {member.type === "NATURAL_PERSON"
              ? "Natural Person"
              : "Legal Entity"}
          </span>
        </div>
      </div>
      <div className="flex gap-2 ml-4">
        <button
          onClick={onEdit}
          className="text-xs px-3 py-1.5 text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
        >
          Edit
        </button>
        <button
          onClick={onRemove}
          className="text-xs px-3 py-1.5 text-red-500 border border-red-100 rounded-lg hover:bg-red-50 transition-colors"
        >
          Remove
        </button>
      </div>
    </div>
  );
}

function BoardMemberFormModal({
  initial,
  onSave,
  onCancel,
}: {
  initial: MemberForm;
  onSave: (form: MemberForm) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<MemberForm>(initial);
  const isValid =
    form.name && form.nationalityOrCountry && form.residenceOrCity;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="px-6 pt-6 pb-4 border-b border-slate-100">
          <h3 className="text-base font-semibold text-slate-900">
            {initial.name ? "Edit Board Member" : "Add Board Member"}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Board members can be natural persons or legal entities.
          </p>
        </div>
        <div className="p-6 space-y-4">
          <FormField label="Member Type">
            <div className="flex gap-3">
              {(["NATURAL_PERSON", "LEGAL_ENTITY"] as MemberType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setForm({ ...form, type: t })}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition-colors ${
                    form.type === t
                      ? "bg-red-600 border-red-600 text-white"
                      : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  {t === "NATURAL_PERSON" ? "Natural Person" : "Legal Entity"}
                </button>
              ))}
            </div>
          </FormField>

          <FormField label="Full Legal Name" required>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder={
                form.type === "NATURAL_PERSON"
                  ? "Alice Mueller"
                  : "Acme Labs LLC"
              }
              className="sw-input"
              autoFocus
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label={
                form.type === "NATURAL_PERSON"
                  ? "Nationality"
                  : "Country of Incorporation"
              }
              required
            >
              <input
                type="text"
                value={form.nationalityOrCountry}
                onChange={(e) =>
                  setForm({ ...form, nationalityOrCountry: e.target.value })
                }
                placeholder="Swiss"
                className="sw-input"
              />
            </FormField>
            <FormField
              label={
                form.type === "NATURAL_PERSON"
                  ? "City of Residence"
                  : "City of Incorporation"
              }
              required
            >
              <input
                type="text"
                value={form.residenceOrCity}
                onChange={(e) =>
                  setForm({ ...form, residenceOrCity: e.target.value })
                }
                placeholder="Zurich, Switzerland"
                className="sw-input"
              />
            </FormField>
          </div>

          {form.type === "LEGAL_ENTITY" && (
            <FormField
              label="Representative Name"
              hint="Person signing on behalf of the entity"
            >
              <input
                type="text"
                value={form.representative}
                onChange={(e) =>
                  setForm({ ...form, representative: e.target.value })
                }
                placeholder="Bob Smith"
                className="sw-input"
              />
            </FormField>
          )}
        </div>
        <div className="px-6 pb-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(form)}
            disabled={!isValid}
            className="sw-btn-primary"
          >
            {initial.name ? "Save Changes" : "Add Board Member"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function StepBoardSetup({ state, dispatch, onNext, onBack }: Props) {
  const boardMembers = state.boardMembers ?? [];
  const [boardSelection, setBoardSelection] = useState<"YES" | "NO" | null>(
    boardMembers.length === 0 ? null : state.isPersonalunion ? "YES" : "NO",
  );
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState<MemberForm | null>(null);

  function handleAdd(form: MemberForm) {
    dispatch(
      addBoardMember({
        id: form.id,
        type: form.type,
        name: form.name,
        nationalityOrCountry: form.nationalityOrCountry,
        residenceOrCity: form.residenceOrCity,
        representative: form.representative || undefined,
      }),
    );
    setShowForm(false);
  }

  function handleUpdate(form: MemberForm) {
    dispatch(
      updateBoardMember({
        id: form.id,
        type: form.type,
        name: form.name,
        nationalityOrCountry: form.nationalityOrCountry,
        residenceOrCity: form.residenceOrCity,
        representative: form.representative || undefined,
      }),
    );
    setEditingMember(null);
  }

  function handleRemove(id: string) {
    dispatch(removeBoardMember({ id }));
  }

  function handleCopyFoundingMembers() {
    dispatch(copyFoundingMembersToBoard({ confirm: true }));
  }

  function handleUseFoundingMembersAsBoard() {
    setBoardSelection("YES");
    handleCopyFoundingMembers();
  }

  function handleUseSeparateBoard() {
    setBoardSelection("NO");

    // If the board is currently a copied Personalunion set, clear it so user can enter separate names.
    if (state.isPersonalunion && boardMembers.length > 0) {
      dispatch(
        boardMembers.map((member) => removeBoardMember({ id: member.id })),
      );
    }
  }

  const boardCount = boardMembers.length;
  const isEmpty = boardCount === 0;

  return (
    <div className="max-w-2xl space-y-6">
      {(showForm || editingMember) && (
        <BoardMemberFormModal
          initial={editingMember ?? emptyForm()}
          onSave={editingMember ? handleUpdate : handleAdd}
          onCancel={() => {
            setShowForm(false);
            setEditingMember(null);
          }}
        />
      )}

      <div>
        <h2 className="text-xl font-semibold text-slate-900">Board Setup</h2>
        <p className="text-sm text-slate-500 mt-1">
          Board setup (Vorstand). The board is the executive body of the
          association. It is the organ that manages the affairs of the
          association and represents it externally. The same group of persons
          can be simultaneously founding members and board members. In this
          case, no additional body is needed (Personalunion).
        </p>
      </div>

      <SectionCard title="Board Members">
        <div className="space-y-3">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <p className="text-sm font-medium text-slate-800">
              Should the founding members also serve in the board?
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleUseFoundingMembersAsBoard}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  boardSelection === "YES"
                    ? "bg-red-600 border-red-600 text-white"
                    : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                Yes
              </button>
              <button
                onClick={handleUseSeparateBoard}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  boardSelection === "NO"
                    ? "bg-red-600 border-red-600 text-white"
                    : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                No
              </button>
            </div>
          </div>

          {isEmpty && boardSelection !== "NO" && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <p className="text-sm text-slate-600">
                Add board members or copy from founding members.
              </p>
            </div>
          )}

          {isEmpty && boardSelection === "NO" && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <p className="text-sm text-slate-600">
                Please add board member names below.
              </p>
            </div>
          )}

          {!isEmpty && state.isPersonalunion && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-xs font-medium text-blue-800 mb-1">
                Current configuration: Personalunion
              </p>
              <p className="text-xs text-blue-700">
                The founding members also serve as the board. Under this
                configuration, a separate board body is not needed, and the
                standard Articles of Association template applies.
              </p>
            </div>
          )}

          {!isEmpty && !state.isPersonalunion && (
            <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
              <p className="text-xs font-medium text-indigo-800 mb-1">
                Current configuration: Separate Board
              </p>
              <p className="text-xs text-indigo-700">
                The board composition differs from the founding members. The
                Articles of Association output will include a new Article 7 for
                board composition, and references to Personalunion will be
                removed from the standard template.
              </p>
            </div>
          )}

          {boardMembers.map((member) => (
            <BoardMemberCard
              key={member.id}
              member={member}
              onEdit={() =>
                setEditingMember({
                  id: member.id,
                  type: member.type,
                  name: member.name,
                  nationalityOrCountry: member.nationalityOrCountry,
                  residenceOrCity: member.residenceOrCity,
                  representative: member.representative ?? "",
                })
              }
              onRemove={() => handleRemove(member.id)}
            />
          ))}

          <button
            onClick={() => setShowForm(true)}
            className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-sm font-medium text-slate-500 hover:border-red-300 hover:text-red-600 transition-colors"
          >
            + Add Board Member
          </button>
        </div>
      </SectionCard>

      <div className="flex justify-between pt-2">
        <button onClick={onBack} className="sw-btn-secondary">
          ← Back
        </button>
        <button onClick={onNext} className="sw-btn-primary">
          Save & Continue →
        </button>
      </div>
    </div>
  );
}
