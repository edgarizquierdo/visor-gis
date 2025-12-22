import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import CsvUpload from "./CsvUpload";

export default function App() {
  const mapRef = useRef(null);
  const [rows, setRows] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (mapRef.current) return;

    const map = L.map("map", {
      zoomControl: false, // ⛔ quitamos zoom por defecto
    }).setView([41.5, 1.5], 8);

    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
    }).addTo(map);

    // ✅ Zoom a la derecha → no se solapa con hamburguesa
    L.control.zoom({ position: "topright" }).addTo(map);
  }, []);

  return (
    <div style={{ width: "100vw", height: "100vh", display: "flex" }}>
      {/* SIDEBAR */}
      <div
        style={{
          width: sidebarOpen ? 300 : 0,
          transition: "width 0.3s ease",
          background: "#1f2933",
          color: "white",
          overflow: "hidden",
          padding: sidebarOpen ? 16 : 0,
          boxShadow: sidebarOpen
            ? "2px 0 6px rgba(0,0,0,0.3)"
            : "none",
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: 12 }}>
          📂 Datos SIGPAC
        </h3>

        {/* CSV DENTRO DEL MENÚ */}
        <CsvUpload onData={setRows} />

        {rows.length > 0 && (
          <p style={{ marginTop: 12, fontSize: 13, color: "#d1d5db" }}>
            Filas cargadas: <strong>{rows.length}</strong>
          </p>
        )}
      </div>

      {/* MAPA */}
      <div style={{ flex: 1, position: "relative" }}>
        {/* BOTÓN HAMBURGUESA */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            position: "absolute",
            top: 12,
            left: 12,
            zIndex: 3000,
            background: "white",
            border: "none",
            borderRadius: 6,
            padding: "8px 12px",
            cursor: "pointer",
            boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
            fontSize: 18,
          }}
          title="Abrir / cerrar menú"
        >
          ☰
        </button>

        <div id="map" style={{ width: "100%", height: "100%" }} />
      </div>
    </div>
  );
}
