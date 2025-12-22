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

      // Tu CSV parece venir con ; como separador
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
    <label
      style={{
        display: "block",
        width: "100%",
        boxSizing: "border-box",
        background: "#3563E9",
        color: "white",
        padding: "14px 16px",
        borderRadius: 10,
        cursor: "pointer",
        textAlign: "center",
        fontWeight: 700,
        fontSize: 16,
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
  );
}
