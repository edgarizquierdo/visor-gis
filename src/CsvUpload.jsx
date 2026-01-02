import React, { useMemo, useState } from "react";
import Papa from "papaparse";

export default function CsvUpload({ onData }) {
  const [error, setError] = useState(null);
  const [ok, setOk] = useState(false);

  // Preview: columnas + 2 filas
  const [previewCols, setPreviewCols] = useState([]);
  const [previewRows, setPreviewRows] = useState([]);
  const [fileName, setFileName] = useState("");

  const TEMPLATE_URL = "/templates/plantilla_sigpac.csv";

  const cleanHeader = (h) =>
    (h ?? "")
      .toString()
      .replace(/^\uFEFF/, "") // BOM típico de Excel
      .trim();

  const detectDelimiter = (text) => {
    const firstLine =
      text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .find(Boolean) || "";
    const semis = (firstLine.match(/;/g) || []).length;
    const commas = (firstLine.match(/,/g) || []).length;
    return semis >= commas ? ";" : ",";
  };

  const parseHeadersAndTwoRows = async (fileOrUrl) => {
    let text = "";

    if (typeof fileOrUrl === "string") {
      const res = await fetch(fileOrUrl, { cache: "no-store" });
      text = await res.text();
    } else {
      text = await fileOrUrl.text();
    }

    const delimiter = detectDelimiter(text);

    return new Promise((resolve, reject) => {
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        delimiter,
        preview: 2, // solo 2 filas
        complete: (results) => {
          const fields = (results?.meta?.fields || []).map(cleanHeader);
          const rows = (results?.data || []).slice(0, 2);
          resolve({ fields, rows, delimiter, rawText: text });
        },
        error: (err) => reject(err),
      });
    });
  };

  const parseAllRows = async (file) => {
    const text = await file.text();
    const delimiter = detectDelimiter(text);

    return new Promise((resolve, reject) => {
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        delimiter,
        complete: (results) => {
          const data = (results?.data || []).map((row) => {
            // limpiar claves y valores
            const out = {};
            Object.keys(row || {}).forEach((k) => {
              const kk = cleanHeader(k);
              out[kk] = (row[k] ?? "").toString().trim();
            });
            return out;
          });
          resolve(data);
        },
        error: (err) => reject(err),
      });
    });
  };

  const handleFile = async (e) => {
    setError(null);
    setOk(false);

    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    try {
      // 1) Preview del CSV subido (SIEMPRE)
      const uploaded = await parseHeadersAndTwoRows(file);
      setPreviewCols(uploaded.fields);
      setPreviewRows(uploaded.rows);

      // 2) Headers de la plantilla oficial
      const template = await parseHeadersAndTwoRows(TEMPLATE_URL);

      const csvHeaders = uploaded.fields.map(cleanHeader);
      const templateHeaders = template.fields.map(cleanHeader);

      // 3) Comparar EXACTO (pero limpiando BOM/espacios)
      const sameLength = csvHeaders.length === templateHeaders.length;
      const sameOrder = csvHeaders.every((h, i) => h === templateHeaders[i]);

      if (!sameLength || !sameOrder) {
        throw new Error(
          "El CSV no coincide con la plantilla oficial. Revisa nombres y orden de columnas."
        );
      }

      // 4) Si es válido -> parsear TODO y mandar al padre
      const allRows = await parseAllRows(file);
      setOk(true);
      onData?.(allRows);
    } catch (err) {
      setOk(false);
      setError(err?.message || "Error al leer el archivo CSV.");
    }
  };

  const hasPreview = useMemo(
    () => previewCols.length > 0 || previewRows.length > 0,
    [previewCols, previewRows]
  );

  return (
    <div>
      {/* BOTÓN CSV (más pequeño y centrado) */}
      <label
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: "auto",
          minWidth: 220,
          maxWidth: "100%",
          background: "#3563E9",
          color: "white",
          padding: "10px 18px",
          borderRadius: 12,
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

      {fileName ? (
        <div
          style={{
            marginTop: 8,
            fontSize: 12,
            color: "#ffffff",
            opacity: 0.85,
          }}
        >
          Archivo: <strong>{fileName}</strong>
        </div>
      ) : null}

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
        href={TEMPLATE_URL}
        download
        style={{
          fontSize: 12,
          color: "#93c5fd",
          textDecoration: "underline",
          cursor: "pointer",
          display: "inline-block",
          marginBottom: 10,
        }}
      >
        Descargar plantilla CSV de ejemplo
      </a>

      {/* OK */}
      {ok && !error && (
        <div
          style={{
            marginTop: 10,
            padding: "8px 10px",
            borderRadius: 8,
            background: "#064e3b",
            color: "#a7f3d0",
            fontSize: 12,
          }}
        >
          ✅ CSV cargado correctamente.
        </div>
      )}

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

      {/* PREVIEW (columnas + 2 filas) */}
      {hasPreview && (
        <div style={{ marginTop: 12 }}>
          <div
            style={{
              fontSize: 12,
              color: "#ffffff",
              opacity: 0.9,
              marginBottom: 6,
              fontWeight: 700,
            }}
          >
            Preview (columnas + 2 filas)
          </div>

          {/* Columnas */}
          <div
            style={{
              display: "flex",
              gap: 6,
              flexWrap: "wrap",
              marginBottom: 10,
            }}
          >
            {previewCols.map((c, idx) => (
              <span
                key={`${c}-${idx}`}
                style={{
                  fontSize: 11,
                  color: "#e5e7eb",
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  padding: "4px 8px",
                  borderRadius: 999,
                  maxWidth: "100%",
                }}
                title={c}
              >
                {c}
              </span>
            ))}
          </div>

          {/* Tabla 2 filas con scroll */}
          <div
            style={{
              overflowX: "auto",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.10)",
              background: "rgba(0,0,0,0.12)",
            }}
          >
            <table
              style={{
                borderCollapse: "collapse",
                width: "max-content",
                minWidth: "100%",
                fontSize: 12,
                color: "#e5e7eb",
              }}
            >
              <thead>
                <tr>
                  {previewCols.map((h, i) => (
                    <th
                      key={i}
                      style={{
                        textAlign: "left",
                        padding: "8px 10px",
                        borderBottom: "1px solid rgba(255,255,255,0.10)",
                        whiteSpace: "nowrap",
                        fontWeight: 700,
                        color: "#ffffff",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={previewCols.length || 1}
                      style={{ padding: "10px", opacity: 0.8 }}
                    >
                      (No hay filas de datos)
                    </td>
                  </tr>
                ) : (
                  previewRows.map((row, r) => (
                    <tr key={r}>
                      {previewCols.map((h, c) => (
                        <td
                          key={c}
                          style={{
                            padding: "8px 10px",
                            borderBottom:
                              r === previewRows.length - 1
                                ? "none"
                                : "1px solid rgba(255,255,255,0.06)",
                            whiteSpace: "nowrap",
                            opacity: 0.95,
                          }}
                        >
                          {(row?.[h] ?? "").toString()}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
