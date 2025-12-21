import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import CsvUpload from "./CsvUpload";

export default function App() {
  const mapRef = useRef(null);

  useEffect(() => {
    if (mapRef.current) return;

    const map = L.map("map").setView([41.5, 1.5], 7);
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
    }).addTo(map);
  }, []);

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh" }}>
      <CsvUpload />

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
