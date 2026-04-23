/**
 * Kuratiertes Cross-Linking zwischen Branchen und Prüfaufgaben.
 * Single Source of Truth — die Umkehrung (Prüfaufgabe → Branchen) wird
 * automatisch abgeleitet.
 *
 * Reihenfolge innerhalb einer Branche = Priorität (erster = relevantester).
 */

export const brancheToPruefaufgaben: Record<string, string[]> = {
  'automotive': ['hairpin-stator-pruefung', 'porositaetsanalyse', 'cad-soll-ist-vergleich', 'erstmusterpruefbericht', 'wanddickenmessung'],
  'e-mobilitaet': ['hairpin-stator-pruefung', 'schweissnahtpruefung', 'montage-fuegekontrolle', 'porositaetsanalyse', 'wanddickenmessung'],
  'luftfahrt': ['porositaetsanalyse', 'wanddickenmessung', 'cad-soll-ist-vergleich', 'reverse-engineering', 'schweissnahtpruefung'],
  'medizintechnik': ['erstmusterpruefbericht', 'porositaetsanalyse', 'wanddickenmessung', '3d-vermessung', 'cad-soll-ist-vergleich'],
  'maschinenbau': ['cad-soll-ist-vergleich', 'reverse-engineering', 'erstmusterpruefbericht', 'porositaetsanalyse', 'montage-fuegekontrolle'],
  'additive-fertigung': ['porositaetsanalyse', 'wanddickenmessung', 'cad-soll-ist-vergleich', 'reverse-engineering', 'form-und-lagetoleranzen'],
  'elektronik': ['laminographie', 'montage-fuegekontrolle', 'schweissnahtpruefung', 'grat-kernreste-spaene'],
  'eisenguss': ['porositaetsanalyse', 'grat-kernreste-spaene', 'wanddickenmessung', 'cad-soll-ist-vergleich', 'erstmusterpruefbericht'],
  'leichtmetallguss': ['porositaetsanalyse', 'grat-kernreste-spaene', 'wanddickenmessung', 'cad-soll-ist-vergleich', 'erstmusterpruefbericht'],
  'kunststofftechnik': ['porositaetsanalyse', 'wanddickenmessung', 'cad-soll-ist-vergleich', 'form-und-lagetoleranzen', 'montage-fuegekontrolle'],
  'werkstoffpruefung': ['porositaetsanalyse', 'wanddickenmessung', 'form-und-lagetoleranzen', 'reverse-engineering', '3d-vermessung'],
  'windenergie': ['schweissnahtpruefung', 'porositaetsanalyse', 'wanddickenmessung', 'cad-soll-ist-vergleich', 'montage-fuegekontrolle'],
  'archaeologie': ['3d-vermessung', 'reverse-engineering', 'wanddickenmessung', 'porositaetsanalyse'],
  'forschung-entwicklung': ['3d-vermessung', 'reverse-engineering', 'cad-soll-ist-vergleich', 'erstmusterpruefbericht', 'form-und-lagetoleranzen'],
};

// Automatisch abgeleitet: welche Branchen verweisen auf eine bestimmte Prüfaufgabe?
// Reihenfolge = Reihenfolge im Quell-Mapping oben.
export const pruefaufgabeToBranchen: Record<string, string[]> = (() => {
  const reverse: Record<string, string[]> = {};
  for (const [branche, pruefaufgaben] of Object.entries(brancheToPruefaufgaben)) {
    for (const p of pruefaufgaben) {
      if (!reverse[p]) reverse[p] = [];
      if (!reverse[p].includes(branche)) reverse[p].push(branche);
    }
  }
  return reverse;
})();

export function getPruefaufgabenForBranche(slug: string): string[] {
  return brancheToPruefaufgaben[slug] ?? [];
}

export function getBranchenForPruefaufgabe(slug: string): string[] {
  return pruefaufgabeToBranchen[slug] ?? [];
}
