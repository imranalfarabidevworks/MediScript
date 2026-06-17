import type { MedicalRecord, Medicine, TestResult } from "@/types";

const SYSTEM_PROMPT = `
You are a medical document parser. 
Extract data from the prescription image and return ONLY valid JSON with this exact structure:
{
  "doctorName": "string",
  "date": "YYYY-MM-DD",
  "patientCase": "string",
  "vitalSigns": {"bloodPressure": "string", "heartRate": "string", "respiratoryRate": "string"},
  "medicines": [{"name": "string", "dosage": "string", "duration": "string", "category": "string"}],
  "testResults": [{"testName": "string", "value": "string", "unit": "string"}]
}
Rules:
- doctorName: extract doctor's name from the prescription header
- date: convert any date format to YYYY-MM-DD
- patientCase: clinical description or diagnosis
- medicines: extract all medicines with name, dosage, duration. For category use one of: Antibiotic, Painkiller, Antihistamine, Antacid, Vitamin, Other
- If a field is not found, use empty string or empty array
- Return ONLY the JSON object, no markdown, no backticks, no explanation
`;

export async function parsePrescriptionFromBase64(
  base64Data: string,
  mimeType: string
): Promise<Partial<MedicalRecord>> {

  const base64Clean = base64Data.includes(",") ? base64Data.split(",")[1] : base64Data;

  const requestBody = {
    contents: [{
      parts: [
        { text: SYSTEM_PROMPT },
        { inline_data: { mime_type: mimeType, data: base64Clean } }
      ]
    }],
    generationConfig: {
      temperature: 0.1,
    },
  };

  try {
    const res = await fetch("/api/gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    const data = await res.json();

    // Extract text from response
    let rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

    // Clean markdown if any
    rawText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();

    let parsed: any = {};
    try {
      parsed = JSON.parse(rawText);
    } catch (e) {
      console.error("JSON Parse Error:", e);
      console.error("Raw text was:", rawText);
    }

    return {
      doctorName: parsed.doctorName || "Unknown",
      date: parsed.date || new Date().toISOString().split("T")[0],
      patientCase: parsed.patientCase || "No summary",
      vitalSigns: parsed.vitalSigns || {},
      medicines: sanitizeMedicines(parsed.medicines),
      testResults: sanitizeTestResults(parsed.testResults),
    };

  } catch (error) {
    console.error("Fetch Error:", error);
    return { doctorName: "Error", patientCase: "Failed to parse" };
  }
}

function sanitizeMedicines(raw: any[]): Medicine[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((m) => ({
    name: m?.name || "Unknown",
    dosage: m?.dosage || "N/A",
    duration: m?.duration || "N/A",
    category: m?.category || "Other",
  }));
}

function sanitizeTestResults(raw: any[]): TestResult[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((t) => ({
    testName: t?.testName || "Unknown",
    value: t?.value || "N/A",
    unit: t?.unit || "",
    referenceRange: t?.referenceRange || "",
  }));
}