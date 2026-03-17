"use client";

import { useEffect,useState } from "react";
import { StatusBadge } from "@/components/common/StatusBadge";
import { QUEUE_ACTION_LABEL } from "@/utils/constants";
import { getTodayInputValue, queueActions } from "@/utils/format";
import { getErrorMessage,isUnauthorizedError } from "@/services/api";
import { fetchQueueByDate, updateQueueStatus } from "@/services/clinic-service";
import type { AuthSession, QueueEntry, QueueTransitionStatus } from "@/utils/types";

interface ReceptionistDashboardProps {
  onUnauthorized: () => void;
  session:AuthSession;
  setError: (message: string | null) => void;
  setNotice: (message: string | null) => void;
}

export function ReceptionistDashboard({
  onUnauthorized,
  session,
  setError,
  setNotice,
}: ReceptionistDashboardProps) {
  const [queueDate, setQueueDate] =useState(getTodayInputValue());
  const [loading, setLoading]= useState(false);
  const [tempVal, setTempVal] =useState<number | null>(null);
  const [val2, setVal2]= useState(0);
  const [queueEntries, setQueueEntries] =useState<QueueEntry[]>([]);

  useEffect(() => {
    let cancelled= false;

    const loadQueue= async () => {
      setLoading(true);
      setError(null);

     try {
        const payload =await fetchQueueByDate(session.token, queueDate);

        if (cancelled) {
          return;
        }

        setQueueEntries(payload);
      } catch (error) {
       if (cancelled) {
          return;
        }

        if (isUnauthorizedError(error)) {
          onUnauthorized();
          return;
        }

       setError(getErrorMessage(error, "Unable to load queue entries."));
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadQueue();

    return () => {
      cancelled = true;
    };
  }, [onUnauthorized, queueDate, val2, session.token, setError]);

  const handleQueueUpdate =async (
    queueId: number,
    nextStatus: QueueTransitionStatus,
  ) => {
    setTempVal(queueId);
    setError(null);
    setNotice(null);

    try {
      await updateQueueStatus(session.token, queueId, nextStatus);
      setNotice(`Queue entry ${queueId} moved to ${nextStatus.replace("-", " ")}.`);
      setVal2((previous) => previous + 1);
   } catch (error) {
      if (isUnauthorizedError(error)) {
        onUnauthorized();
        return;
      }

      setError(getErrorMessage(error, "Unable to update queue entry."));
    } finally {
      setTempVal(null);
   }
  };

  return (
    <>
      <div className="section-header">
        <div>
          <h2 className="section-title">Reception Queue Board</h2>
          <p className="meta-text">
           Pick a date and move patients through valid queue transitions.
          </p>
        </div>

        <div className="inline-actions inline-date-actions">
          <input
            className="input-control date-input"
            aria-label="Queue date"
            type="date"
            value={queueDate}
           onChange={(event) => setQueueDate(event.target.value)}
          />
          <button
            className="button button-secondary"
            type="button"
            onClick={() => setVal2((previous) => previous + 1)}
          >
            Refresh
          </button>
       </div>
      </div>

      <div className="card-section">
        <h3 className="card-title">Daily Queue</h3>

        {loading ? (
          <p className="loading-text">Loading queue entries...</p>
        ) : queueEntries.length === 0 ? (
         <p className="empty-state">No queue entries found for this date.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Token</th>
                  <th>Patient</th>
                  <th>Phone</th>
                 <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {queueEntries.map((entry) => {
                  const actions =queueActions(entry.status);

                  return (
                   <tr key={entry.id}>
                      <td>{entry.tokenNumber}</td>
                      <td>{entry.appointment?.patient?.name ?? "--"}</td>
                      <td>{entry.appointment?.patient?.phone ?? "--"}</td>
                      <td>
                        <StatusBadge status={entry.status} />
                      </td>
                      <td>
                        <div className="inline-actions">
                         {actions.length === 0 ? (
                            <span className="meta-text">No actions</span>
                          ) : (
                            actions.map((action) => (
                              <button
                                key={`${entry.id}-${action}`}
                                className="button button-ghost compact-button"
                                disabled={tempVal === entry.id}
                                onClick={() => handleQueueUpdate(entry.id, action)}
                               type="button"
                              >
                                {QUEUE_ACTION_LABEL[action]}
                              </button>
                            ))
                          )}
                        </div>
                      </td>
                    </tr>
                 );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
