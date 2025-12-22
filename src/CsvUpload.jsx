import { useRef } from "react";

export default function CsvUpload({ onData }) {
  const inputRef = useRef();

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      const text = reader.result;
      const lines = text.split("\n").filter(Boolean);

      if (lines.length < 2) return;

      const headers = lines[0].split(";").map(h => h.trim());

      const rows = lines.slice(1).map(line => {
        const values = line.split(";");
        const obj = {};
        headers.forEach((h, i) => {
          obj[h] = values[i]?.trim() || "";
        });
        return obj;
      });

      onData(rows);
    };

    reader.readAsText(file);
  };

  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: 8,
        padding: 12,
        color: "#111827",
      }}
    >
      <h4 style={{ marginTop: 0, marginBottom: 8 }}>
        Subir CSV
      </h4>

      <p style={{ fontSize: 13, marginBottom: 10, color: "#374151" }}>
        Archivo con códigos SIGPAC por columnas
      </p>

      {/* INPUT OCULTO */}
      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        onChange={handleFile}
        style={{ display: "none" }}
      />

      {/* BOTÓN BONITO */}
      <button
        onClick={() => inputRef.current.click()}
        style={{
          width: "100%",
          padding: "10px 12px",
          background: "#2563eb",
          color: "white",
          border: "none",
          borderRadius: 6,
          cursor: "pointer",
          fontSize: 14,
          fontWeight: 500,
        }}
      >
        📁 Seleccionar archivo CSV
      </button>
    </div>
  );
}
