"use client";

import { FormEvent,useEffect,useState } from "react";
import { isUnauthorizedError, getErrorMessage } from "@/services/api";
import {
  createClinicUser,
  fetchAdminClinic,
  fetchAdminUsers,
} from "@/services/clinic-service";
import { formatDateTime } from "@/utils/format";
import type {
  AuthSession,
  ClinicInfo,
  CreateUserFormValues,
  CreatableRole,
  UserSummary,
} from "@/utils/types";

interface AdminDashboardProps {
  onUnauthorized: () => void;
  session:AuthSession;
  setError: (message: string | null) => void;
  setNotice: (message: string | null) => void;
}

const initialForm: CreateUserFormValues ={
  name: "",
  email: "",
  password:"",
  phone: "",
  role: "doctor",
};

export function AdminDashboard({
  onUnauthorized,
  session,
  setError,
  setNotice,
}: AdminDashboardProps) {
  const [loading, setLoading] =useState(false);
  const [refreshKey, setRefreshKey]= useState(0);
  const [submitting, setSubmitting] =useState(false);
  const [clinicInfo, setClinicInfo]= useState<ClinicInfo | null>(null);
  const [users, setUsers] =useState<UserSummary[]>([]);
  const [formValues, setFormValues]= useState<CreateUserFormValues>(initialForm);

  useEffect(() => {
    let cancelled =false;

    const loadDashboard =async () => {
      setLoading(true);
      setError(null);

      try {
       const [clinicPayload, usersPayload]= await Promise.all([
          fetchAdminClinic(session.token),
          fetchAdminUsers(session.token),
        ]);

        if (cancelled) {
          return;
        }

       setClinicInfo(clinicPayload);
        setUsers(usersPayload);
      } catch (error) {
        if (cancelled) {
          return;
        }

        if (isUnauthorizedError(error)) {
          onUnauthorized();
         return;
        }

        setError(getErrorMessage(error, "Couldn't load admin dashboard data."));
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
   };

    void loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [onUnauthorized, refreshKey, session.token, setError]);

  const handleSubmit= async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setNotice(null);

    const name= formValues.name.trim();
    const email =formValues.email.trim();
    const password= formValues.password.trim();
   const phone =formValues.phone.trim();

    try {
      await createClinicUser(session.token, {
        name,
        email,
        password,
        role: formValues.role,
        ...(phone ? { phone } : {}),
     });

      setFormValues(initialForm);
      setNotice("User account created.");
      setRefreshKey((previous) => previous + 1);
    } catch (error) {
      if (isUnauthorizedError(error)) {
        onUnauthorized();
        return;
     }

      setError(getErrorMessage(error, "Couldn't create user account."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
   <>
      <div className="section-header">
        <div>
          <h2 className="section-title">Admin Dashboard</h2>
          <p className="meta-text">
            Review clinic activity and manage accounts for your clinic.
          </p>
        </div>

       <button
          className="button button-secondary"
          onClick={() => setRefreshKey((previous) => previous + 1)}
          type="button"
        >
          Refresh
        </button>
      </div>

     {loading ? (
        <p className="loading-text">Loading clinic overview...</p>
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <p className="stat-label">Clinic</p>
              <p className="stat-value">{clinicInfo?.name ?? "--"}</p>
            </div>
           <div className="stat-card">
              <p className="stat-label">Users</p>
              <p className="stat-value">{clinicInfo?.userCount ?? 0}</p>
            </div>
            <div className="stat-card">
              <p className="stat-label">Appointments</p>
              <p className="stat-value">{clinicInfo?.appointmentCount ?? 0}</p>
            </div>
            <div className="stat-card">
             <p className="stat-label">Queue</p>
              <p className="stat-value">{clinicInfo?.queueCount ?? 0}</p>
            </div>
          </div>

          <div className="split-grid">
            <div className="card-section">
              <h3 className="card-title">Create User</h3>
              <p className="card-subtitle">
               Add a doctor, receptionist, or patient to this clinic.
              </p>

              <form className="form-grid" onSubmit={handleSubmit}>
                <div className="field-group">
                  <label className="field-label" htmlFor="create-name">
                    Name
                  </label>
                  <input
                   id="create-name"
                    className="input-control"
                    value={formValues.name}
                    onChange={(event) =>
                      setFormValues((previous) => ({
                        ...previous,
                        name: event.target.value,
                      }))
                    }
                   minLength={3}
                    required
                  />
                </div>

                <div className="field-group">
                  <label className="field-label" htmlFor="create-email">
                    Email
                  </label>
                 <input
                    id="create-email"
                    className="input-control"
                    type="email"
                    value={formValues.email}
                    onChange={(event) =>
                      setFormValues((previous) => ({
                        ...previous,
                        email: event.target.value,
                     }))
                    }
                    required
                  />
                </div>

                <div className="field-group">
                  <label className="field-label" htmlFor="create-password">
                    Password
                 </label>
                  <input
                    id="create-password"
                    className="input-control"
                    type="password"
                    value={formValues.password}
                    onChange={(event) =>
                      setFormValues((previous) => ({
                        ...previous,
                       password: event.target.value,
                      }))
                    }
                    minLength={6}
                    required
                  />
                </div>

                <div className="field-group">
                 <label className="field-label" htmlFor="create-role">
                    Role
                  </label>
                  <select
                    id="create-role"
                    className="select-control"
                    value={formValues.role}
                    onChange={(event) =>
                      setFormValues((previous) => ({
                       ...previous,
                        role:event.target.value as CreatableRole,
                      }))
                    }
                  >
                    <option value="doctor">Doctor</option>
                    <option value="receptionist">Receptionist</option>
                    <option value="patient">Patient</option>
                  </select>
               </div>

                <div className="field-group">
                  <label className="field-label" htmlFor="create-phone">
                    Phone
                  </label>
                  <input
                    id="create-phone"
                    className="input-control"
                   value={formValues.phone}
                    onChange={(event) =>
                      setFormValues((previous) => ({
                        ...previous,
                        phone: event.target.value,
                      }))
                    }
                  />
                </div>

                <button className="button" type="submit" disabled={submitting}>
                  {submitting ? "Creating..." : "Create User"}
                </button>
              </form>
            </div>

            <div className="card-section">
              <h3 className="card-title">Clinic Users</h3>
             <p className="card-subtitle">
                This list includes only users from your clinic.
              </p>

              {users.length === 0 ? (
                <p className="empty-state">No users found.</p>
              ) : (
                <div className="table-wrap">
                  <table className="data-table">
                   <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Phone</th>
                        <th>Created</th>
                      </tr>
                    </thead>
                   <tbody>
                      {users.map((user) => (
                        <tr key={user.id}>
                          <td>{user.name}</td>
                          <td>{user.email}</td>
                          <td>{user.role}</td>
                          <td>{user.phone ?? "--"}</td>
                          <td>{formatDateTime(user.createdAt)}</td>
                        </tr>
                     ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      )}
   </>
  );
}
