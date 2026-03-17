"use client";

import { FormEvent,useEffect,useState } from "react";
import { StatusBadge } from "@/components/common/StatusBadge";
import { isUnauthorizedError,getErrorMessage } from "@/services/api";
import {
  bookAppointment,
  fetchAppointmentDetail,
  fetchMyAppointments,
  fetchMyPrescriptions,
  fetchMyReports,
} from "@/services/clinic-service";
import { TIME_SLOTS } from "@/utils/constants";
import { formatDate, getTodayInputValue } from "@/utils/format";
import type {
  Appointment,
  AppointmentDetail,
  AppointmentFormValues,
  AuthSession,
  Prescription,
  Report,
} from "@/utils/types";

interface PatientDashboardProps {
  onUnauthorized:() => void;
  session: AuthSession;
  setError: (message: string | null) => void;
  setNotice: (message: string | null) => void;
}

export function PatientDashboard({
  onUnauthorized,
  session,
  setError,
  setNotice,
}: PatientDashboardProps) {
  const [loading, setLoading]= useState(false);
  const [busyDtl, setBusyDtl] =useState(false);
  const [bookingLoading, setBookingLoading]= useState(false);
  const [refreshKey, setRefreshKey] =useState(0);
  const [appointments, setAppointments]= useState<Appointment[]>([]);
  const [appointmentDetail, setAppointmentDetail] =
    useState<AppointmentDetail | null>(null);
  const [prescriptions, setPrescriptions] =useState<Prescription[]>([]);
  const [reports, setReports]= useState<Report[]>([]);
  const [formValues, setFormValues] =useState<AppointmentFormValues>({
    appointmentDate: getTodayInputValue(),
    timeSlot: TIME_SLOTS[4],
  });

  useEffect(() => {
    let cancelled =false;

    const loadPatientData =async () => {
     setLoading(true);
      setError(null);

      try {
        const [appointmentsPayload, prescriptionsPayload, reportsPayload] =
          await Promise.all([
            fetchMyAppointments(session.token),
            fetchMyPrescriptions(session.token),
            fetchMyReports(session.token),
         ]);

        if (cancelled) {
          return;
        }

        setAppointments(appointmentsPayload);
        setPrescriptions(prescriptionsPayload);
        setReports(reportsPayload);
     } catch (error) {
        if (cancelled) {
          return;
        }

        if (isUnauthorizedError(error)) {
          onUnauthorized();
          return;
        }

        setError(getErrorMessage(error, "Couldn't load your patient data."));
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

   void loadPatientData();

    return () => {
      cancelled = true;
    };
  }, [onUnauthorized, refreshKey, session.token, setError]);

  const handleBookAppointment =async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
   setBookingLoading(true);
    setError(null);
    setNotice(null);

    try {
      await bookAppointment(session.token, formValues);
      setAppointmentDetail(null);
      setNotice("Appointment booked successfully.");
      setRefreshKey((previous) => previous + 1);
   } catch (error) {
      if (isUnauthorizedError(error)) {
        onUnauthorized();
        return;
      }

      setError(getErrorMessage(error, "Couldn't book your appointment."));
    } finally {
      setBookingLoading(false);
   }
  };

  const handleLoadDetail= async (appointmentId: number) => {
    setBusyDtl(true);
    setError(null);

    try {
      const detail =await fetchAppointmentDetail(session.token, appointmentId);
     setAppointmentDetail(detail);
    } catch (error) {
      if (isUnauthorizedError(error)) {
        onUnauthorized();
        return;
      }

      setError(getErrorMessage(error, "Couldn't load appointment details."));
    } finally {
     setBusyDtl(false);
    }
  };

  return (
    <>
      <div className="section-header">
        <div>
          <h2 className="section-title">Patient Dashboard</h2>
         <p className="meta-text">
            Book appointments and track your queue progress in one place.
          </p>
        </div>

        <button
          className="button button-secondary"
          type="button"
          onClick={() => setRefreshKey((previous) => previous + 1)}
       >
          Refresh
        </button>
      </div>

      {loading ? (
        <p className="loading-text">Loading your dashboard...</p>
      ) : (
        <>
         <div className="split-grid">
            <div className="card-section">
              <h3 className="card-title">Book Appointment</h3>
              <form className="form-grid" onSubmit={handleBookAppointment}>
                <div className="field-group">
                  <label className="field-label" htmlFor="appointment-date">
                    Appointment Date
                  </label>
                  <input
                   id="appointment-date"
                    className="input-control"
                    type="date"
                    min={getTodayInputValue()}
                    value={formValues.appointmentDate}
                    onChange={(event) =>
                      setFormValues((previous) => ({
                        ...previous,
                        appointmentDate: event.target.value,
                     }))
                    }
                    required
                  />
                </div>

                <div className="field-group">
                  <label className="field-label" htmlFor="appointment-slot">
                    Time Slot
                 </label>
                  <select
                    id="appointment-slot"
                    className="select-control"
                    value={formValues.timeSlot}
                    onChange={(event) =>
                      setFormValues((previous) => ({
                        ...previous,
                        timeSlot: event.target.value,
                     }))
                    }
                  >
                    {TIME_SLOTS.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
               </div>

                <button className="button" type="submit" disabled={bookingLoading}>
                  {bookingLoading ? "Booking..." : "Book Appointment"}
                </button>
              </form>
            </div>

            <div className="card-section">
             <h3 className="card-title">My Appointments</h3>

              {appointments.length === 0 ? (
                <p className="empty-state">No appointments found.</p>
              ) : (
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                       <th>Date</th>
                        <th>Slot</th>
                        <th>Token</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.map((appointment) => (
                       <tr key={appointment.id}>
                          <td>{formatDate(appointment.appointmentDate)}</td>
                          <td>{appointment.timeSlot}</td>
                          <td>{appointment.queueEntry?.tokenNumber ?? "--"}</td>
                          <td>
                            <StatusBadge status={appointment.queueEntry?.status} />
                          </td>
                          <td>
                            <button
                             className="button button-ghost"
                              onClick={() => handleLoadDetail(appointment.id)}
                              type="button"
                            >
                              Details
                            </button>
                          </td>
                        </tr>
                      ))}
                   </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          <div className="card-section">
            <h3 className="card-title">Appointment Detail</h3>

            {busyDtl ? (
              <p className="loading-text">Loading appointment details...</p>
            ) : appointmentDetail ? (
              <div className="split-grid">
                <div>
                  <p className="meta-text">Appointment ID: {appointmentDetail.id}</p>
                  <p className="meta-text">
                    Date: {formatDate(appointmentDetail.appointmentDate)}
                 </p>
                  <p className="meta-text">Time Slot: {appointmentDetail.timeSlot}</p>
                  <p className="meta-text">
                    Queue Token: {appointmentDetail.queueEntry?.tokenNumber ?? "--"}
                  </p>
                </div>

                <div>
                  <p className="meta-text">
                   Prescription: {appointmentDetail.prescription ? "Available" : "Pending"}
                  </p>
                  <p className="meta-text">
                    Report: {appointmentDetail.report ? "Available" : "Pending"}
                  </p>

                  {appointmentDetail.prescription?.medicines?.length ? (
                    <ul className="rights-list">
                      {appointmentDetail.prescription.medicines.map((medicine, index) => (
                       <li key={`${medicine.name}-${index}`}>
                          {medicine.name} - {medicine.dosage} - {medicine.duration}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </div>
            ) : (
             <p className="empty-state">
                Choose an appointment to view prescription and report details.
              </p>
            )}
          </div>

          <div className="split-grid">
            <div className="card-section">
              <h3 className="card-title">My Prescriptions</h3>

              {prescriptions.length === 0 ? (
                <p className="empty-state">No prescriptions found.</p>
              ) : (
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Doctor</th>
                       <th>Appointment</th>
                        <th>Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {prescriptions.map((prescription) => (
                        <tr key={prescription.id}>
                          <td>{prescription.doctor?.name ?? "--"}</td>
                          <td>{formatDate(prescription.appointment?.appointmentDate)}</td>
                         <td>{prescription.notes ?? "--"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

           <div className="card-section">
              <h3 className="card-title">My Reports</h3>

              {reports.length === 0 ? (
                <p className="empty-state">No reports found.</p>
              ) : (
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                     <tr>
                        <th>Doctor</th>
                        <th>Diagnosis</th>
                        <th>Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reports.map((report) => (
                        <tr key={report.id}>
                         <td>{report.doctor?.name ?? "--"}</td>
                          <td>{report.diagnosis}</td>
                          <td>{report.remarks ?? "--"}</td>
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
