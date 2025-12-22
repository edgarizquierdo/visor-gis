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
      zoomControl: false,
    }).setView([41.5, 1.5], 8);

    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
    }).addTo(map);

    L.control.zoom({ position: "topright" }).addTo(map);
  }, []);

  // 🔹 cada vez que se abre/cierra el menú → recalculamos el mapa
  useEffect(() => {
    if (!mapRef.current) return;
    setTimeout(() => {
      mapRef.current.invalidateSize();
    }, 300); // espera a que termine la animación
  }, [sidebarOpen]);

  return (
  <>
    {/* SIDEBAR */}
    <div
      style={{
        position: "absolute",
        top: 0,
        left: sidebarOpen ? 0 : -320,
        width: 300,
        height: "100vh",
        background: "#1f2933",
        color: "white",
        padding: 16,
        transition: "left 0.3s ease",
        zIndex: 2500,
        boxShadow: "2px 0 8px rgba(0,0,0,0.3)",
      }}
    >
      {/* HEADER */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 20 }}>
        <button
          onClick={() => setSidebarOpen(false)}
          style={{
            marginRight: 12,
            background: "white",
            border: "none",
            borderRadius: 6,
            padding: "6px 10px",
            cursor: "pointer",
            fontSize: 18,
          }}
          title="Cerrar menú"
        >
          ✕
        </button>

        <h3 style={{ margin: 0 }}>Datos SIGPAC</h3>
      </div>

      <CsvUpload onData={setRows} />

      {rows.length > 0 && (
        <p style={{ marginTop: 12, fontSize: 13, color: "#d1d5db" }}>
          Filas cargadas: <strong>{rows.length}</strong>
        </p>
      )}
    </div>

    {/* BOTÓN ABRIR (solo si está cerrado) */}
    {!sidebarOpen && (
      <button
        onClick={() => setSidebarOpen(true)}
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          zIndex: 3000,
          background: "white",
          border: "none",
          borderRadius: 6,
          padding: "8px 12px",
          cursor: "pointer",
          boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
          fontSize: 18,
        }}
        title="Abrir menú"
      >
        ☰
      </button>
    )}

    {/* MAPA */}
    <div
      id="map"
      style={{
        width: "100vw",
        height: "100vh",
      }}
    />
  </>
);
