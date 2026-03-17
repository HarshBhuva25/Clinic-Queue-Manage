"use client";

import { FormEvent,useState } from "react";
import { AlertMessage } from "@/components/common/AlertMessage";

interface LoginPanelProps {
  error: string | null;
  loading: boolean;
  notice:string | null;
  onSubmit: (credentials: { email: string; password: string }) => Promise<void>;
}

export function LoginPanel({
  error,
  loading,
  notice,
  onSubmit,
}: LoginPanelProps) {
  const [user_data, setUserData]= useState("enrollment@darshan.ac.in");
  const [pwdVal, setPwdVal] =useState("password123");

  const handleSubmit =async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit({ email: user_data, password: pwdVal });
  };

  return (
   <section className="panel login-panel">
      <div className="section-stack">
        <div>
          <h2 className="section-title">Sign In</h2>
          <p className="meta-text">
            Use your assigned clinic credentials. The sample credentials are prefilled for quick testing.
          </p>
        </div>

       <AlertMessage kind="error" message={error} />
        <AlertMessage kind="success" message={notice} />

        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="field-group">
            <label className="field-label" htmlFor="login-email">
              Email
            </label>
            <input
             id="login-email"
              className="input-control"
              type="email"
              value={user_data}
              onChange={(event) => setUserData(event.target.value)}
              required
            />
          </div>

         <div className="field-group">
            <label className="field-label" htmlFor="login-password">
              Password
            </label>
            <input
              id="login-password"
              className="input-control"
              type="password"
              value={pwdVal}
             onChange={(event) => setPwdVal(event.target.value)}
              required
            />
          </div>

          <button className="button" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
     </div>
    </section>
  );
}
