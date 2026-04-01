import { useState } from "react";
import "./Contacto.css";

const temas = [
  "Problema técnico",
  "Reporte de ruta incorrecta",
  "Solicitud de datos personales",
  "Reporte de usuario",
  "Sugerencia o mejora",
  "Otro",
];

export default function Contacto() {
  const [form, setForm] = useState({ nombre: "", email: "", tema: "", mensaje: "" });
  const [enviado, setEnviado] = useState(false);
  const [cargando, setCargando] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setCargando(true);
    // Conecta aquí con tu API Django:
    // axios.post("/api/contacto/", form).then(...)
    setTimeout(() => {
      setCargando(false);
      setEnviado(true);
    }, 1500);
  };

  const camposValidos = form.nombre && form.email && form.tema && form.mensaje.length >= 10;

  return (
    <div className="contacto-root">
      <div className="cont-hero">
        <div className="cont-badge">Walk App · Soporte</div>
        <h1 className="cont-title">Contáctanos</h1>
        <p className="cont-subtitle">
          Estamos aquí para ayudarte con cualquier duda, sugerencia o reporte sobre la plataforma.
        </p>
      </div>

      <div className="cont-body">
        {/* Columna izquierda */}
        <div className="cont-info-stack">
          <div className="cont-info-card">
            <div className="cont-info-icon">📧</div>
            <div>
              <h4>Correo Electrónico</h4>
              <a href="mailto:contacto@walkapp.com">contacto@walkapp.com</a>
            </div>
          </div>

          <div className="cont-info-card">
            <div className="cont-info-icon">📍</div>
            <div>
              <h4>Ubicación</h4>
              <p>Popayán, Cauca — Colombia</p>
            </div>
          </div>

          <div className="cont-info-card">
            <div className="cont-info-icon">🔒</div>
            <div>
              <h4>Privacidad y Datos</h4>
              <p>Para solicitudes sobre tus datos personales, indica tu nombre de usuario en el mensaje.</p>
            </div>
          </div>

          <div className="cont-info-card">
            <div className="cont-info-icon">🆘</div>
            <div>
              <h4>Emergencias en Ruta</h4>
              <p>
                Para emergencias reales llama al <strong>123</strong>. El botón SOS de la app
                es un apoyo complementario.
              </p>
            </div>
          </div>

          <div className="cont-response-time">
            <strong>⏱ Tiempo de respuesta</strong>
            Respondemos en un plazo de <strong>24 a 48 horas hábiles</strong>.
          </div>
        </div>

        {/* Columna derecha: formulario */}
        <div className="cont-form-card">
          {enviado ? (
            <div className="cont-success">
              <div className="cont-success-icon">🌿</div>
              <h3>¡Mensaje enviado!</h3>
              <p>
                Gracias por escribirnos, <strong>{form.nombre}</strong>. Te responderemos pronto
                en <strong>{form.email}</strong>.
              </p>
            </div>
          ) : (
            <>
              <h3 className="cont-form-title">Envíanos un mensaje</h3>
              <form onSubmit={handleSubmit}>
                <div className="cont-form-row">
                  <div className="cont-form-group">
                    <label htmlFor="nombre">Nombre</label>
                    <input
                      id="nombre"
                      name="nombre"
                      type="text"
                      placeholder="Tu nombre"
                      value={form.nombre}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="cont-form-group">
                    <label htmlFor="email">Correo electrónico</label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="tu@correo.com"
                      value={form.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="cont-form-group">
                  <label htmlFor="tema">Tema</label>
                  <select id="tema" name="tema" value={form.tema} onChange={handleChange} required>
                    <option value="">Selecciona un tema...</option>
                    {temas.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div className="cont-form-group">
                  <label htmlFor="mensaje">Mensaje</label>
                  <textarea
                    id="mensaje"
                    name="mensaje"
                    rows={5}
                    placeholder="Describe tu consulta con el mayor detalle posible..."
                    value={form.mensaje}
                    onChange={handleChange}
                    required
                  />
                  {form.mensaje.length > 0 && form.mensaje.length < 10 && (
                    <span className="cont-field-hint">Mínimo 10 caracteres ({form.mensaje.length}/10)</span>
                  )}
                </div>

                <button
                  type="submit"
                  className="cont-submit-btn"
                  disabled={!camposValidos || cargando}
                >
                  {cargando ? "Enviando..." : "Enviar mensaje →"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}