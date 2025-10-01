import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import "../index.css";

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Password validation rules
  const validations = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Check all conditions
    if (!Object.values(validations).every(Boolean)) {
      setError("Password does not meet all requirements.");
      return;
    }

    setBusy(true);
    try {
      await signup(name.trim(), email.trim(), password);
      navigate("/app/dashboard");
    } catch (err: any) {
      setError(err.message || "Signup failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="circles">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>
      <div className="auth-card">
        <h1>Create Account</h1>
        <p>Sign up to get started</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="auth-input"
          />
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="auth-input"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="auth-input"
          />

          {/* Password validation checklist */}
          <div className="password-rules">
            <p>Password must contain:</p>
            <ul>
              <li className={validations.length ? "valid" : ""}>
                At least 8 characters
              </li>
              <li className={validations.upper ? "valid" : ""}>
                One uppercase letter
              </li>
              <li className={validations.lower ? "valid" : ""}>
                One lowercase letter
              </li>
              <li className={validations.number ? "valid" : ""}>One number</li>
              <li className={validations.special ? "valid" : ""}>
                One special character
              </li>
            </ul>
          </div>

          <button type="submit" disabled={busy} className="auth-btn">
            {busy ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Log in</Link>
        </div>
      </div>
    </div>
  );
}
