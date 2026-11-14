import { Info } from "lucide-react";

export function DemoNotice({ action }: { action: string }) {
  return (
    <div role="status" className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-900">
      <Info className="mt-0.5 shrink-0" size={17} aria-hidden="true" />
      <span>{action} is not available in this UI preview. No data was sent or saved.</span>
    </div>
  );
}
