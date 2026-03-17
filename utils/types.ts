export type Role = "admin" | "patient" | "receptionist" | "doctor";

export type CreatableRole = "doctor" | "receptionist" | "patient";

export type QueueTransitionStatus = "in-progress" | "done" | "skipped";

export interface AuthUser {
  id: number;
  name:string;
  email: string;
  role: Role;
  clinicId: number;
  clinicName?: string;
  clinicCode?: string;
}

export interface AuthResponse {
  token: string;
  user: Omit<AuthUser, "role"> & { role: string };
}

export interface AuthSession {
  token: string;
  user: AuthUser;
}

export interface ClinicInfo {
  id?: number;
  name:string;
  code: string;
  userCount: number;
  appointmentCount: number;
  queueCount:number;
}

export interface UserSummary {
  id:number;
  name: string;
  email: string;
  role: string;
  phone?: string;
  createdAt?: string;
}

export interface QueueEntry {
  id: number;
  tokenNumber: number;
  status: string;
  queueDate?: string;
  appointmentId: number;
  appointment?: {
    patient?: {
      name?: string;
      phone?: string;
   };
  };
}

export interface Appointment {
  id: number;
  appointmentDate:string;
  timeSlot: string;
  status: string;
  createdAt?: string;
  queueEntry?: QueueEntry;
}

export interface Medicine {
  name:string;
  dosage: string;
  duration: string;
}

export interface Prescription {
  id: number;
  medicines: Medicine[];
  notes?: string;
  createdAt?: string;
  doctor?: {
    name?: string;
  };
  appointment?: {
    id?: number;
    appointmentDate?: string;
    timeSlot?: string;
  };
}

export interface Report {
  id: number;
  diagnosis: string;
  testRecommended?: string;
  remarks?: string;
  createdAt?: string;
  doctor?: {
    name?: string;
  };
  appointment?: {
    id?: number;
   appointmentDate?: string;
    timeSlot?: string;
  };
}

export interface AppointmentDetail extends Appointment {
  prescription?: Prescription;
  report?: Report;
}

export interface DoctorQueueItem {
  id: number;
  tokenNumber: number;
  status:string;
  patientName: string;
  patientId: number;
  appointmentId: number;
}

export interface LoginCredentials {
  email: string;
  password:string;
}

export interface CreateUserPayload {
  name:string;
  email: string;
  password: string;
  role: CreatableRole;
  phone?: string;
}

export interface CreateUserFormValues {
  name:string;
  email: string;
  password: string;
  role: CreatableRole;
  phone:string;
}

export interface BookAppointmentPayload {
  appointmentDate:string;
  timeSlot: string;
}

export interface AppointmentFormValues {
  appointmentDate: string;
  timeSlot: string;
}

export interface PrescriptionPayload {
  medicines: Medicine[];
  notes?: string;
}

export interface PrescriptionFormValues {
  appointmentId: string;
  notes:string;
  medicines: Medicine[];
}

export interface ReportPayload {
  diagnosis: string;
  testRecommended?: string;
  remarks?: string;
}

export interface ReportFormValues {
  appointmentId: string;
  diagnosis:string;
  testRecommended: string;
  remarks: string;
}
