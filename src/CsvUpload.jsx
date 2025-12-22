import React from "react";

export default function CsvUpload({ onData }) {
  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      const text = String(reader.result || "");
      const lines = text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);

      if (lines.length === 0) return;

      // CSV con ; como separador
      const headers = lines[0].split(";").map((h) => h.trim());

      const rows = lines.slice(1).map((line) => {
        const values = line.split(";");
        const obj = {};
        headers.forEach((h, i) => {
          obj[h] = (values[i] ?? "").trim();
        });
        return obj;
      });

      onData?.(rows);
    };

    reader.readAsText(file);
  };

  return (
    <div>
      {/* BOTÓN CSV */}
      <label
        style={{
          display: "block",
          width: "100%",
          boxSizing: "border-box",
          background: "#3563E9",
          color: "white",
          padding: "10px 14px", // 👈 más pequeño
          borderRadius: 10,
          cursor: "pointer",
          textAlign: "center",
          fontWeight: 700,
          fontSize: 14, // 👈 más pequeño
          boxShadow: "0 6px 14px rgba(0,0,0,0.15)",
          userSelect: "none",
        }}
      >
        📁 Seleccionar archivo CSV
        <input
          type="file"
          accept=".csv"
          onChange={handleFile}
          style={{ display: "none" }}
        />
      </label>

      {/* DESCRIPCIÓN */}
      <p
  style={{
    marginTop: 12,
    marginBottom: 6,
    fontSize: 12,
    lineHeight: 1.4,
    color: "#ffffff",      // 👈 texto en blanco
    opacity: 0.9,          // 👈 un poco más suave
  }}
>
  * El archivo debe tener las columnas{" "}
  <strong>estrictamente iguales</strong> que el modelo siguiente.
</p>

      {/* DESCARGA PLANTILLA */}
      <a
        href="/templates/plantilla_sigpac.csv"
        download
        style={{
          fontSize: 12,
          color: "#2563eb",
          textDecoration: "underline",
          cursor: "pointer",
        }}
      >
        Descargar plantilla CSV de ejemplo
      </a>
    </div>
  );
}
