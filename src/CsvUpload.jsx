import { useState } from "react";
import Papa from "papaparse";

const TEMPLATE_COLUMNS = [
  "Código provincia",
  "Código municipio",
  "Polígono",
  "Parcela",
];

export default function CsvUpload({ onValidCsv }) {
  const [error, setError] = useState(null);
  const [file, setFile] = useState(null);
  const [isValid, setIsValid] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setError(null);
    setIsValid(false);

    if (!selectedFile) return;

    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const csvColumns = results.meta.fields || [];

        // 🔒 VALIDACIÓN ROBUSTA (SIN TOCAR JSX NI ESTILOS)
        const normalize = (s) =>
          s.toString().trim().toLowerCase();

        const csvCols = csvColumns.map(normalize);
        const required = TEMPLATE_COLUMNS.map(normalize);

        const missing = required.filter(
          (col) => !csvCols.includes(col)
        );

        if (missing.length > 0) {
          setError(
            "El CSV no coincide con la plantilla SIGPAC. Revisa nombres y orden de columnas."
          );
          return;
        }

        // ✅ CSV válido
        setFile(selectedFile);
        setIsValid(true);
        onValidCsv && onValidCsv(selectedFile);
      },
      error: () => {
        setError("Error al leer el archivo CSV.");
      },
    });
  };

  return (
    <>
      {/* ⚠️ JSX ORIGINAL — NO TOCAR */}
      <input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        style={{ display: "none" }}
        id="csv-upload"
      />

      <label htmlFor="csv-upload" className="csv-upload-button">
        📁 Seleccionar archivo CSV
      </label>

      {file && <span style={{ marginLeft: 10 }}>{file.name}</span>}

      <p className="csv-hint">
        * El archivo debe tener las columnas exactamente iguales que la plantilla.
      </p>

      <a
        href="/plantilla_sigpac.csv"
        download
        className="csv-download"
      >
        Descargar plantilla CSV
      </a>

      {error && (
        <div className="csv-error">
          ⚠️ {error}
        </div>
      )}

      <button
        className="csv-submit"
        disabled={!isValid}
      >
        Enviar al servidor
      </button>
    </>
  );
}
