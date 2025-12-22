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

    /* =========================
       CAPA BASE: SATÉLITE
       ========================= */
    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        attribution: "Tiles © Esri",
      }
    ).addTo(map);

    /* =========================
       CAPA SUPERIOR: MUNICIPIOS
       ========================= */
    L.tileLayer(
      "https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
      {
        attribution: "© Esri — Boundaries & Places",
      }
    ).addTo(map);
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    setTimeout(() => mapRef.current.invalidateSize(), 320);
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
          padding: sidebarOpen ? 20 : 8,
          boxSizing: "border-box",
          overflow: "hidden",
        }}
      >
        {/* HEADER */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {sidebarOpen && (
            <h2 style={{ margin: 0, fontSize: 22 }}>Datos SIGPAC</h2>
          )}

          <button
            onClick={() => setSidebarOpen((v) => !v)}
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
          <div style={{ marginTop: 16 }}>
            <div
              style={{
                background: "white",
                color: "#111",
                borderRadius: 12,
                padding: 16,
                boxShadow: "0 10px 24px rgba(0,0,0,0.18)",
              }}
            >
              <h3 style={{ margin: 0, marginBottom: 8 }}>Subir CSV</h3>
              <p style={{ fontSize: 13, margin: 0, marginBottom: 12 }}>
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
      </div>

      {/* MAPA */}
      <div style={{ flex: 1 }}>
        <div id="map" style={{ width: "100%", height: "100%" }} />
      </div>
    </div>
  );
}

