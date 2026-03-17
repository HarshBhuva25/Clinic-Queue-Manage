import { statusClassName,toDisplayStatus } from "@/utils/format";

export function StatusBadge({ status }: { status: string | undefined }) {
  return (
    <span className={`status-chip ${statusClassName(status)}`}>
      {toDisplayStatus(status)}
    </span>
  );
}
