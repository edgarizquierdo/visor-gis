import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import CsvUpload from "./CsvUpload";

export default function App() {
  const mapRef = useRef(null);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    if (mapRef.current) return;

    const map = L.map("map").setView([41.5, 1.5], 8);
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
    }).addTo(map);
  }, []);

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw" }}>
      {/* PANEL */}
      <div
        style={{
          width: 360,
          background: "#222",
          color: "#fff",
          padding: 12,
          overflowY: "auto",
          zIndex: 1000,
        }}
      >
        <h3 style={{ marginTop: 0 }}>Subir CSV SIGPAC</h3>
        <CsvUpload onData={setRows} />

        {rows.length > 0 && (
          <div style={{ marginTop: 12, fontSize: 13 }}>
            Filas cargadas: <strong>{rows.length}</strong>
          </div>
        )}
      </div>

      {/* MAPA */}
      <div id="map" style={{ flex: 1 }} />
    </div>
  );
}
