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
      zoomControl: false, // quitamos zoom por defecto
    }).setView([41.5, 1.5], 8);

    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
    }).addTo(map);

    // 👉 Zoom a la DERECHA (donde estaba la hamburguesa)
    L.control.zoom({ position: "topright" }).addTo(map);
  }, []);

  // 🔑 SOLUCIÓN FRANJA GRIS
  useEffect(() => {
    if (mapRef.current) {
      setTimeout(() => {
        mapRef.current.invalidateSize();
      }, 300);
    }
  }, [sidebarOpen]);

  return (
    <div style={{ width: "100vw", height: "100vh", display: "flex" }}>
      {/* SIDEBAR */}
      <div
        style={{
          width: sidebarOpen ? 340 : 0,
          transition: "width 0.3s ease",
          background: "#1f2933",
          color: "white",
          overflow: "hidden",
          padding: sidebarOpen ? 20 : 0,
        }}
      >
        <h2 style={{ marginTop: 0 }}>Datos SIGPAC</h2>

        {/* CSV — UNA SOLA VEZ */}
        <CsvUpload onData={setRows} />

        {rows.length > 0 && (
          <p style={{ marginTop: 12, fontSize: 13, opacity: 0.8 }}>
            Filas cargadas: <strong>{rows.length}</strong>
          </p>
        )}
      </div>

      {/* MAPA */}
      <div style={{ flex: 1, position: "relative" }}>
        {/* HAMBURGUESA — donde estaban los ZOOM */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            position: "absolute",
            top: 10,
            right: 10, // 👈 MISMO SITIO QUE ZOOM ORIGINAL
            zIndex: 4000,
            background: "white",
            border: "none",
            borderRadius: 6,
            padding: "6px 10px",
            cursor: "pointer",
            boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
            fontSize: 18,
          }}
        >
          ☰
        </button>

        <div id="map" style={{ width: "100%", height: "100%" }} />
      </div>
    </div>
  );
}
