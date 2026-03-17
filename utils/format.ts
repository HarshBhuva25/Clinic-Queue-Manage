import type { QueueTransitionStatus, Role } from "@/utils/types";

export function asRole(rawRole: string | undefined): Role | null {
  if (!rawRole) {
    return null;
  }

  const role =rawRole.toLowerCase();
  if (
   role === "admin" ||
    role === "patient" ||
    role === "receptionist" ||
    role === "doctor"
  ) {
    return role;
  }

  return null;
}

export function normalizeStatus(status: string | undefined): string {
  if (!status) {
    return "unknown";
  }

  return status.replaceAll("_", "-").toLowerCase();
}

export function statusClassName(status: string | undefined): string {
  const normalized =normalizeStatus(status);

  switch (normalized) {
    case "waiting":
      return "status-waiting";
    case "in-progress":
      return "status-in-progress";
   case "done":
      return "status-done";
    case "skipped":
      return "status-skipped";
    case "queued":
      return "status-queued";
    case "scheduled":
      return "status-scheduled";
    default:
     return "status-unknown";
  }
}

export function toDisplayStatus(status: string | undefined): string {
  return normalizeStatus(status).replaceAll("-", " ");
}

export function queueActions(status: string): QueueTransitionStatus[] {
  const normalized= normalizeStatus(status);

  if (normalized === "waiting") {
    return ["in-progress", "skipped"];
  }

  if (normalized === "in-progress") {
    return ["done"];
  }

  return [];
}

export function getTodayInputValue(): string {
  const now= new Date();
  const offset =now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

export function formatDate(dateString: string | undefined): string {
  if (!dateString) {
    return "N/A";
  }

  const value= new Date(dateString);
  if (Number.isNaN(value.getTime())) {
    return dateString;
  }

  return new Intl.DateTimeFormat("en-IN", {
    day:"2-digit",
    month: "short",
    year: "numeric",
  }).format(value);
}

export function formatDateTime(dateString: string | undefined): string {
  if (!dateString) {
    return "N/A";
  }

  const value =new Date(dateString);
  if (Number.isNaN(value.getTime())) {
    return dateString;
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour:"2-digit",
    minute: "2-digit",
  }).format(value);
}

export function getInitials(name: string): string {
  const parts= name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "CQ";
  }

  return parts
    .slice(0, 2)
   .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
