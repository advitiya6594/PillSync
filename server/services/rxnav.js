/**
 * RxNav/RxNorm API service
 * https://rxnav.nlm.nih.gov/
 */

const RXNAV_BASE = "https://rxnav.nlm.nih.gov/REST";

/**
 * Get RxCUI (RxNorm Concept Unique Identifier) for a drug name
 * @param {string} name - Drug name
 * @returns {Promise<string|null>} - RxCUI or null if not found
 */
export async function getRxcuiByName(name) {
  try {
    const url = `${RXNAV_BASE}/rxcui.json?name=${encodeURIComponent(name)}&search=2`;
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`[RxNav] getRxcuiByName failed: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    const candidates = data?.idGroup?.rxnormId;
    
    if (!candidates || candidates.length === 0) {
      return null;
    }
    
    // Return the first (best) match
    return candidates[0];
  } catch (error) {
    console.error(`[RxNav] getRxcuiByName error for "${name}":`, error.message);
    return null;
  }
}

/**
 * Get drug interactions for a list of RxCUIs
 * @param {string[]} rxcuiList - Array of RxCUIs
 * @returns {Promise<Array<{drugA: string, drugB: string, severity: string, description: string, source: string}>|null>}
 */
export async function getInteractionsForRxcuiList(rxcuiList) {
  try {
    if (!rxcuiList || rxcuiList.length === 0) {
      return [];
    }
    
    const url = `${RXNAV_BASE}/interaction/list.json?rxcuis=${rxcuiList.join('+')}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`[RxNav] getInteractionsForRxcuiList failed: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    const interactions = [];
    
    // Parse the nested structure
    const fullInteractionTypeGroup = data?.fullInteractionTypeGroup;
    if (!fullInteractionTypeGroup || fullInteractionTypeGroup.length === 0) {
      return [];
    }
    
    for (const typeGroup of fullInteractionTypeGroup) {
      const fullInteractionType = typeGroup?.fullInteractionType;
      if (!fullInteractionType) continue;
      
      for (const interaction of fullInteractionType) {
        const minConcept = interaction?.minConcept || [];
        const interactionPair = interaction?.interactionPair || [];
        
        for (const pair of interactionPair) {
          const drugA = minConcept[0]?.name || "Unknown";
          const drugB = minConcept[1]?.name || "Unknown";
          const description = pair?.description || "No description available";
          const severity = pair?.severity || "N/A";
          
          interactions.push({
            drugA,
            drugB,
            severity,
            description,
            source: "RxNav"
          });
        }
      }
    }
    
    return interactions;
  } catch (error) {
    console.error(`[RxNav] getInteractionsForRxcuiList error:`, error.message);
    return null;
  }
}

/**
 * Get RxClass members by class ID (optional - for fetching CYP3A4 inducers)
 * @param {string} classId - RxClass ID
 * @returns {Promise<Array<{rxcui: string, name: string}>|null>}
 */
export async function getRxClassMembers(classId) {
  try {
    const url = `${RXNAV_BASE}/rxclass/classMembers.json?classId=${classId}&relaSource=ATC`;
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`[RxNav] getRxClassMembers failed: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    const members = [];
    
    const drugMemberGroup = data?.drugMemberGroup?.drugMember;
    if (!drugMemberGroup || drugMemberGroup.length === 0) {
      return [];
    }
    
    for (const member of drugMemberGroup) {
      const minConcept = member?.minConcept;
      if (minConcept?.rxcui && minConcept?.name) {
        members.push({
          rxcui: minConcept.rxcui,
          name: minConcept.name
        });
      }
    }
    
    return members;
  } catch (error) {
    console.error(`[RxNav] getRxClassMembers error:`, error.message);
    return null;
  }
}

