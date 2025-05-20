import { useState, ChangeEvent } from "react";

export default function Home() {
  const [text, setText] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/parse", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.error || "Failed to parse file");
        setLoading(false);
        return;
      }

      const data = await res.json();
      setText(data.text);
    } catch {
      setError("Error uploading file");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6">Upload Your Resume</h1>

      <input
        type="file"
        accept=".pdf,.docx"
        onChange={handleFileUpload}
        className="mb-4"
      />

      {loading && <p className="text-blue-500">Extracting text…</p>}

      {error && <p className="text-red-600 mb-2">{error}</p>}

      {text && (
        <div className="w-full max-w-3xl bg-white p-6 rounded shadow mt-4 whitespace-pre-wrap">
          <h2 className="text-xl font-semibold mb-3">Resume Text Preview</h2>
          <pre className="text-gray-700 text-sm">{text}</pre>
        </div>
      )}
    </div>
  );
}
