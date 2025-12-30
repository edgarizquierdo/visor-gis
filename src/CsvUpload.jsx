import React, { useState } from "react";
import Papa from "papaparse";

const REQUIRED_COLUMNS = [
  "codigo provincia",
  "codigo municipio",
  "poligono",
  "parcela",
];

// normaliza headers (clave)
const normalize = (str) =>
  str
    .replace("\ufeff", "") // BOM
    .trim()
    .toLowerCase();

export default function CsvUpload() {
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [valid, setValid] = useState(false);

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;

    Papa.parse(f, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const headers = results.meta.fields.map(normalize);

        const missing = REQUIRED_COLUMNS.filter(
          (col) => !headers.includes(col)
        );

        if (missing.length > 0) {
          setError(
            `Faltan columnas obligatorias: ${missing.join(", ")}`
          );
          setValid(false);
        } else {
          setError(null);
          setValid(true);
          setFile(f);
        }
      },
      error: () => {
        setError("Error leyendo el CSV");
        setValid(false);
      },
    });
  };

  const sendToBackend = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    await fetch("http://127.0.0.1:8000/parcels/sigpac", {
      method: "POST",
      body: formData,
    });
  };

  return (
    <div>
      <input type="file" accept=".csv" onChange={handleFile} />

      {error && (
        <div style={{ color: "orange", marginTop: 10 }}>
          ⚠️ {error}
        </div>
      )}

      <button
        onClick={sendToBackend}
        disabled={!valid}
        style={{ marginTop: 10 }}
      >
        Enviar al servidor
      </button>
    </div>
  );
}
