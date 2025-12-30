import React, { useState } from "react";

const REQUIRED_COLUMNS = [
  "provincia",
  "municipio",
  "poligono",
  "parcela",
  "recinto",
];

export default function CsvUpload({ onData }) {
  const [error, setError] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [previewRows, setPreviewRows] = useState([]);
  const [ok, setOk] = useState(false);

  // Lee solo la primera línea de un CSV
  const readHeaders = async (fileOrUrl) => {
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
    setOk(false);
    setHeaders([]);
    setPreviewRows([]);

    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // 1️⃣ Leer cabeceras del CSV subido
      const csvHeaders = await readHeaders(file);

      // 2️⃣ Leer cabeceras de la plantilla oficial
      const templateHeaders = await readHeaders(
        "/templates/plantilla_sigpac.csv"
      );

      // 3️⃣ Validación estricta
      const sameLength = csvHeaders.length === templateHeaders.length;
      const sameOrder = csvHeaders.every(
        (h, i) => h === templateHeaders[i]
      );

      if (!sameLength || !sameOrder) {
        throw new Error(
          "El CSV no coincide con la plantilla SIGPAC. Revisa nombres y orden de columnas."
        );
      }

      // 4️⃣ Parsear filas
      const text = await file.text();
      const lines = text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);

      const parsedHeaders = lines[0].split(";").map((h) => h.trim());

      const rows = lines.slice(1).map((line) => {
        const values = line.split(";");
        const obj = {};
        parsedHeaders.forEach((h, i) => {
          obj[h] = (values[i] ?? "").trim();
        });
        return obj;
      });

      // 5️⃣ Estado OK
      setHeaders(parsedHeaders);
      setPreviewRows(rows.slice(0, 3));
      setOk(true);

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
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          maxWidth: 260,
          background: "#2563eb",
          color: "white",
          padding: "8px 14px",
          borderRadius: 10,
          cursor: "pointer",
          fontWeight: 600,
          fontSize: 13,
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

      {/* OK */}
      {ok && (
        <div
          style={{
            marginTop: 10,
            padding: "6px 10px",
            borderRadius: 8,
            background: "#14532d",
            color: "#bbf7d0",
            fontSize: 12,
          }}
        >
          ✔ CSV validado correctamente
        </div>
      )}

      {/* TEXTO */}
      <p style={{ marginTop: 12, fontSize: 12, color: "#e5e7eb" }}>
        * El archivo debe tener las columnas{" "}
        <strong>exactamente iguales</strong> que la plantilla.
      </p>

      <a
        href="/templates/plantilla_sigpac.csv"
        download
        style={{ fontSize: 12, color: "#93c5fd" }}
      >
        Descargar plantilla CSV
      </a>

      {/* ERROR */}
      {error && (
        <div
          style={{
            marginTop: 10,
            padding: "8px",
            borderRadius: 8,
            background: "#7f1d1d",
            color: "#fecaca",
            fontSize: 12,
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {/* PREVIEW */}
      {headers.length > 0 && (
        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 12, marginBottom: 6 }}>
            Columnas detectadas:
          </div>

          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {headers.map((h) => (
              <span
                key={h}
                style={{
                  fontSize: 11,
                  padding: "3px 6px",
                  borderRadius: 6,
                  background: REQUIRED_COLUMNS.includes(h)
                    ? "#16a34a"
                    : "#334155",
                  color: "white",
                }}
              >
                {h}
              </span>
            ))}
          </div>

          {/* PREVIEW TABLA */}
          <div style={{ marginTop: 10, overflowX: "auto" }}>
            <table
              style={{
                minWidth: 600,
                fontSize: 11,
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr>
                  {headers.map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "6px 8px",
                        borderBottom: "1px solid #475569",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewRows.map((row, i) => (
                  <tr key={i}>
                    {headers.map((h) => (
                      <td
                        key={h}
                        style={{
                          padding: "6px 8px",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {row[h]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
