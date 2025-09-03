// src/components/SignInForm/SignInForm.jsx
import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { signIn } from "../../services/authService";
import { UserContext } from "../../contexts/UserContext";
import "../../AuthForm.css";


export default function SignInForm() {
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);

  const [formData, setFormData] = useState({ username: "", password: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setMessage("");
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const signedInUser = await signIn(formData);
      setUser(signedInUser);
      navigate("/");
    } catch (err) {
      setMessage(err.message || "Sign in failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <h1>Sign In</h1>

        {message && (
          <p
            role="alert"
            aria-live="assertive"
            style={{ color: "crimson", marginBottom: "0.75rem" }}
          >
            {message}
          </p>
        )}

        <form className="auth-form" autoComplete="off" onSubmit={handleSubmit}>
          <label htmlFor="username">
            Username
            <input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              autoComplete="username"
              required
            />
          </label>

          <label htmlFor="password">
            Password
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
            />
          </label>

          <div className="auth-buttons">
            <button className="btn" type="submit" disabled={loading}>
              {loading ? "Signing in…" : "Sign In"}
            </button>
            <button
              className="btn btn-outline"
              type="button"
              onClick={() => navigate("/")}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
