import { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function App() {
  useEffect(() => {
    const map = L.map("map").setView([41.5, 1.5], 8);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap"
    }).addTo(map);

    return () => {
      map.remove();
    };
  }, []);

  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <div id="map" style={{ height: "100%" }} />
    </div>
  );
}
