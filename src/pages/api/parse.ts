import type { NextApiRequest, NextApiResponse } from "next";
import formidable, { File } from "formidable";
import fs from "fs";
import pdfParse from "pdf-parse";
import mammoth from "mammoth";

export const config = {
  api: {
    bodyParser: false, // important for file uploads
  },
};

type Data =
  | { text: string }
  | { error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      res.status(500).json({ error: "Error parsing the file" });
      return;
    }

    // formidable typings sometimes unclear, handle both array and single file cases:
    const uploaded = files.file;
    const file: File | null = Array.isArray(uploaded)
      ? uploaded[0] || null
      : (uploaded as unknown as File) || null;

    if (!file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }

    const ext = file.originalFilename?.split(".").pop()?.toLowerCase();

    try {
      const fileBuffer = fs.readFileSync(file.filepath);
      let text = "";

      if (ext === "pdf") {
        const data = await pdfParse(fileBuffer);
        text = data.text;
      } else if (ext === "docx") {
        const result = await mammoth.extractRawText({ buffer: fileBuffer });
        text = result.value;
      } else {
        res.status(400).json({ error: "Unsupported file type" });
        return;
      }

      res.status(200).json({ text });
    } catch {
      res.status(500).json({ error: "Failed to parse resume" });
    }
  });
}
