"use client";

import { useState } from "react";
import { LoginPanel } from "@/components/auth/LoginPanel";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { DoctorDashboard } from "@/components/dashboard/DoctorDashboard";
import { PatientDashboard } from "@/components/dashboard/PatientDashboard";
import { ReceptionistDashboard } from "@/components/dashboard/ReceptionistDashboard";
import { AlertMessage } from "@/components/common/AlertMessage";
import { AppHeader } from "@/components/layout/AppHeader";
import { IdentitySidebar } from "@/components/layout/IdentitySidebar";
import { AuthProvider } from "@/context/AuthContext";
import { useAuth } from "@/hooks/useAuth";
import { useAutoClearMessage } from "@/hooks/useAutoClearMessage";
import { getErrorMessage } from "@/services/api";
import type { LoginCredentials } from "@/utils/types";

export function ClinicQueueApp() {
  return (
    <AuthProvider>
      <ClinicQueueScreen />
    </AuthProvider>
  );
}

function ClinicQueueScreen() {
  const { hydrated, login, loginLoading, logout, session }= useAuth();
  const [errMsg, setErrMsg] =useState<string | null>(null);
  const [okMsg, setOkMsg]= useState<string | null>(null);

  useAutoClearMessage(okMsg, setOkMsg);

  const handleLogin= async (credentials: LoginCredentials) => {
    setErrMsg(null);
    setOkMsg(null);

   try {
      const nextSession =await login(credentials.email, credentials.password);
      setOkMsg(`Welcome back, ${nextSession.user.name}.`);
    } catch (error) {
      setErrMsg(getErrorMessage(error, "We couldn't sign you in. Please try again."));
    }
  };

  const handleLogout= () => {
   logout();
    setErrMsg(null);
    setOkMsg("Logged out successfully.");
  };

  const handleUnauthorized= () => {
    logout();
    setOkMsg(null);
    setErrMsg("Your session has expired. Please sign in again.");
  };

  const roleNow= session?.user.role;

  return (
    <div className="app-root">
      <main className="page-wrap">
        <AppHeader onLogout={session ? handleLogout : undefined} role={roleNow} />

       {!hydrated ? (
          <section className="panel loading-panel">
            <p className="loading-text">Getting your dashboard ready...</p>
          </section>
        ) : null}

        {hydrated && !session ? (
          <LoginPanel
            error={errMsg}
           loading={loginLoading}
            notice={okMsg}
            onSubmit={handleLogin}
          />
        ) : null}

        {hydrated && session ? (
          <div className="dashboard-grid">
            <IdentitySidebar session={session} />

            <section className="panel content">
              <div className="section-stack">
                <AlertMessage kind="error" message={errMsg} />
                <AlertMessage kind="success" message={okMsg} />

                {roleNow === "admin" ? (
                  <AdminDashboard
                    onUnauthorized={handleUnauthorized}
                   session={session}
                    setError={setErrMsg}
                    setNotice={setOkMsg}
                  />
                ) : null}

                {roleNow === "patient" ? (
                  <PatientDashboard
                    onUnauthorized={handleUnauthorized}
                   session={session}
                    setError={setErrMsg}
                    setNotice={setOkMsg}
                  />
                ) : null}

                {roleNow === "receptionist" ? (
                  <ReceptionistDashboard
                    onUnauthorized={handleUnauthorized}
                   session={session}
                    setError={setErrMsg}
                    setNotice={setOkMsg}
                  />
                ) : null}

                {roleNow === "doctor" ? (
                  <DoctorDashboard
                    onUnauthorized={handleUnauthorized}
                   session={session}
                    setError={setErrMsg}
                    setNotice={setOkMsg}
                  />
                ) : null}
              </div>
            </section>
          </div>
        ) : null}
     </main>
    </div>
  );
}