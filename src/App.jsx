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
      <CsvUpload onData={setRows} />

      {rows.length > 0 && (
        <div style={{ padding: 12 }}>
          <strong>Preview CSV (primeras 5 filas)</strong>
          <pre
            style={{
              maxHeight: 200,
              overflow: "auto",
              background: "#111",
              color: "#0f0",
              padding: 10,
            }}
          >
            {JSON.stringify(rows.slice(0, 5), null, 2)}
          </pre>
          <div>Total filas cargadas: {rows.length}</div>
        </div>
      )}

      <div id="map" style={{ height: "65vh", width: "100%" }} />
    </>
  );
}
