import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.polylinemeasure/Leaflet.PolylineMeasure.css";
import CsvUpload from "./CsvUpload";

const toolBtnStyle = {
  width: 40,
  height: 40,
  borderRadius: 8,
  border: "none",
  cursor: "pointer",
  background: "white",
  boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 6,
};

export default function App() {
  const mapRef = useRef(null);
  const measureRef = useRef(null);
  const [rows, setRows] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (mapRef.current) return;

    const map = L.map("map").setView([41.5, 1.5], 8);
    mapRef.current = map;

    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      { attribution: "Tiles © Esri" }
    ).addTo(map);

    L.tileLayer(
      "https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
      { attribution: "© Esri — Boundaries & Places" }
    ).addTo(map);

    // ⚠️ IMPORTANTE: inicializar SIN addTo(map)
    import("leaflet.polylinemeasure").then(() => {
      measureRef.current = L.control.polylineMeasure({
        position: "topright",
        unit: "metres",
        showBearings: false,
        clearMeasurementsOnStop: false,
        showClearControl: false,
        showUnitControl: false,
      });

      // Enlazar manualmente al mapa
      measureRef.current._map = map;
    });
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
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {sidebarOpen && (
            <h2 style={{ margin: 0, fontSize: 22 }}>Datos SIGPAC</h2>
          )}
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            style={{
              marginLeft: "auto",
              width: 28,
              height: 28,
              borderRadius: 6,
              border: "none",
              cursor: "pointer",
              background: "#334155",
              color: "white",
            }}
          >
            {sidebarOpen ? "◀" : "▶"}
          </button>
        </div>

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
              <CsvUpload onData={setRows} />
            </div>
          </div>
        )}
      </div>

      {/* MAPA + TOOLBAR */}
      <div style={{ flex: 1, position: "relative" }}>
        <div
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            zIndex: 1000,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <button
            title="Medir distancia / área"
            onClick={() => measureRef.current?._toggleMeasure()}
            style={toolBtnStyle}
          >
            <img src="/icons/rule.png" alt="Regla" style={{ width: 22 }} />
          </button>

          <button
            title="Borrar mediciones"
            onClick={() => measureRef.current?.clearMeasurements()}
            style={{ ...toolBtnStyle, background: "#fee2e2" }}
          >
            🗑️
          </button>
        </div>

        <div id="map" style={{ width: "100%", height: "100%" }} />
      </div>
    </div>
  );
}
