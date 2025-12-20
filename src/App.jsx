import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import CsvUpload from "./CsvUpload";

export default function App() {
  const mapRef = useRef(null);
  const containerRef = useRef(null);
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
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
      }}
    >
      {/* CSV UPLOAD – FORZADO ENCIMA DEL MAPA */}
      <div
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          zIndex: 2000,
          background: "white",
          padding: 10,
          borderRadius: 6,
          boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
        }}
      >
        <CsvUpload onData={setRows} />
      </div>

      {/* MAPA */}
      <div
        id="map"
        style={{
          height: "100%",
          width: "100%",
        }}
      />
    </div>
  );
}
