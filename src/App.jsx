import { useEffect, useRef, useState } from "react";
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

// =========================
// CÁLCULOS GIS
// =========================
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

function polygonAreaHa(latlngs) {
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

  const m2 = Math.abs((sum * R * R) / 2);
  return m2 / 10000;
}

// =========================
// SERVICIO SIGPAC
// =========================
async function fetchSigpacGeoJSON(rows) {
  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/parcels/sigpac`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rows }),
    }
  );

  if (!res.ok) {
    throw new Error("Error obteniendo parcelas SIGPAC");
  }

  return await res.json(); // GeoJSON
}

// =========================
// APP
// =========================
export default function App() {
  const mapRef = useRef(null);
  const layerRef = useRef(null);
  const sigpacLayerRef = useRef(null);

  const tempShapeRef = useRef(null);
  const pointsRef = useRef([]);
  const vertexMarkersRef = useRef([]);
  const modeRef = useRef("none");

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [rows, setRows] = useState([]);
  const [mode, setMode] = useState("none");

  // ===== INIT MAPA =====
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
    layerRef.current = fg;

    map.on("click", (e) => {
      if (modeRef.current === "none") return;

      const latlng = e.latlng;
      pointsRef.current.push(latlng);

      const vertex = L.circleMarker(latlng, {
        radius: 5,
        color: "#0f172a",
        weight: 2,
        fillColor: "#ffffff",
        fillOpacity: 1,
      }).addTo(fg);
      vertexMarkersRef.current.push(vertex);

      // DISTANCIA
      if (modeRef.current === "distance") {
        if (pointsRef.current.length === 2) {
          const [a, b] = pointsRef.current;
          const d = haversineMeters(a, b);

          L.polyline([a, b], { weight: 3 }).addTo(fg);
          L.tooltip({ permanent: true })
            .setContent(`${d.toFixed(1)} m`)
            .setLatLng(b)
            .addTo(fg);

          resetMeasure();
        }
        return;
      }

      // ÁREA
      if (!tempShapeRef.current) {
        tempShapeRef.current = L.polygon([latlng], {
          fillOpacity: 0.15,
        }).addTo(fg);
      } else {
        const pts = [...pointsRef.current];
        tempShapeRef.current.setLatLngs(pts);

        if (pts.length >= 3 && latlng.distanceTo(pts[0]) < 15) {
          const ha = polygonAreaHa(pts);
          const center = L.polygon(pts).getBounds().getCenter();

          L.tooltip({ permanent: true })
            .setContent(`${ha.toFixed(2)} ha`)
            .setLatLng(center)
            .addTo(fg);

          resetMeasure();
        }
      }
    });

    function resetMeasure() {
      tempShapeRef.current = null;
      pointsRef.current = [];
      vertexMarkersRef.current = [];
      modeRef.current = "none";
      setMode("none");
    }
  }, []);

  // ===== AJUSTE MAPA AL ABRIR/CERRAR SIDEBAR =====
  useEffect(() => {
    if (!mapRef.current) return;
    setTimeout(() => mapRef.current.invalidateSize(), 300);
  }, [sidebarOpen]);

  // ===== SIGPAC: CUANDO LLEGAN ROWS =====
  useEffect(() => {
    if (!rows.length || !mapRef.current) return;

    (async () => {
      try {
        const geojson = await fetchSigpacGeoJSON(rows);

        if (sigpacLayerRef.current) {
          sigpacLayerRef.current.remove();
          sigpacLayerRef.current = null;
        }

        const layer = L.geoJSON(geojson, {
          style: {
            color: "#2563eb",
            weight: 2,
            fillOpacity: 0.2,
          },
          onEachFeature: (feature, layer) => {
            if (feature.properties) {
              const p = feature.properties;
              layer.bindPopup(`
                <strong>Parcela SIGPAC</strong><br/>
                Provincia: ${p.provincia ?? "-"}<br/>
                Municipio: ${p.municipio ?? "-"}<br/>
                Polígono: ${p.poligono ?? "-"}<br/>
                Parcela: ${p.parcela ?? "-"}
              `);
            }
          },
        }).addTo(mapRef.current);

        sigpacLayerRef.current = layer;

        const bounds = layer.getBounds();
        if (bounds.isValid()) {
          mapRef.current.fitBounds(bounds, { padding: [20, 20] });
        }
      } catch (err) {
        console.error("SIGPAC:", err);
      }
    })();
  }, [rows]);

  // ===== CONTROLES =====
  const startDistance = () => {
    clearTemp();
    modeRef.current = "distance";
    setMode("distance");
  };

  const startArea = () => {
    clearTemp();
    modeRef.current = "area";
    setMode("area");
  };

  const clearTemp = () => {
    layerRef.current?.clearLayers();
    pointsRef.current = [];
    vertexMarkersRef.current = [];
    tempShapeRef.current = null;
    modeRef.current = "none";
    setMode("none");
  };

  // ===== RENDER =====
  return (
    <div style={{ width: "100vw", height: "100vh", display: "flex" }}>
      {/* SIDEBAR */}
      <div
        style={{
          width: sidebarOpen ? 340 : 44,
          background: "#1f2933",
          color: "white",
          padding: sidebarOpen ? 20 : 8,
          transition: "width 0.3s",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          {sidebarOpen && (
            <h2 style={{ margin: 0, marginBottom: 18 }}>
              Datos SIGPAC
            </h2>
          )}
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            style={{
              marginLeft: "auto",
              background: "#334155",
              color: "white",
              border: "none",
              borderRadius: 6,
              width: 28,
              height: 28,
            }}
          >
            {sidebarOpen ? "◀" : "▶"}
          </button>
        </div>

        {sidebarOpen && <CsvUpload onData={setRows} />}
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
              background: mode === "distance" ? "#16a34a" : "white",
            }}
          >
            📏
          </button>

          <button
            onClick={startArea}
            style={{
              ...toolBtnStyle,
              background: mode === "area" ? "#16a34a" : "white",
            }}
          >
            🔺
          </button>

          <button
            onClick={clearTemp}
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
