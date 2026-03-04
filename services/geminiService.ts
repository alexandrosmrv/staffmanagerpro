
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { BreakRecord, Staff } from "../types";

export const getBreakInsights = async (breaks: BreakRecord[], staff: Staff[]) => {
  if (breaks.length === 0) return "Δεν υπάρχουν αρκετά δεδομένα για ανάλυση.";

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const statsText = `
    Προσωπικό: ${JSON.stringify(staff.map(s => ({ name: s.name, role: s.role })))}
    Δεδομένα Διαλειμμάτων: ${JSON.stringify(breaks.map(b => ({
      name: b.staffName,
      date: b.date,
      b30_1: `${b.break30_1_From}-${b.break30_1_To}`,
      b10_1: `${b.break10_1_From}-${b.break10_1_To}`,
      shift: b.shift
    })))}
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: statsText,
      config: {
        systemInstruction: "Είσαι ένας έμπειρος Operations Manager. Ανάλυσε τα δεδομένα διαλειμμάτων και δώσε μια σύντομη αναφορά στα Ελληνικά σε Markdown. Εστίασε σε: 1. Σύνοψη ημέρας, 2. Πιθανά κενά στην κάλυψη (πολλά άτομα ταυτόχρονα σε διάλειμμα), 3. Προτάσεις βελτίωσης.",
      }
    });
    
    return response.text || "Δεν ήταν δυνατή η εξαγωγή συμπερασμάτων.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "⚠️ Σφάλμα AI: Βεβαιωθείτε ότι το API Key είναι σωστό στο αρχείο .env.";
  }
};
