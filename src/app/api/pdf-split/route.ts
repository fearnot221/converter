// app/api/pdf-split/route.ts
import { PDFDocument } from "pdf-lib";
import Papa, { ParseResult } from "papaparse";
import JSZip from "jszip";
import { NextResponse } from "next/server";

export const config = {
  api: {
    bodyParser: false, // 禁用自動解析
  },
};
const parseCSV = async (csvBuffer: Buffer): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const csvString = csvBuffer.toString("utf-8");
    Papa.parse(csvString, {
      header: false,
      complete: (result: ParseResult<any>) => {
        resolve(result.data.map((row: any) => row[0]));
      },
      error: reject,
    });
  });
};

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";
    const boundary = contentType.split("boundary=")?.[1];

    if (!boundary) throw new Error("Boundary not found in Content-Type");

    const formDataBuffer = Buffer.from(await req.arrayBuffer());

    // 解析 multipart/form-data
    const parts = formDataBuffer.toString("binary").split(`--${boundary}`);
    const pdfBuffer = Buffer.from(
      parts
        .find((part) => part.includes("application/pdf"))
        ?.split("\r\n\r\n")?.[1] || "",
      "binary"
    );
    const csvBuffer = Buffer.from(
      parts.find((part) => part.includes("text/csv"))?.split("\r\n\r\n")?.[1] ||
        "",
      "binary"
    );

    if (!pdfBuffer) {
      return NextResponse.json({ error: "PDF 檔案缺失" }, { status: 400 });
    }

    const pdfDoc = await PDFDocument.load(pdfBuffer);

    const zip = new JSZip();

    // 使用類型註釋來指定 rows 的結構
    const csvData = await parseCSV(csvBuffer);
    const pageCount = pdfDoc.getPageCount();
    const PDFTitle = pdfDoc.getTitle();

    for (let i = 0; i < pageCount; i++) {
      const newPdf = await PDFDocument.create();
      const [page] = await newPdf.copyPages(pdfDoc, [i]);
      newPdf.addPage(page);

      const pdfBytes = await newPdf.save();

      let filename;
      if (csvData.length > 0) {
        filename = `${csvData[i]}.pdf`;
      } else {
        filename = `${PDFTitle}-${i + 1}.pdf`;
      }

      zip.file(filename, pdfBytes);
    }

    const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });

    return new Response(zipBuffer, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": "attachment; filename=split_pdfs.zip",
      },
    });
  } catch (error) {
    console.error("分割 PDF 時出錯：", error);
    return NextResponse.json({ error: "處理失敗" }, { status: 500 });
  }
}
