import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
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
      { attribution: "Tiles © Esri" }
    ).addTo(map);

    /* =========================
       CAPA SUPERIOR: MUNICIPIOS
       ========================= */
    L.tileLayer(
      "https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
      { attribution: "© Esri — Boundaries & Places" }
    ).addTo(map);

    /* =================================================
       HERRAMIENTAS DE MEDICIÓN (FIX REAL VITE)
       ================================================= */

    // Exponer Leaflet globalmente
    window.L = L;

    // 🔧 Cargar el plugin REAL
    import("leaflet-draw/dist/leaflet.draw.js").then(() => {
      console.log("L.Control.Draw =", L.Control?.Draw);

      const drawnItems = new L.FeatureGroup();
      map.addLayer(drawnItems);

      const drawControl = new L.Control.Draw({
        position: "topright",
        draw: {
          polyline: {
            shapeOptions: { color: "#f97316", weight: 3 },
            metric: true,
          },
          polygon: {
            allowIntersection: false,
            showArea: true,
            shapeOptions: { color: "#22c55e" },
          },
          rectangle: false,
          circle: false,
          circlemarker: false,
          marker: false,
        },
        edit: {
          featureGroup: drawnItems,
          edit: true,
          remove: true,
        },
      });

      map.addControl(drawControl);

      map.on(L.Draw.Event.CREATED, (e) => {
        drawnItems.addLayer(e.layer);
      });
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
              fontSize: 16,
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

      {/* MAPA */}
      <div style={{ flex: 1 }}>
        <div id="map" style={{ width: "100%", height: "100%" }} />
      </div>
    </div>
  );
}
