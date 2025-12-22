import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import CsvUpload from "./CsvUpload";

export default function App() {
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const [rows, setRows] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Inicializar mapa
  useEffect(() => {
    if (mapRef.current) return;

    const map = L.map("map", {
  zoomControl: false,
}).setView([41.5, 1.5], 8);

L.control.zoom({ position: "topright" }).addTo(map);


    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
    }).addTo(map);
  }, []);

  // 🔑 CLAVE: recalcular tamaño del mapa al abrir/cerrar sidebar
  useEffect(() => {
    if (mapRef.current) {
      setTimeout(() => {
        mapRef.current.invalidateSize();
      }, 310); // mismo tiempo que la animación
    }
  }, [sidebarOpen]);

  return (
    <div style={{ width: "100vw", height: "100vh", display: "flex" }}>
      {/* SIDEBAR */}
      <div
        style={{
          width: sidebarOpen ? 320 : 0,
          transition: "width 0.3s ease",
          background: "#1f2933",
          color: "#ffffff",
          overflow: "hidden",
          padding: sidebarOpen ? 20 : 0,
        }}
      >
        {sidebarOpen && (
          <>
            <h3 style={{ marginTop: 0 }}>Datos SIGPAC</h3>

            <div
              style={{
                background: "#ffffff",
                color: "#111",
                padding: 16,
                borderRadius: 8,
              }}
            >
              <h4 style={{ marginTop: 0 }}>Subir CSV</h4>
              <p style={{ fontSize: 13, opacity: 0.8 }}>
                Archivo con códigos SIGPAC por columnas
              </p>

              <CsvUpload onData={setRows} />

              {rows.length > 0 && (
                <p style={{ marginTop: 10, fontSize: 12 }}>
                  Filas cargadas: <strong>{rows.length}</strong>
                </p>
              )}
            </div>
          </>
        )}
      </div>

      {/* MAPA */}
      <div
        ref={mapContainerRef}
        style={{
          flex: 1,
          position: "relative",
        }}
      >
        {/* BOTÓN HAMBURGUESA – NO MOLESTA AL ZOOM */}
        <button
  onClick={() => setSidebarOpen(!sidebarOpen)}
  style={{
    position: "absolute",
    top: 10,
    left: 10,
    zIndex: 2000,
    background: "white",
    border: "none",
    borderRadius: 6,
    padding: "6px 10px",
    cursor: "pointer",
    boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
    fontSize: 18,
  }}
>
  ☰
</button>


        <div id="map" style={{ width: "100%", height: "100%" }} />
      </div>
    </div>
  );
}
