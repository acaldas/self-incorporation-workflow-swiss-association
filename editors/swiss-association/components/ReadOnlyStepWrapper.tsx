import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

// Wraps a step's content in a read-only "preview" state: the editable content
// is visually softened and made non-interactive, while a gentle banner explains
// why. Navigation lives in the sidebar (outside this wrapper) and is unaffected.
export function ReadOnlyStepWrapper({ children }: Props) {
  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-200 rounded-lg">
        <span className="text-amber-500 text-sm leading-5 flex-shrink-0">
          👁
        </span>
        <div>
          <p className="text-xs font-semibold text-amber-800">Preview only</p>
          <p className="text-xs text-amber-700">
            Complete the previous steps to edit this section.
          </p>
        </div>
      </div>
      <div style={{ opacity: 0.6, pointerEvents: "none" }} aria-hidden="true">
        {children}
      </div>
    </div>
  );
}
