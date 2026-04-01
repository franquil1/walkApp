import { useState } from "react";
import api from "../axiosConfig";
import "./RecuperarContrasena.css";

const STEPS = ["Correo", "Verificación", "Nueva clave"];

function getPasswordStrength(password) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  const labels = ["", "Débil", "Regular", "Buena", "Fuerte"];
  const colors = ["", "#c0392b", "#e67e22", "#f1c40f", "#27ae60"];
  return { score, label: labels[score] || "", color: colors[score] || "", width: `${score * 25}%` };
}

export default function RecuperarContrasena() {
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const strength = getPasswordStrength(newPassword);

  const handleStep0 = async () => {
    setError("");
    if (!email) return;
    setLoading(true);
    try {
      await api.post("/api/auth/password-reset/", { email });
      setStep(1);
    } catch (err) {
      setError(err.response?.data?.error || "No encontramos una cuenta con ese correo.");
    } finally {
      setLoading(false);
    }
  };

  const handleStep1 = async () => {
    setError("");
    if (code.length < 6) { setError("El código debe tener 6 dígitos."); return; }
    setLoading(true);
    try {
      await api.post("/api/auth/password-reset/verify/", { email, code });
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || "Código inválido o expirado. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleStep2 = async () => {
    setError("");
    if (newPassword.length < 8) { setError("La contraseña debe tener al menos 8 caracteres."); return; }
    if (newPassword !== confirmPassword) { setError("Las contraseñas no coinciden."); return; }
    if (strength.score < 2) { setError("Elige una contraseña más segura."); return; }
    setLoading(true);
    try {
      await api.post("/api/auth/password-reset/confirm/", { email, new_password: newPassword });
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.error || "Ocurrió un error. Por favor intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="recovery-root">
      <div className="recovery-card">
        <div className="recovery-header">
          <div className="recovery-logo">🥾</div>
          <h1>Walk App</h1>
          <p>Recupera el acceso a tu cuenta de caminante</p>
        </div>

        <div className="recovery-steps">
          {STEPS.map((label, i) => (
            <div
              key={i}
              className={`recovery-step ${i === step ? "active" : ""} ${i < step || done ? "done" : ""}`}
            >
              <div className="step-circle">{i < step || done ? "✓" : i + 1}</div>
              <div className="step-label">{label}</div>
            </div>
          ))}
        </div>

        <div className="recovery-body">
          {done ? (
            <div className="recovery-success">
              <div className="recovery-success-icon">🌿</div>
              <h2>¡Contraseña actualizada!</h2>
              <p>
                Tu contraseña ha sido cambiada exitosamente. Ya puedes iniciar sesión con tus
                nuevas credenciales.
              </p>
              <a href="/login" className="recovery-btn recovery-btn--link">
                Ir al inicio de sesión →
              </a>
            </div>

          ) : step === 0 ? (
            <>
              <div className="recovery-hint">
                📧 Ingresa el correo registrado en tu cuenta Walk App y te enviaremos un código de verificación.
              </div>
              <div className="recovery-form-group">
                <label htmlFor="rec-email">Correo electrónico</label>
                <input
                  id="rec-email"
                  type="email"
                  placeholder="tu@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={error ? "input-error" : ""}
                  onKeyDown={(e) => e.key === "Enter" && email && handleStep0()}
                />
                {error && <span className="error-msg">⚠️ {error}</span>}
              </div>
              <button className="recovery-btn" onClick={handleStep0} disabled={!email || loading}>
                {loading ? "Enviando..." : "Enviar código →"}
              </button>
              <a href="/login" className="recovery-link">← Volver al inicio de sesión</a>
            </>

          ) : step === 1 ? (
            <>
              <div className="recovery-hint">
                📬 Revisa tu correo <strong>{email}</strong>. Ingresa el código de 6 dígitos que te enviamos.
              </div>
              <div className="recovery-form-group">
                <label htmlFor="rec-code">Código de verificación</label>
                <input
                  id="rec-code"
                  type="text"
                  placeholder="000000"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  className={`input-code ${error ? "input-error" : ""}`}
                  onKeyDown={(e) => e.key === "Enter" && code.length === 6 && handleStep1()}
                />
                {error && <span className="error-msg">⚠️ {error}</span>}
              </div>
              <button className="recovery-btn" onClick={handleStep1} disabled={code.length < 6 || loading}>
                {loading ? "Verificando..." : "Verificar código →"}
              </button>
              <span className="recovery-link" onClick={() => { setStep(0); setCode(""); setError(""); }}>
                ← Cambiar correo electrónico
              </span>
            </>

          ) : (
            <>
              <div className="recovery-hint">
                🔒 Crea una contraseña segura: mínimo 8 caracteres, una mayúscula, un número y un símbolo.
              </div>
              <div className="recovery-form-group">
                <label htmlFor="rec-pass">Nueva contraseña</label>
                <input
                  id="rec-pass"
                  type="password"
                  placeholder="Mínimo 8 caracteres"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                {newPassword && (
                  <>
                    <div className="strength-bar">
                      <div className="strength-fill" style={{ width: strength.width, background: strength.color }} />
                    </div>
                    <span className="strength-label" style={{ color: strength.color }}>
                      {strength.label}
                    </span>
                  </>
                )}
              </div>
              <div className="recovery-form-group">
                <label htmlFor="rec-confirm">Confirmar contraseña</label>
                <input
                  id="rec-confirm"
                  type="password"
                  placeholder="Repite tu contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={confirmPassword && confirmPassword !== newPassword ? "input-error" : ""}
                />
                {confirmPassword && confirmPassword !== newPassword && (
                  <span className="error-msg">⚠️ Las contraseñas no coinciden</span>
                )}
              </div>
              {error && <span className="error-msg" style={{ marginBottom: 12, display: "block" }}>⚠️ {error}</span>}
              <button
                className="recovery-btn"
                onClick={handleStep2}
                disabled={!newPassword || !confirmPassword || loading}
              >
                {loading ? "Guardando..." : "Cambiar contraseña →"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}