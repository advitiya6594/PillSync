/**
 * OpenFDA API service for drug label information
 * https://open.fda.gov/apis/drug/label/
 */

const OPENFDA_BASE = "https://api.fda.gov/drug/label.json";

/**
 * Get label snippets for a drug name
 * @param {string} drugName - Drug name
 * @returns {Promise<{warnings?: string, interactions?: string, patientInfo?: string}|null>}
 */
export async function getLabelSnippets(drugName) {
  try {
    // Search for brand name with oral route
    const searchTerm = encodeURIComponent(`openfda.brand_name:"${drugName.toUpperCase()}" AND openfda.route:ORAL`);
    const url = `${OPENFDA_BASE}?search=${searchTerm}&limit=1`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      // Silent fail on rate limit or not found
      if (response.status === 429) {
        console.warn(`[OpenFDA] Rate limited for "${drugName}"`);
      }
      return null;
    }
    
    const data = await response.json();
    const results = data?.results;
    
    if (!results || results.length === 0) {
      return null;
    }
    
    const label = results[0];
    const snippets = {};
    
    // Extract warnings and cautions (first 1-2 sentences)
    if (label.warnings_and_cautions && label.warnings_and_cautions.length > 0) {
      const text = label.warnings_and_cautions[0];
      snippets.warnings = extractFirstSentences(text, 2);
    }
    
    // Extract drug interactions
    if (label.drug_interactions && label.drug_interactions.length > 0) {
      const text = label.drug_interactions[0];
      snippets.interactions = extractFirstSentences(text, 2);
    }
    
    // Extract patient information
    if (label.information_for_patients && label.information_for_patients.length > 0) {
      const text = label.information_for_patients[0];
      snippets.patientInfo = extractFirstSentences(text, 2);
    }
    
    return Object.keys(snippets).length > 0 ? snippets : null;
  } catch (error) {
    console.error(`[OpenFDA] getLabelSnippets error for "${drugName}":`, error.message);
    return null;
  }
}

/**
 * Extract first N sentences from text
 * @param {string} text - Input text
 * @param {number} count - Number of sentences
 * @returns {string}
 */
function extractFirstSentences(text, count = 2) {
  if (!text) return "";
  
  // Split by periods, exclamation marks, or question marks
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  
  return sentences.slice(0, count).join(" ").trim();
}

