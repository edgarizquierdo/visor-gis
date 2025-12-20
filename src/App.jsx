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
    <div style={{ position: "relative", height: "100vh", width: "100vw" }}>
      {/* PANEL CSV */}
      <div
        style={{
          position: "absolute",
          top: 12,
          left: 12,
          zIndex: 1000,
          background: "#222",
          color: "#fff",
          padding: 12,
          borderRadius: 6,
          width: 320,
          boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
        }}
      >
        <h4 style={{ marginTop: 0 }}>Subir CSV SIGPAC</h4>
        <CsvUpload onData={setRows} />

        {rows.length > 0 && (
          <div style={{ marginTop: 10, fontSize: 12 }}>
            Filas cargadas: <strong>{rows.length}</strong>
          </div>
        )}
      </div>

      {/* MAPA */}
      <div id="map" style={{ height: "100%", width: "100%" }} />
    </div>
  );
}
