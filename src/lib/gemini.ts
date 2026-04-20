export interface InvoiceData {
  invoice_number: string | null;
  invoice_date: string | null;
  seller_name: string | null;
  seller_gstin: string | null;
  buyer_name: string | null;
  buyer_gstin: string | null;
  taxable_amount: number | null;
  cgst: number | null;
  sgst: number | null;
  igst: number | null;
  total_amount: number | null;
  currency: string | null;
}

const PROMPT = `You are a GST invoice data extractor. Extract the following fields from this invoice and return ONLY a valid JSON object with no extra text: invoice_number, invoice_date, seller_name, seller_gstin, buyer_name, buyer_gstin, taxable_amount, cgst, sgst, igst, total_amount, currency. If a field is not found, return null for that field.`;

export const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export async function extractInvoice(file: File, apiKey: string): Promise<InvoiceData> {
  const base64 = await fileToBase64(file);
  const mimeType = file.type || (file.name.endsWith(".pdf") ? "application/pdf" : "image/jpeg");

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const body = {
    contents: [
      {
        parts: [
          { text: PROMPT },
          { inline_data: { mime_type: mimeType, data: base64 } },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.1,
      responseMimeType: "application/json",
    },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error: ${res.status} ${err}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Empty response from Gemini");

  // Strip markdown fences if present
  const cleaned = text.replace(/```json\s*|\s*```/g, "").trim();
  return JSON.parse(cleaned) as InvoiceData;
}

export async function validateApiKey(apiKey: string): Promise<boolean> {
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );
    return res.ok;
  } catch {
    return false;
  }
}
