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
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      background: "red",
      color: "white",
      zIndex: 999999,
      fontSize: 40,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    SI VES ESTO, VERCEL ESTÁ DESPLEGANDO
  </div>
);
