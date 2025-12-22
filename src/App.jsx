import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import CsvUpload from "./CsvUpload";

/* =========================
   ESTILO BOTONES TOOLBAR
   ========================= */
const toolBtnStyle = {
  width: 40,
  height: 40,
  borderRadius: 8,
  border: "none",
  cursor: "pointer",
  background: "white",
  boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 6,
};

function formatDistance(m) {
  if (m < 1000) return `${m.toFixed(1)} m`;
  return `${(m / 1000).toFixed(3)} km`;
}

function formatArea(m2) {
  if (m2 < 1_000_000) return `${m2.toFixed(1)} m²`;
  return `${(m2 / 1_000_000).toFixed(4)} km²`;
}

// Haversine distance (meters)
function haversineMeters(a, b) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

function polygonAreaMeters2(latlngs) {
  if (latlngs.length < 3) return 0;
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;

  let sum = 0;
  for (let i = 0; i < latlngs.length; i++) {
    const p1 = latlngs[i];
    const p2 = latlngs[(i + 1) % latlngs.length];
    sum +=
      (toRad(p2.lng) - toRad(p1.lng)) *
      (2 + Math.sin(toRad(p1.lat)) + Math.sin(toRad(p2.lat)));
  }
  return Math.abs((sum * R * R) / 2);
}

export default function App() {
  const mapRef = useRef(null);
  const measureLayerRef = useRef(null);
  const tempLineRef = useRef(null);
  const tempMarkersRef = useRef([]);
  const modeRef = useRef("none");

  const [rows, setRows] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [measureMode, setMeasureMode] = useState("none");

  useEffect(() => {
    if (mapRef.current) return;

    const map = L.map("map").setView([41.5, 1.5], 8);
    mapRef.current = map;

    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      { attribution: "Tiles © Esri" }
    ).addTo(map);

    L.tileLayer(
      "https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
      { attribution: "© Esri — Boundaries & Places" }
    ).addTo(map);

    const fg = L.featureGroup().addTo(map);
    measureLayerRef.current = fg;
    map.doubleClickZoom.disable();

    const clearTemp = () => {
      if (tempLineRef.current) fg.removeLayer(tempLineRef.current);
      tempMarkersRef.current.forEach((m) => fg.removeLayer(m));
      tempLineRef.current = null;
      tempMarkersRef.current = [];
    };

    const finishMeasure = () => {
      const points = tempMarkersRef.current.map((m) => m.getLatLng());
      if (!points.length) return;

      let labelText = "";
      let labelPos = points[points.length - 1];

      if (modeRef.current === "distance") {
        let d = 0;
        for (let i = 1; i < points.length; i++) {
          d += haversineMeters(points[i - 1], points[i]);
        }
        labelText = formatDistance(d);
      }

      if (modeRef.current === "area" && points.length >= 3) {
        const a = polygonAreaMeters2(points);
        labelText = formatArea(a);
        labelPos = L.polygon(points).getBounds().getCenter();
      }

      if (labelText) {
        L.tooltip({
          permanent: true,
          direction: "center",
          className: "measure-label",
        })
          .setContent(labelText)
          .setLatLng(labelPos)
          .addTo(fg);
      }

      tempLineRef.current = null;
      tempMarkersRef.current = [];
      modeRef.current = "none";
      setMeasureMode("none");
    };

    map.on("click", (e) => {
      if (modeRef.current === "none") return;

      const fg = measureLayerRef.current;
      const marker = L.circleMarker(e.latlng, { radius: 5 }).addTo(fg);
      tempMarkersRef.current.push(marker);

      const pts = tempMarkersRef.current.map((m) => m.getLatLng());

      if (!tempLineRef.current) {
        tempLineRef.current =
          modeRef.current === "distance"
            ? L.polyline(pts, { weight: 3 }).addTo(fg)
            : L.polygon(pts, { fillOpacity: 0.15 }).addTo(fg);
      } else {
        tempLineRef.current.setLatLngs(pts);
      }
    });

    map.on("dblclick", () => {
      if (modeRef.current === "none") return;
      finishMeasure();
    });
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    setTimeout(() => mapRef.current.invalidateSize(), 320);
  }, [sidebarOpen]);

  const startDistance = () => {
    modeRef.current = "distance";
    setMeasureMode("distance");
  };

  const startArea = () => {
    modeRef.current = "area";
    setMeasureMode("area");
  };

  const clearAll = () => {
    measureLayerRef.current?.clearLayers();
    tempLineRef.current = null;
    tempMarkersRef.current = [];
    modeRef.current = "none";
    setMeasureMode("none");
  };

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
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {sidebarOpen && <h2 style={{ margin: 0 }}>Datos SIGPAC</h2>}
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            style={{
              marginLeft: "auto",
              width: 28,
              height: 28,
              borderRadius: 6,
              border: "none",
              background: "#334155",
              color: "white",
            }}
          >
            {sidebarOpen ? "◀" : "▶"}
          </button>
        </div>

        {sidebarOpen && (
          <div style={{ marginTop: 16 }}>
            <CsvUpload onData={setRows} />
          </div>
        )}
      </div>

      {/* MAPA + TOOLBAR */}
      <div style={{ flex: 1, position: "relative" }}>
        <div
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            zIndex: 1000,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <button
            onClick={startDistance}
            style={{
              ...toolBtnStyle,
              background: measureMode === "distance" ? "#e2e8f0" : "white",
            }}
          >
            <img src="/icons/rule.png" alt="Regla" width={22} />
          </button>

          <button
            onClick={startArea}
            style={{
              ...toolBtnStyle,
              background: measureMode === "area" ? "#e2e8f0" : "white",
            }}
          >
            <img src="/icons/polygon.png" alt="Área" width={22} />
          </button>

          <button
            onClick={clearAll}
            style={{ ...toolBtnStyle, background: "#fee2e2" }}
          >
            🗑️
          </button>
        </div>

        <div id="map" style={{ width: "100%", height: "100%" }} />
      </div>
    </div>
  );
}
