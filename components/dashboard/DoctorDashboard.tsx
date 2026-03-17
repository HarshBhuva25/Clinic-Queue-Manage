"use client";

import { FormEvent,useEffect,useState } from "react";
import { StatusBadge } from "@/components/common/StatusBadge";
import { getErrorMessage,isUnauthorizedError } from "@/services/api";
import {
  createPrescription,
  createReport,
  fetchDoctorQueue,
} from "@/services/clinic-service";
import { toDisplayStatus } from "@/utils/format";
import type {
  AuthSession,
  DoctorQueueItem,
  Medicine,
  PrescriptionFormValues,
  ReportFormValues,
} from "@/utils/types";

interface DoctorDashboardProps {
  onUnauthorized:() => void;
  session: AuthSession;
  setError: (message: string | null) => void;
  setNotice: (message: string | null) => void;
}

const initialPrescriptionForm: PrescriptionFormValues= {
  appointmentId: "",
  notes:"",
  medicines: [{ name: "", dosage: "", duration: "" }],
};

const initialReportForm: ReportFormValues= {
  appointmentId: "",
  diagnosis: "",
  testRecommended: "",
  remarks:"",
};

export function DoctorDashboard({
  onUnauthorized,
  session,
  setError,
  setNotice,
}: DoctorDashboardProps) {
  const [loading, setLoading] =useState(false);
  const [refreshKey, setRefreshKey]= useState(0);
  const [prescriptionSubmitting, setPrescriptionSubmitting] =useState(false);
  const [reportSubmitting, setReportSubmitting]= useState(false);
  const [doctorQueue, setDoctorQueue] =useState<DoctorQueueItem[]>([]);
  const [prescriptionForm, setPrescriptionForm] =
    useState<PrescriptionFormValues>(initialPrescriptionForm);
  const [reportForm, setReportForm]= useState<ReportFormValues>(initialReportForm);

  useEffect(() => {
    let cancelled =false;

    const loadDoctorQueue =async () => {
      setLoading(true);
      setError(null);

      try {
        const payload= await fetchDoctorQueue(session.token);

        if (cancelled) {
          return;
        }

        setDoctorQueue(payload);
      } catch (error) {
        if (cancelled) {
          return;
       }

        if (isUnauthorizedError(error)) {
          onUnauthorized();
          return;
        }

        setError(getErrorMessage(error, "Couldn't load today's doctor queue."));
      } finally {
       if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadDoctorQueue();

    return () => {
     cancelled = true;
    };
  }, [onUnauthorized, refreshKey, session.token, setError]);

  const apptList= doctorQueue.reduce<
    Array<{ appointmentId: number; label: string }>
  >((options, item) => {
    const exists =options.some(
      (option) => option.appointmentId === item.appointmentId,
   );

    if (!exists) {
      options.push({
        appointmentId: item.appointmentId,
        label:`Token ${item.tokenNumber} - ${item.patientName} (${toDisplayStatus(item.status)})`,
      });
    }

   return options;
  }, []);

  const updateMedicine =(
    medicineIndex:number,
    key: keyof Medicine,
    value: string,
  ) => {
    setPrescriptionForm((previous) => {
     const nextMedicines =[...previous.medicines];
      nextMedicines[medicineIndex] = {
        ...nextMedicines[medicineIndex],
        [key]: value,
      };

      return {
        ...previous,
        medicines: nextMedicines,
     };
    });
  };

  const addMedicineRow= () => {
    setPrescriptionForm((previous) => ({
      ...previous,
      medicines: [
        ...previous.medicines,
       { name: "", dosage: "", duration: "" },
      ],
    }));
  };

  const removeMedicineRow= (index: number) => {
    setPrescriptionForm((previous) => {
      const nextMedicines= previous.medicines.filter((_, itemIndex) => itemIndex !== index);

     return {
        ...previous,
        medicines:
          nextMedicines.length > 0
            ? nextMedicines
            : [{ name: "", dosage: "", duration: "" }],
      };
    });
  };

  const selectAppointment= (appointmentId: number) => {
    const selectedValue =String(appointmentId);

    setPrescriptionForm((previous) => ({
      ...previous,
      appointmentId: selectedValue,
    }));

   setReportForm((previous) => ({
      ...previous,
      appointmentId:selectedValue,
    }));
  };

  const handlePrescriptionSubmit= async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

   const appointmentId =Number(prescriptionForm.appointmentId);
    const medicines= prescriptionForm.medicines
      .map((medicine) => ({
        name: medicine.name.trim(),
        dosage: medicine.dosage.trim(),
        duration:medicine.duration.trim(),
      }))
      .filter(
        (medicine) => medicine.name && medicine.dosage && medicine.duration,
     );

    if (!appointmentId || medicines.length === 0) {
      setError(
        "Select an appointment and provide at least one complete medicine row.",
      );
      return;
    }

   setPrescriptionSubmitting(true);
    setError(null);
    setNotice(null);

    try {
      await createPrescription(session.token, appointmentId, {
        medicines,
        notes:prescriptionForm.notes.trim(),
      });

      setNotice("Prescription saved successfully.");
      setPrescriptionForm((previous) => ({
        ...previous,
        notes: "",
        medicines: [{ name: "", dosage: "", duration: "" }],
      }));
      setRefreshKey((previous) => previous + 1);
    } catch (error) {
     if (isUnauthorizedError(error)) {
        onUnauthorized();
        return;
      }

      setError(getErrorMessage(error, "Unable to save prescription."));
    } finally {
      setPrescriptionSubmitting(false);
    }
  };

  const handleReportSubmit= async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const appointmentId =Number(reportForm.appointmentId);
    if (!appointmentId || !reportForm.diagnosis.trim()) {
      setError("Select an appointment and enter a diagnosis.");
      return;
   }

    setReportSubmitting(true);
    setError(null);
    setNotice(null);

    try {
      await createReport(session.token, appointmentId, {
        diagnosis: reportForm.diagnosis.trim(),
       remarks: reportForm.remarks.trim(),
        testRecommended: reportForm.testRecommended.trim(),
      });

      setNotice("Report saved successfully.");
      setReportForm((previous) => ({
        ...previous,
        diagnosis: "",
        remarks: "",
       testRecommended: "",
      }));
      setRefreshKey((previous) => previous + 1);
    } catch (error) {
      if (isUnauthorizedError(error)) {
        onUnauthorized();
        return;
      }

     setError(getErrorMessage(error, "Unable to save report."));
    } finally {
      setReportSubmitting(false);
    }
  };

  return (
    <>
      <div className="section-header">
       <div>
          <h2 className="section-title">Doctor Dashboard</h2>
          <p className="meta-text">
            Review today&apos;s queue and record prescriptions or reports.
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

      <div className="card-section">
        <h3 className="card-title">Today&apos;s Queue</h3>

        {loading ? (
          <p className="loading-text">Loading today&apos;s queue...</p>
        ) : doctorQueue.length === 0 ? (
          <p className="empty-state">No queue entries found for today.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
               <tr>
                  <th>Token</th>
                  <th>Patient</th>
                  <th>Status</th>
                  <th>Appointment ID</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
               {doctorQueue.map((item) => (
                  <tr key={item.id}>
                    <td>{item.tokenNumber}</td>
                    <td>{item.patientName}</td>
                    <td>
                      <StatusBadge status={item.status} />
                    </td>
                    <td>{item.appointmentId}</td>
                    <td>
                     <button
                        className="button button-ghost compact-button"
                        onClick={() => selectAppointment(item.appointmentId)}
                        type="button"
                      >
                        Select Appointment
                      </button>
                    </td>
                  </tr>
               ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="split-grid">
        <div className="card-section">
         <h3 className="card-title">Add Prescription</h3>

          <form className="form-grid" onSubmit={handlePrescriptionSubmit}>
            <div className="field-group">
              <label className="field-label" htmlFor="prescription-appointment">
                Appointment
              </label>
              <select
                id="prescription-appointment"
               className="select-control"
                value={prescriptionForm.appointmentId}
                onChange={(event) =>
                  setPrescriptionForm((previous) => ({
                    ...previous,
                    appointmentId: event.target.value,
                  }))
                }
                required
             >
                <option value="">Choose an appointment</option>
                {apptList.map((option) => (
                  <option
                    key={`prescription-${option.appointmentId}`}
                    value={option.appointmentId}
                  >
                    {option.label}
                  </option>
               ))}
              </select>
            </div>

            {prescriptionForm.medicines.map((medicine, index) => (
              <div className="sub-card" key={`medicine-row-${index}`}>
                <h4 className="sub-card-title">Medicine {index + 1}</h4>

                <div className="field-group">
                 <label className="field-label" htmlFor={`medicine-name-${index}`}>
                    Name
                  </label>
                  <input
                    id={`medicine-name-${index}`}
                    className="input-control"
                    value={medicine.name}
                    onChange={(event) =>
                      updateMedicine(index, "name", event.target.value)
                   }
                  />
                </div>

                <div className="field-group">
                  <label className="field-label" htmlFor={`medicine-dosage-${index}`}>
                    Dosage
                  </label>
                  <input
                   id={`medicine-dosage-${index}`}
                    className="input-control"
                    value={medicine.dosage}
                    onChange={(event) =>
                      updateMedicine(index, "dosage", event.target.value)
                    }
                  />
                </div>

               <div className="field-group">
                  <label className="field-label" htmlFor={`medicine-duration-${index}`}>
                    Duration
                  </label>
                  <input
                    id={`medicine-duration-${index}`}
                    className="input-control"
                    value={medicine.duration}
                    onChange={(event) =>
                     updateMedicine(index, "duration", event.target.value)
                    }
                  />
                </div>

                <button
                  className="button button-ghost compact-button"
                  onClick={() => removeMedicineRow(index)}
                  type="button"
               >
                  Remove
                </button>
              </div>
            ))}

            <div className="inline-actions">
              <button
                className="button button-ghost compact-button"
               onClick={addMedicineRow}
                type="button"
              >
                Add Medicine
              </button>
            </div>

            <div className="field-group">
              <label className="field-label" htmlFor="prescription-notes">
               Notes
              </label>
              <textarea
                id="prescription-notes"
                className="text-area-control"
                value={prescriptionForm.notes}
                onChange={(event) =>
                  setPrescriptionForm((previous) => ({
                    ...previous,
                   notes:event.target.value,
                  }))
                }
              />
            </div>

            <button className="button" disabled={prescriptionSubmitting} type="submit">
              {prescriptionSubmitting ? "Saving..." : "Save Prescription"}
            </button>
         </form>
        </div>

        <div className="card-section">
          <h3 className="card-title">Add Report</h3>

          <form className="form-grid" onSubmit={handleReportSubmit}>
            <div className="field-group">
              <label className="field-label" htmlFor="report-appointment">
               Appointment
              </label>
              <select
                id="report-appointment"
                className="select-control"
                value={reportForm.appointmentId}
                onChange={(event) =>
                  setReportForm((previous) => ({
                    ...previous,
                   appointmentId: event.target.value,
                  }))
                }
                required
              >
                <option value="">Choose an appointment</option>
                {apptList.map((option) => (
                  <option key={`report-${option.appointmentId}`} value={option.appointmentId}>
                    {option.label}
                 </option>
                ))}
              </select>
            </div>

            <div className="field-group">
              <label className="field-label" htmlFor="report-diagnosis">
                Diagnosis
              </label>
             <input
                id="report-diagnosis"
                className="input-control"
                value={reportForm.diagnosis}
                onChange={(event) =>
                  setReportForm((previous) => ({
                    ...previous,
                    diagnosis:event.target.value,
                  }))
               }
                required
              />
            </div>

            <div className="field-group">
              <label className="field-label" htmlFor="report-test">
                Test Recommended
              </label>
             <input
                id="report-test"
                className="input-control"
                value={reportForm.testRecommended}
                onChange={(event) =>
                  setReportForm((previous) => ({
                    ...previous,
                    testRecommended: event.target.value,
                  }))
               }
              />
            </div>

            <div className="field-group">
              <label className="field-label" htmlFor="report-remarks">
                Remarks
              </label>
              <textarea
               id="report-remarks"
                className="text-area-control"
                value={reportForm.remarks}
                onChange={(event) =>
                  setReportForm((previous) => ({
                    ...previous,
                    remarks: event.target.value,
                  }))
                }
             />
            </div>

            <button className="button" disabled={reportSubmitting} type="submit">
              {reportSubmitting ? "Saving..." : "Save Report"}
            </button>
          </form>
        </div>
      </div>
   </>
  );
}
