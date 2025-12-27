import React, { useState } from "react";

const SIGPAC_COLUMNS = [
  "provincia",
  "municipio",
  "poligono",
  "parcela",
  "recinto",
];

export default function CsvUpload({ onData, onMeta }) {
  const [error, setError] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [previewRows, setPreviewRows] = useState([]);
  const [ok, setOk] = useState(false);

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
    setOk(false);

    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const csvHeaders = await readCsvHeaders(file);
      const templateHeaders = await readCsvHeaders(
        "/templates/plantilla_sigpac.csv"
      );

      const sameLength = csvHeaders.length === templateHeaders.length;
      const sameOrder = csvHeaders.every(
        (h, i) => h === templateHeaders[i]
      );

      if (!sameLength || !sameOrder) {
        throw new Error(
          "El CSV no coincide con la plantilla oficial. Revisa nombres y orden de columnas."
        );
      }

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

      setHeaders(parsedHeaders);
      setPreviewRows(rows.slice(0, 3));
      setOk(true);

      onData?.(rows);
      onMeta?.({ headers: parsedHeaders });
    } catch (err) {
      setError(err.message);
      setHeaders([]);
      setPreviewRows([]);
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
          margin: "0 auto",
          background: "#3563E9",
          color: "white",
          padding: "8px 14px",
          borderRadius: 10,
          cursor: "pointer",
          fontWeight: 600,
          fontSize: 13,
          boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
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

      {/* ESTADO OK */}
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
          ✔ CSV validado y cargado correctamente
        </div>
      )}

      {/* TEXTO */}
      <p
        style={{
          marginTop: 12,
          marginBottom: 6,
          fontSize: 12,
          color: "#ffffff",
          opacity: 0.9,
        }}
      >
        * El archivo debe tener las columnas{" "}
        <strong>estrictamente iguales</strong> que el modelo siguiente.
      </p>

      <a
        href="/templates/plantilla_sigpac.csv"
        download
        style={{
          fontSize: 12,
          color: "#93c5fd",
          textDecoration: "underline",
        }}
      >
        Descargar plantilla CSV de ejemplo
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

          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {headers.map((h) => {
              const isSigpac = SIGPAC_COLUMNS.includes(h.toLowerCase());
              return (
                <span
                  key={h}
                  style={{
                    fontSize: 11,
                    padding: "3px 6px",
                    borderRadius: 6,
                    background: isSigpac ? "#16a34a" : "#334155",
                    color: "white",
                  }}
                >
                  {h}
                </span>
              );
            })}
          </div>

          {/* 👇 CONTENEDOR CON SCROLL HORIZONTAL */}
          {previewRows.length > 0 && (
            <div
              style={{
                marginTop: 10,
                overflowX: "auto",
                width: "100%",
              }}
            >
              <table
                style={{
                  minWidth: "600px", // 👈 fuerza scroll si hay muchas columnas
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
                          textAlign: "left",
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
                            color: "#e5e7eb",
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
          )}
        </div>
      )}
    </div>
  );
}
