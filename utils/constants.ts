import type { QueueTransitionStatus, Role } from "@/utils/types";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://cmsback.sampaarsh.cloud";

export const SESSION_STORAGE_KEY = "clinic_queue_session_v1";

export const ROLE_RIGHTS: Record<Role, string[]> = {
  admin:[
   "View clinic details and overall counts.",
    "See all users linked to this clinic.",
    "Create doctor, receptionist, and patient accounts.",
  ],
  patient: [
    "Book appointments in available date and time slots.",
    "Track your queue token and appointment status.",
    "View your prescriptions and medical reports.",
  ],
  receptionist: [
    "Check the queue for any selected date.",
    "Move queue entries through allowed status transitions.",
    "Mark patients as in progress, done, or skipped.",
  ],
  doctor: [
    "Review today's queue with patient and appointment details.",
    "Create prescriptions with medicine details.",
    "Create reports with diagnosis and remarks.",
  ],
};

export const TIME_SLOTS = [
  "09:00-09:15",
  "09:15-09:30",
  "09:30-09:45",
  "09:45-10:00",
  "10:00-10:15",
  "10:15-10:30",
  "10:30-10:45",
  "10:45-11:00",
  "11:00-11:15",
  "11:15-11:30",
  "11:30-11:45",
  "11:45-12:00",
  "14:00-14:15",
  "14:15-14:30",
  "14:30-14:45",
  "14:45-15:00",
  "15:00-15:15",
  "15:15-15:30",
  "15:30-15:45",
  "15:45-16:00",
];

export const QUEUE_ACTION_LABEL: Record<QueueTransitionStatus, string> = {
  "in-progress": "Mark In Progress",
  done: "Mark Done",
  skipped:"Mark Skipped",
};
