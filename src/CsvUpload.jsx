export default function CsvUpload({ onData }) {
  return (
    <div
      style={{
        position: "absolute",
        top: 20,
        left: 20,
        zIndex: 9999,
        background: "red",
        color: "white",
        padding: 12,
        fontSize: 16,
      }}
    >
      CSV UPLOAD VISIBLE
      <br />
      <input type="file" />
    </div>
  );
}
