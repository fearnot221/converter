"use client";
import { useState } from "react";

const Home = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [logs, setLogs] = useState<string>("");

  const handleSplitPdf = async () => {
    if (!pdfFile) {
      alert("請上傳 PDF 檔案！");
      return;
    }

    const formData = new FormData();
    formData.append("pdfFile", pdfFile);
    if (csvFile) formData.append("csvFile", csvFile);

    setLogs("正在處理 PDF 分割...");

    const response = await fetch("/api/pdf-split", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "split_pdfs.zip";
      a.click();
      window.URL.revokeObjectURL(url);
      setLogs("處理完成，已下載 ZIP 檔案！");
    } else {
      setLogs("處理失敗，請檢查檔案格式！");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>PDF 分割工具</h1>
      <p>請上傳 PDF 檔案和對應的 CSV 檔案</p>

      <input
        type="file"
        accept=".pdf"
        onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
      />
      <input
        type="file"
        accept=".csv"
        onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
      />

      <button onClick={handleSplitPdf} disabled={!pdfFile}>
        開始分割 PDF
      </button>

      <p>{logs}</p>
    </div>
  );
};

export default Home;
