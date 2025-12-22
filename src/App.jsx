import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import CsvUpload from "./CsvUpload";

export default function App() {
  const mapRef = useRef(null);
  const [rows, setRows] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Inicializar mapa
  useEffect(() => {
    if (mapRef.current) return;

    const map = L.map("map").setView([41.5, 1.5], 8);
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
    }).addTo(map);
  }, []);

  // Reajustar mapa cuando se pliega / despliega el menú
  useEffect(() => {
    if (!mapRef.current) return;
    setTimeout(() => {
      mapRef.current.invalidateSize();
    }, 310);
  }, [sidebarOpen]);

  return (
    <div style={{ width: "100vw", height: "100vh", display: "flex" }}>
      {/* SIDEBAR */}
      <div
        style={{
          width: sidebarOpen ? 340 : 44,
          transition: "width 0.3s ease",
          background: "#1f2933",
          color: "white",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: sidebarOpen ? 20 : 8,
          boxSizing: "border-box",
        }}
      >
        {/* HEADER */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {sidebarOpen && (
            <h2 style={{ margin: 0, fontSize: 22 }}>Datos SIGPAC</h2>
          )}

          {/* FLECHA INTERNA */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title={sidebarOpen ? "Plegar menú" : "Desplegar menú"}
            style={{
              marginLeft: "auto",
              width: 28,
              height: 28,
              borderRadius: 6,
              border: "none",
              cursor: "pointer",
              background: "#334155",
              color: "white",
              fontSize: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
            }}
          >
            {sidebarOpen ? "◀" : "▶"}
          </button>
        </div>

        {/* CONTENIDO */}
        {sidebarOpen && (
          <div style={{ marginTop: 20 }}>
            <div
              style={{
                background: "white",
                color: "#111",
                borderRadius: 10,
                padding: 16,
              }}
            >
              <h3 style={{ marginTop: 0 }}>Subir CSV</h3>
              <p style={{ fontSize: 13, marginBottom: 12 }}>
                Archivo con códigos SIGPAC por columnas
              </p>

              <CsvUpload onData={setRows} />

              {rows.length > 0 && (
                <p style={{ marginTop: 10, fontSize: 12 }}>
                  Filas cargadas: <strong>{rows.length}</strong>
                </p>
              )}
            </div>
          </div>
        )}

        {/* ESPACIADOR INFERIOR */}
        <div />
      </div>

      {/* MAPA */}
      <div style={{ flex: 1 }}>
        <div id="map" style={{ width: "100%", height: "100%" }} />
      </div>
    </div>
  );
}
