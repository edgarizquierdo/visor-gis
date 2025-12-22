import React, { useState } from "react";

export default function CsvUpload({ onData }) {
  const [error, setError] = useState(null);

  const readCsvHeaders = async (fileOrUrl) => {
    let text = "";

    if (typeof fileOrUrl === "string") {
      const res = await fetch(fileOrUrl);
      text = await res.text();
    } else {
      text = await fileOrUrl.text();
    }

    const firstLine = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .find(Boolean);

    if (!firstLine) return [];

    return firstLine.split(";").map((h) => h.trim());
  };

  const handleFile = async (e) => {
    setError(null);

    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // 1️⃣ Leer cabeceras del CSV subido
      const csvHeaders = await readCsvHeaders(file);

      // 2️⃣ Leer cabeceras de la plantilla oficial
      const templateHeaders = await readCsvHeaders(
        "/templates/plantilla_sigpac.csv"
      );

      // 3️⃣ Comparar EXACTO
      const sameLength = csvHeaders.length === templateHeaders.length;
      const sameOrder = csvHeaders.every(
        (h, i) => h === templateHeaders[i]
      );

      if (!sameLength || !sameOrder) {
        throw new Error(
          "El CSV no coincide con la plantilla oficial. Revisa nombres y orden de columnas."
        );
      }

      // 4️⃣ Parsear CSV completo
      const text = await file.text();
      const lines = text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);

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
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      {/* BOTÓN CSV */}
      <label
        style={{
          display: "block",
          width: "100%",
          background: "#3563E9",
          color: "white",
          padding: "10px 14px",
          borderRadius: 10,
          cursor: "pointer",
          textAlign: "center",
          fontWeight: 700,
          fontSize: 14,
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

      {/* TEXTO DESCRIPTIVO */}
      <p
        style={{
          marginTop: 12,
          marginBottom: 6,
          fontSize: 12,
          lineHeight: 1.4,
          color: "#ffffff",
          opacity: 0.9,
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
          color: "#93c5fd",
          textDecoration: "underline",
          cursor: "pointer",
        }}
      >
        Descargar plantilla CSV de ejemplo
      </a>

      {/* ERROR */}
      {error && (
        <div
          style={{
            marginTop: 10,
            padding: "8px 10px",
            borderRadius: 8,
            background: "#7f1d1d",
            color: "#fecaca",
            fontSize: 12,
          }}
        >
          ⚠️ {error}
        </div>
      )}
    </div>
  );
}
