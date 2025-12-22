import React from "react";

export default function CsvUpload({ onData }) {
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      const text = reader.result;
      const lines = text.split("\n");
      const headers = lines[0].split(";").map((h) => h.trim());

      const rows = lines.slice(1).map((line) => {
        const values = line.split(";");
        const obj = {};
        headers.forEach((h, i) => {
          obj[h] = values[i]?.trim();
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
        background: "white",
        color: "#111",
        borderRadius: 12,
        padding: 20,
        maxWidth: 300,
      }}
    >
      <h3 style={{ marginTop: 0 }}>Subir CSV</h3>
      <p style={{ marginTop: 4, marginBottom: 16, fontSize: 14 }}>
        Archivo con códigos SIGPAC por columnas
      </p>

      {/* BOTÓN ESTILO FOTO B */}
      <label
        style={{
          display: "block",
          background: "#3b66e3",
          color: "white",
          padding: "14px 18px",
          borderRadius: 10,
          textAlign: "center",
          cursor: "pointer",
          fontSize: 16,
          fontWeight: 500,
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
    </div>
  );
}
