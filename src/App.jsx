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

    const map = L.map("map").setView([41.5, 1.5], 8);
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
    }).addTo(map);
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
        }}
      >
        <h3 style={{ marginTop: 0 }}>📂 Datos SIGPAC</h3>
        <CsvUpload onData={setRows} />

        {rows.length > 0 && (
          <p style={{ marginTop: 10, fontSize: 12 }}>
            Filas cargadas: <strong>{rows.length}</strong>
          </p>
        )}
      </div>

      {/* MAPA */}
      <div style={{ flex: 1, position: "relative" }}>
        {/* BOTÓN TOGGLE */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            position: "absolute",
            top: 10,
            left: 10,
            zIndex: 3000,
            background: "white",
            border: "none",
            borderRadius: 6,
            padding: "6px 10px",
            cursor: "pointer",
            boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
          }}
        >
          ☰
        </button>

        <div id="map" style={{ width: "100%", height: "100%" }} />
      </div>
    </div>
  );
}
