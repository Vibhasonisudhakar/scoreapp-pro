import React, { useEffect, useState } from "react";
import axios from "axios";

const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || "";
const authApi = `${apiBaseUrl.replace(/\/$/, "")}/api/auth`;

function Login({ onAuthSuccess }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const resetMessages = () => {
    setError("");
    setSuccess("");
  };

  const handleDemoLogin = async () => {
    resetMessages();
    setLoading(true);

    try {
      const response = await axios.post(`${authApi}/demo-login`);
      if (response.data?.token) {
        onAuthSuccess(response.data.token);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Unable to start demo session");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const modeParam = params.get("mode");
    const tokenParam = params.get("token");

    if (modeParam === "reset") {
      setMode("reset");
    }

    if (tokenParam) {
      setResetToken(tokenParam);
    }
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    resetMessages();

    if (mode === "forgot") {
      if (!email) {
        setError("Email is required.");
        return;
      }
    } else if (mode === "reset") {
      if (!resetToken || !newPassword) {
        setError("Reset token and new password are required.");
        return;
      }

      if (newPassword !== confirmNewPassword) {
        setError("New password confirmation does not match.");
        return;
      }
    } else if (!email || !password) {
      setError("Email and password are required.");
      return;
    } else if (mode === "register") {
      if (!name) {
        setError("Name is required for registration.");
        return;
      }

      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
    }

    setLoading(true);

    try {
      let endpoint = "login";
      let payload = { email, password };

      if (mode === "register") {
        endpoint = "register";
        payload = { name, email, password };
      } else if (mode === "forgot") {
        endpoint = "forgot-password";
        payload = { email };
      } else if (mode === "reset") {
        endpoint = "reset-password";
        payload = { token: resetToken, newPassword };
      }

      const response = await axios.post(`${authApi}/${endpoint}`, payload);

      if (mode === "forgot") {
        if (response.data?.resetToken) {
          setResetToken(response.data.resetToken);
          setSuccess("Reset token generated. Use it below to set a new password.");
        } else {
          setSuccess("If your email exists, reset instructions were sent.");
        }
        setMode("reset");
      } else if (mode === "reset") {
        setSuccess("Password changed successfully. Login with your new password.");
        setMode("login");
      } else if (response.data?.token) {
        onAuthSuccess(response.data.token);
      } else {
        setSuccess("Account created. Please login.");
        setMode("login");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-shell">
      <div className="auth-split-image">
        <h2>ScoreApp</h2>
        <p>A better way to generate leads, gather data, and score your audience.</p>
      </div>
      <div className="auth-form-container">
        <section className="auth-panel">
          <h1>
            {mode === "login"
              ? "Welcome back"
              : mode === "register"
              ? "Create an account"
              : mode === "forgot"
              ? "Forgot your password?"
              : "Reset your password"}
          </h1>
          <p className="subtext">
            Sign in to run SA Excellency scoring, generate reports, and share outcomes.
          </p>

          <button className="btn ghost auth-submit" disabled={loading} onClick={handleDemoLogin} type="button">
            Try Demo Instantly
          </button>

          <div className="auth-mode-switch" role="tablist" aria-label="Authentication mode">
            <button
              type="button"
              className={mode === "login" ? "active" : ""}
              onClick={() => {
                setMode("login");
                resetMessages();
              }}
            >
              Login
            </button>
            <button
              type="button"
              className={mode === "register" ? "active" : ""}
              onClick={() => {
                setMode("register");
                resetMessages();
              }}
            >
              Register
            </button>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {mode === "register" && (
              <label className="field-label">
                Full Name
                <input
                  className="text-input"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Enter your full name"
                />
              </label>
            )}

            {(mode === "login" || mode === "register" || mode === "forgot") && (
              <label className="field-label">
                Email
                <input
                  className="text-input"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@company.com"
                />
              </label>
            )}

            {(mode === "login" || mode === "register") && (
              <label className="field-label">
                Password
                <input
                  className="text-input"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter password"
                />
              </label>
            )}

            {mode === "register" && (
              <label className="field-label">
                Confirm Password
                <input
                  className="text-input"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Re-enter password"
                />
              </label>
            )}

            {mode === "reset" && (
              <>
                <label className="field-label">
                  Reset Token
                  <input
                    className="text-input"
                    type="text"
                    value={resetToken}
                    onChange={(event) => setResetToken(event.target.value)}
                    placeholder="Paste reset token"
                  />
                </label>
                <label className="field-label">
                  New Password
                  <input
                    className="text-input"
                    type="password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    placeholder="Enter new password"
                  />
                </label>
                <label className="field-label">
                  Confirm New Password
                  <input
                    className="text-input"
                    type="password"
                    value={confirmNewPassword}
                    onChange={(event) => setConfirmNewPassword(event.target.value)}
                    placeholder="Confirm new password"
                  />
                </label>
              </>
            )}

            {error && <div className="error-banner">{error}</div>}
            {success && <div className="success-banner">{success}</div>}

            {mode === "login" && (
              <button
                className="link-btn"
                type="button"
                onClick={() => {
                  setMode("forgot");
                  resetMessages();
                }}
              >
                Forgot password?
              </button>
            )}

            {(mode === "forgot" || mode === "reset") && (
              <button
                className="link-btn"
                type="button"
                onClick={() => {
                  setMode("login");
                  resetMessages();
                }}
              >
                Back to login
              </button>
            )}

            <button className="btn primary auth-submit" disabled={loading} type="submit">
              {loading
                ? "Please wait..."
                : mode === "login"
                ? "Login to ScoreApp"
                : mode === "register"
                ? "Create account"
                : mode === "forgot"
                  ? "Send reset instructions"
                : "Reset password"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}

export default Login;