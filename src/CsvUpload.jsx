import Papa from "papaparse";

export default function CsvUpload({ onData }) {
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        onData(results.data);
      },
    });
  };

  return (
    <div style={{ padding: 12, background: "#f5f5f5" }}>
      <strong>Subir CSV SIGPAC</strong>
      <br />
      <input type="file" accept=".csv" onChange={handleFile} />
    </div>
  );
}
