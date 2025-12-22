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
  if (!Number.isFinite(m)) return "—";
  if (m < 1000) return `${m.toFixed(1)} m`;
  return `${(m / 1000).toFixed(3)} km`;
}

function formatArea(m2) {
  if (!Number.isFinite(m2)) return "—";
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
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)));
}

// Spherical polygon area (m²) using lat/lng in radians
function sphericalPolygonAreaMeters2(latlngs) {
  // Needs at least 3 points
  if (!latlngs || latlngs.length < 3) return 0;

  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;

  let sum = 0;
  for (let i = 0; i < latlngs.length; i++) {
    const p1 = latlngs[i];
    const p2 = latlngs[(i + 1) % latlngs.length];

    const lon1 = toRad(p1.lng);
    const lon2 = toRad(p2.lng);
    const lat1 = toRad(p1.lat);
    const lat2 = toRad(p2.lat);

    sum += (lon2 - lon1) * (2 + Math.sin(lat1) + Math.sin(lat2));
  }
  return Math.abs((sum * R * R) / 2);
}

export default function App() {
  const mapRef = useRef(null);

  // Medición
  const measureLayerRef = useRef(null); // FeatureGroup para todo lo dibujado
  const tempLineRef = useRef(null); // polyline/polygon en curso
  const tempMarkersRef = useRef([]); // marcadores de vértices
  const modeRef = useRef("none"); // "none" | "distance" | "area"

  const [rows, setRows] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [measureMode, setMeasureMode] = useState("none"); // solo para pintar UI
  const [measureText, setMeasureText] = useState(""); // info en pantalla

  const isMeasuring = useMemo(() => measureMode !== "none", [measureMode]);

  useEffect(() => {
    if (mapRef.current) return;

    const map = L.map("map").setView([41.5, 1.5], 8);
    mapRef.current = map;

    // Capa satélite
    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      { attribution: "Tiles © Esri" }
    ).addTo(map);

    // Municipios / etiquetas
    L.tileLayer(
      "https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
      { attribution: "© Esri — Boundaries & Places" }
    ).addTo(map);

    // Grupo de capas de medición
    const fg = L.featureGroup().addTo(map);
    measureLayerRef.current = fg;

    // Evitar que el doble click haga zoom mientras medimos
    map.doubleClickZoom.disable();

    const clearTemp = () => {
      if (tempLineRef.current) {
        fg.removeLayer(tempLineRef.current);
        tempLineRef.current = null;
      }
      for (const m of tempMarkersRef.current) fg.removeLayer(m);
      tempMarkersRef.current = [];
      setMeasureText("");
    };

    const finishMeasure = () => {
      // Dejar el dibujo “fijo” (ya está en el featureGroup)
      tempLineRef.current = null;
      tempMarkersRef.current = [];
      modeRef.current = "none";
      setMeasureMode("none");
      // mantener el texto un momento, pero no es obligatorio
    };

    const onClick = (e) => {
      const mode = modeRef.current;
      if (mode === "none") return;

      const latlng = e.latlng;

      // Crear marcador de vértice (visible)
      const marker = L.circleMarker(latlng, {
        radius: 5,
        weight: 2,
        fillOpacity: 1,
      });
      marker.addTo(fg);
      tempMarkersRef.current.push(marker);

      // Construir lista de puntos
      const points = tempMarkersRef.current.map((m) => m.getLatLng());

      // Crear o actualizar geometría temporal
      if (!tempLineRef.current) {
        if (mode === "distance") {
          tempLineRef.current = L.polyline(points, { weight: 3 }).addTo(fg);
        } else {
          tempLineRef.current = L.polygon(points, { weight: 2, fillOpacity: 0.15 }).addTo(fg);
        }
      } else {
        if (mode === "distance") {
          tempLineRef.current.setLatLngs(points);
        } else {
          tempLineRef.current.setLatLngs(points);
        }
      }

      // Calcular medida
      if (mode === "distance") {
        let total = 0;
        for (let i = 1; i < points.length; i++) {
          total += haversineMeters(points[i - 1], points[i]);
        }
        setMeasureText(`Distancia: ${formatDistance(total)} (doble clic para terminar)`);
      } else {
        const area = sphericalPolygonAreaMeters2(points);
        setMeasureText(
          points.length < 3
            ? "Área: añade al menos 3 puntos (doble clic para terminar)"
            : `Área: ${formatArea(area)} (doble clic para terminar)`
        );
      }
    };

    const onDblClick = (e) => {
      const mode = modeRef.current;
      if (mode === "none") return;

      // Evitar que Leaflet interprete doble click (aunque ya está deshabilitado)
      L.DomEvent.preventDefault(e);
      L.DomEvent.stopPropagation(e);

      // Si hay muy pocos puntos, cancela sin dejar basura
      const pts = tempMarkersRef.current.map((m) => m.getLatLng());
      if ((mode === "distance" && pts.length < 2) || (mode === "area" && pts.length < 3)) {
        clearTemp();
      }

      finishMeasure();
    };

    map.on("click", onClick);
    map.on("dblclick", onDblClick);

    return () => {
      map.off("click", onClick);
      map.off("dblclick", onDblClick);
    };
  }, []);

  // Reajustar mapa al plegar sidebar
  useEffect(() => {
    if (!mapRef.current) return;
    setTimeout(() => mapRef.current.invalidateSize(), 320);
  }, [sidebarOpen]);

  const startDistance = () => {
    modeRef.current = "distance";
    setMeasureMode("distance");
    setMeasureText("Distancia: clic para añadir puntos (doble clic para terminar)");
  };

  const startArea = () => {
    modeRef.current = "area";
    setMeasureMode("area");
    setMeasureText("Área: clic para añadir vértices (doble clic para terminar)");
  };

  const clearAllMeasures = () => {
    const fg = measureLayerRef.current;
    if (!fg) return;
    fg.clearLayers();
    // reset temporales
    tempLineRef.current = null;
    tempMarkersRef.current = [];
    modeRef.current = "none";
    setMeasureMode("none");
    setMeasureText("");
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
          overflow: "hidden",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {sidebarOpen && <h2 style={{ margin: 0, fontSize: 22 }}>Datos SIGPAC</h2>}

          <button
            onClick={() => setSidebarOpen((v) => !v)}
            title={sidebarOpen ? "Plegar menú" : "Desplegar menú"}
            style={{
              marginLeft: "auto",
              width: 28,
              height: 28,
              borderRadius: 6,
              border: "none",
              cursor: "pointer",
              background: "#334155",
              color: "white",
              fontSize: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
            }}
          >
            {sidebarOpen ? "◀" : "▶"}
          </button>
        </div>

        {sidebarOpen && (
          <div style={{ marginTop: 16 }}>
            <div
              style={{
                background: "white",
                color: "#111",
                borderRadius: 12,
                padding: 16,
                boxShadow: "0 10px 24px rgba(0,0,0,0.18)",
              }}
            >
              <h3 style={{ margin: 0, marginBottom: 8 }}>Subir CSV</h3>
              <p style={{ fontSize: 13, margin: 0, marginBottom: 12 }}>
                Archivo con códigos SIGPAC por columnas
              </p>
              <CsvUpload onData={setRows} />

              {rows.length > 0 && (
                <p style={{ marginTop: 10, fontSize: 12 }}>
                  Filas cargadas: <strong>{rows.length}</strong>
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* MAPA + TOOLBAR */}
      <div style={{ flex: 1, position: "relative" }}>
        {/* TOOLBAR GIS (premium) */}
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
            title="Medir distancia"
            onClick={startDistance}
            style={{
              ...toolBtnStyle,
              background: measureMode === "distance" ? "#e2e8f0" : "white",
            }}
          >
            <img src="/icons/rule.png" alt="Regla" style={{ width: 22, height: 22 }} />
          </button>

          <button
            title="Medir área"
            onClick={startArea}
            style={{
              ...toolBtnStyle,
              background: measureMode === "area" ? "#e2e8f0" : "white",
            }}
          >
            <img src="/icons/polygon.png" alt="Área" style={{ width: 22, height: 22 }} />
          </button>

          <button
            title="Borrar mediciones"
            onClick={clearAllMeasures}
            style={{ ...toolBtnStyle, background: "#fee2e2" }}
          >
            🗑️
          </button>
        </div>

        {/* Indicador pequeño (opcional pero útil) */}
        {measureText && (
          <div
            style={{
              position: "absolute",
              top: 16,
              right: 72,
              zIndex: 1000,
              background: "rgba(255,255,255,0.95)",
              borderRadius: 10,
              padding: "8px 10px",
              boxShadow: "0 6px 18px rgba(0,0,0,0.18)",
              fontSize: 12,
              maxWidth: 260,
              pointerEvents: "none",
            }}
          >
            {measureText}
          </div>
        )}

        {/* MAPA */}
        <div id="map" style={{ width: "100%", height: "100%" }} />
      </div>
    </div>
  );
}
