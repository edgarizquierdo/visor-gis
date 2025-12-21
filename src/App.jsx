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
    <>
      {/* 🔹 OVERLAY GLOBAL (FUERA del mapa) */}
      <div
        style={{
          position: "fixed",
          top: 12,
          left: 12,
          zIndex: 9999,
          background: "white",
          padding: "10px",
          borderRadius: "6px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
        }}
      >
        <CsvUpload onData={setRows} />
        <div style={{ fontSize: 12, marginTop: 6 }}>
          Filas cargadas: {rows.length}
        </div>
      </div>

      {/* 🔹 MAPA */}
      <div
        id="map"
        style={{
          height: "100vh",
          width: "100vw",
        }}
      />
    </>
  );
}
