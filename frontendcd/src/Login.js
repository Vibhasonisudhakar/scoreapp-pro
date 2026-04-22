import React, { useState } from "react";
import axios from "axios";

const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";
const authApi = `${apiBaseUrl.replace(/\/$/, "")}/api/auth`;

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await axios.post(
        `${authApi}/login`,
        {
          email,
          password,
        }
      );

      // SAVE TOKEN
      localStorage.setItem("token", res.data.token);

      alert("Login Success!");

      // redirect later to dashboard
      window.location.href = "/dashboard";
    } catch (err) {
      alert("Login Failed: " + err.response.data.message);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h2>ScoreApp Login</h2>

      <input
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />
      <br /><br />

      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <br /><br />

      <button onClick={handleLogin}>Login</button>
    </div>
  );
}

export default Login;