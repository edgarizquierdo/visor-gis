import React from "react";

export default function CsvUpload({ onData }) {
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      const text = reader.result;
      const lines = text.split("\n");
      const headers = lines[0].split(";").map(h => h.trim());

      const rows = lines.slice(1).map(line => {
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
        position: "fixed",   // ⬅️ CLAVE ABSOLUTA
        top: 12,
        left: 12,
        zIndex: 9999,
        background: "white",
        padding: 10,
        borderRadius: 6,
        boxShadow: "0 2px 10px rgba(0,0,0,0.3)"
      }}
    >
      <strong>Subir CSV</strong>
      <br />
      <input type="file" accept=".csv" onChange={handleFile} />
    </div>
  );
}
