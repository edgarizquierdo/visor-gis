import { useState } from "react";
import Papa from "papaparse";

const SIGPAC_TEMPLATE = [
  "Código provincia",
  "Código municipio",
  "Polígono",
  "Parcela",
];

export default function CsvUploadSigpac() {
  const [csvFile, setCsvFile] = useState(null);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // =========================
  // VALIDAR CSV
  // =========================
  const validateSigpacCSV = (file) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const headers = results.meta.fields || [];

        const isValid =
          headers.length === SIGPAC_TEMPLATE.length &&
          headers.every((h, i) => h.trim() === SIGPAC_TEMPLATE[i]);

        if (!isValid) {
          setError(
            "El CSV no coincide con la plantilla SIGPAC. Revisa nombres y orden de columnas."
          );
          setCsvFile(null);
          setStatus(null);
          return;
        }

        setCsvFile(file);
        setError(null);
        setStatus("CSV cargado correctamente ✅");
      },
    });
  };

  // =========================
  // SUBIR AL BACKEND
  // =========================
  const uploadToBackend = async () => {
    if (!csvFile) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", csvFile);

      const res = await fetch("http://127.0.0.1:8000/parcels/sigpac", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Error procesando SIGPAC");
      }

      const data = await res.json();
      console.log("SIGPAC GeoJSON:", data);

      setStatus(`Parcelas SIGPAC cargadas (${data.features.length}) ✅`);
    } catch (err) {
      setError("Error al procesar SIGPAC en el servidor");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // RENDER
  // =========================
  return (
    <div className="bg-slate-800 rounded-xl p-4 text-white">
      <h2 className="text-xl font-semibold mb-3">Datos SIGPAC</h2>

      {/* BOTÓN CSV */}
      <label className="block">
        <input
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) validateSigpacCSV(file);
          }}
        />
        <div className="cursor-pointer bg-blue-600 hover:bg-blue-700 transition text-center py-3 rounded-lg font-medium">
          📁 Seleccionar archivo CSV
        </div>
      </label>

      {/* AYUDA */}
      <p className="text-sm text-slate-300 mt-2">
        * El archivo debe tener las columnas exactamente iguales que la
        plantilla.
      </p>

      <a
        href="/plantilla_sigpac.csv"
        download
        className="text-blue-400 underline text-sm mt-1 inline-block"
      >
        Descargar plantilla CSV
      </a>

      {/* ESTADOS */}
      {status && (
        <div className="mt-4 bg-green-700/30 text-green-300 p-3 rounded">
          {status}
        </div>
      )}

      {error && (
        <div className="mt-4 bg-red-800 text-white p-3 rounded">
          ⚠️ {error}
        </div>
      )}

      {/* BOTÓN ENVIAR */}
      <button
        disabled={!csvFile || loading}
        onClick={uploadToBackend}
        className={`mt-4 w-full py-3 rounded-lg font-semibold transition
          ${
            !csvFile || loading
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          }`}
      >
        {loading ? "Procesando SIGPAC..." : "Enviar al servidor"}
      </button>
    </div>
  );
}
