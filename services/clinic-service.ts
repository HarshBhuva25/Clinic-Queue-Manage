import { apiRequest } from "@/services/api";
import type {
  Appointment,
  AppointmentDetail,
  AuthResponse,
  BookAppointmentPayload,
  ClinicInfo,
  CreateUserPayload,
  DoctorQueueItem,
  LoginCredentials,
  Prescription,
  PrescriptionPayload,
  QueueEntry,
  QueueTransitionStatus,
  Report,
  ReportPayload,
  UserSummary,
} from "@/utils/types";

export function loginUser(credentials: LoginCredentials) {
  return apiRequest<AuthResponse>("/auth/login", {
    method: "POST",
    body: credentials,
  });
}

export function fetchAdminClinic(token: string) {
  return apiRequest<ClinicInfo>("/admin/clinic", {}, token);
}

export function fetchAdminUsers(token: string) {
  return apiRequest<UserSummary[]>("/admin/users", {}, token);
}

export function createClinicUser(token: string, payload: CreateUserPayload) {
  return apiRequest<UserSummary>(
   "/admin/users",
    {
      method: "POST",
      body: payload,
    },
    token,
  );
}

export function bookAppointment(token: string, payload: BookAppointmentPayload) {
  return apiRequest<Appointment>(
    "/appointments",
    {
      method: "POST",
      body: payload,
    },
    token,
  );
}

export function fetchMyAppointments(token: string) {
  return apiRequest<Appointment[]>("/appointments/my", {}, token);
}

export function fetchAppointmentDetail(token: string, appointmentId: number) {
  return apiRequest<AppointmentDetail>(`/appointments/${appointmentId}`, {}, token);
}

export function fetchMyPrescriptions(token: string) {
  return apiRequest<Prescription[]>("/prescriptions/my", {}, token);
}

export function fetchMyReports(token: string) {
  return apiRequest<Report[]>("/reports/my", {}, token);
}

export function fetchQueueByDate(token: string, date: string) {
  return apiRequest<QueueEntry[]>(`/queue?date=${encodeURIComponent(date)}`, {}, token);
}

export function updateQueueStatus(
  token: string,
  queueId: number,
  status: QueueTransitionStatus,
) {
  return apiRequest<QueueEntry>(
    `/queue/${queueId}`,
    {
      method:"PATCH",
      body: { status },
    },
    token,
  );
}

export function fetchDoctorQueue(token: string) {
  return apiRequest<DoctorQueueItem[]>("/doctor/queue", {}, token);
}

export function createPrescription(
  token:string,
  appointmentId: number,
  payload: PrescriptionPayload,
) {
  return apiRequest<Prescription>(
    `/prescriptions/${appointmentId}`,
    {
      method: "POST",
      body:payload,
    },
    token,
  );
}

export function createReport(
  token: string,
  appointmentId:number,
  payload: ReportPayload,
) {
  return apiRequest<Report>(
    `/reports/${appointmentId}`,
   {
      method: "POST",
      body: payload,
    },
    token,
  );
}
