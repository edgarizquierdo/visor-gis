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
  <div
    style={{
      position: "fixed",
      top: 20,
      left: 20,
      zIndex: 999999,
      background: "red",
      color: "white",
      padding: 20,
      fontSize: 20,
    }}
  >
    SOY EL CSV UPLOAD
  </div>
);

