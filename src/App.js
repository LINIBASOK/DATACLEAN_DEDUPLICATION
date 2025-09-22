
import React, { useState } from "react";
import Papa from "papaparse";
import './App.css'; 
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { cleanAndMergeData } from "./utils/dataUtils";

function App() {
  const [fileData, setFileData] = useState({
    file1: [],
    file2: [],
    file3: [],
  });

  const handleFileUpload = (file, fileKey) => {
    const reader = new FileReader();
    const ext = file.name.split(".").pop();

    reader.onload = (e) => {
      if (ext === "csv" || ext === "txt") {
        Papa.parse(e.target.result, {
          header: true,
          delimiter: ext === "txt" ? "\t" : ",",
          skipEmptyLines: true,
          complete: (result) => {
            setFileData((prev) => ({ ...prev, [fileKey]: result.data }));
          },
        });
      } else if (ext === "xlsx") {
        const workbook = XLSX.read(e.target.result, { type: "binary" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(sheet);
        setFileData((prev) => ({ ...prev, [fileKey]: data }));
      }
    };

    if (ext === "xlsx") reader.readAsBinaryString(file);
    else reader.readAsText(file);
  };

  const handleProcess = () => {
    const finalData = cleanAndMergeData(
      fileData.file1,
      fileData.file2,
      fileData.file3
    );

    const csv = Papa.unparse(finalData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "cleaned_dataset.csv");
  };

  return (
    <div style={{ padding: 40 }}>
      <h1> Data Cleaner & Deduplicator</h1>

      <div>
        <label>Upload File 1 (CSV): </label>
        <input
          type="file"
          accept=".csv"
          onChange={(e) => handleFileUpload(e.target.files[0], "file1")}
        />
      </div>

      <div>
        <label>Upload File 2 (XLSX): </label>
        <input
          type="file"
          accept=".xlsx"
          onChange={(e) => handleFileUpload(e.target.files[0], "file2")}
        />
      </div>

      <div>
        <label>Upload File 3 (TXT - tab-delimited): </label>
        <input
          type="file"
          accept=".txt"
          onChange={(e) => handleFileUpload(e.target.files[0], "file3")}
        />
      </div>

      <br />
      <button onClick={handleProcess}> Clean & Export CSV</button>
    </div>
  );
}

export default App;
