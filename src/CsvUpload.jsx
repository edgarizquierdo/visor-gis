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
    <div>
      <input type="file" accept=".csv" onChange={handleFile} />
    </div>
  );
}
