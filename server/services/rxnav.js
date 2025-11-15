// RxNav/RxNorm API integration for drug information

export async function getRxcuiByName(name) {
  try {
    const url = `https://rxnav.nlm.nih.gov/REST/rxcui.json?name=${encodeURIComponent(name)}&search=2`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    // Return first RxCUI if available
    return data?.idGroup?.rxnormId?.[0] || null;
  } catch (err) {
    console.warn(`[RxNav] getRxcuiByName failed for "${name}":`, err.message);
    return null;
  }
}

export async function getInteractionsForRxcuiList(rxcuiList) {
  if (!rxcuiList || rxcuiList.length === 0) return [];
  
  try {
    const rxcuis = rxcuiList.filter(Boolean).join('+');
    const url = `https://rxnav.nlm.nih.gov/REST/interaction/list.json?rxcuis=${rxcuis}`;
    const res = await fetch(url);
    if (!res.ok) return [];
    
    const data = await res.json();
    const pairs = data?.fullInteractionTypeGroup?.[0]?.fullInteractionType || [];
    
    const normalized = [];
    for (const type of pairs) {
      const items = type?.interactionPair || [];
      for (const pair of items) {
        normalized.push({
          drugA: pair.interactionConcept?.[0]?.minConceptItem?.name || "Unknown",
          drugB: pair.interactionConcept?.[1]?.minConceptItem?.name || "Unknown",
          severity: pair.severity || "N/A",
          description: pair.description || "No description available",
          source: type.sourceName || "RxNav"
        });
      }
    }
    
    return normalized;
  } catch (err) {
    console.warn(`[RxNav] getInteractionsForRxcuiList failed:`, err.message);
    return [];
  }
}

// Helper: Convert multiple drug names to RxCUIs
export async function namesToRxcuis(names) {
  const rxcuis = [];
  for (const name of names) {
    const rxcui = await getRxcuiByName(name);
    if (rxcui) rxcuis.push(rxcui);
  }
  return rxcuis;
}

// Optional: Get members of an RxClass
export async function getRxClassMembers(classId) {
  try {
    const url = `https://rxnav.nlm.nih.gov/REST/rxclass/classMembers.json?classId=${classId}&relaSource=ATC`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return data?.drugMemberGroup?.drugMember || [];
  } catch (err) {
    console.warn(`[RxNav] getRxClassMembers failed:`, err.message);
    return [];
  }
}
