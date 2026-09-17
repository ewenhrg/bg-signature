/**
 * Fill Bulgarian activity names (professional tourism wording).
 * Descriptions fall back to French in the UI until translated.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.resolve(__dirname, "../data/activities.json");

const NAME_BG = {
  AQUARIUM: "Аквариум",
  "Boat party": "Boat party",
  "BUGGY + SHOW": "Бъги + шоу",
  "BUGGY SAFARI MATIN": "Бъги сафари сутрин",
  "CAIRE ANCIEN MUSEE": "Кайро — Стар музей",
  "CAIRE AVION ANCIEN MUSEE": "Кайро със самолет — Стар музей",
  "CAIRE AVION NOUVEAU MUSEE": "Кайро със самолет — Нов музей",
  "CAIRE BUS": "Кайро с автобус",
  "CAIRE NOUVEAU MUSEE": "Кайро — Нов музей",
  "CAIRE OVERNIGHT": "Кайро с нощувка",
  "CALECHE + SHOW": "Каляска + шоу",
  "CHEVAL SHOW": "Конно шоу",
  "COMBO AQUATIQUE": "Воден комбо пакет",
  "DOLPHIN HOUSE": "Dolphin House",
  "DOLPHIN NAGE": "Плуване с делфини",
  "DOLPHIN PHOTO": "Снимка с делфин",
  "DOLPHIN SHOW": "Шоу с делфини",
  "EDEN ISLAND": "Остров Eden",
  "EL GOUNA": "Ел Гуна",
  "EVASION SPA": "СПА Evasion",
  "Family Day Out": "Семеен ден",
  "FANTASTIQUE SAHARA": "Фантастична Сахара",
  "Free quad": "Безплатно атв",
  "Hamman marocain": "Марокански хамам",
  "HORS ZONE - AERPORT 7 pax": "Извън зона — летище 7 души",
  "HULA HULA": "Hula Hula",
  "HURGHADA  - LOUXOR": "Хургада — Луксор",
  "HURGHADA - AEROPORT 4 pax": "Хургада — летище 4 души",
  "HURGHADA - AEROPORT 7 pax": "Хургада — летище 7 души",
  "HURGHADA - LE CAIRE": "Хургада — Кайро",
  "JEUX AQUATIQUE": "Водни игри",
  KARTING: "Картинг",
  "LOUXOR BUS": "Луксор с автобус",
  "Louxor montgolfières": "Луксор с балон",
  "LOUXOR OVERNIGHT HOTEL BB HILTON": "Луксор с нощувка Hilton BB",
  "LOUXOR OVERNIGHT HOTEL HB HILTON": "Луксор с нощувка Hilton HB",
  "LOUXOR OVERNIGHT HOTEL JOLIE VILLE BB": "Луксор с нощувка Jolie Ville BB",
  "LOUXOR OVERNIGHT HOTEL JOLIE VILLE HB": "Луксор с нощувка Jolie Ville HB",
  "LOUXOR PRIVATIF": "Луксор частен тур",
  "LOUXOR VAN": "Луксор с ван",
  MAHMYA: "Махмия",
  "Marsa Alam CORAIL PLONGEE": "Марса Алам — гмуркане при корали",
  "Marsa Alam CROISIERE VIP": "Марса Алам — VIP круиз",
  "Marsa Alam HAMATA SAFARI": "Марса Алам — сафари Хамата",
  "Marsa Alam NEFERTI VIP": "Марса Алам — Neferti VIP",
  "Marsa Alam QUAD 2H": "Марса Алам — АТВ 2ч",
  "Marsa Alam SAFARI MIX": "Марса Алам — микс сафари",
  "Marsa Alam SATAYA DAUPHIN": "Марса Алам — Сатая делфини",
  "Marsa Alam SATAYA OVERNIGHT": "Марса Алам — Сатая с нощувка",
  "Marsa Alam SATAYA OVERNIGHT PLONGEE": "Марса Алам — Сатая гмуркане с нощувка",
  "Marsa Alam SEASCOPE": "Марса Алам — Seascope",
  "Marsa Alam SUPER SAFARI": "Марса Алам — супер сафари",
  "MARSA MUBARAK PLONGEE": "Марса Мубарак — гмуркане",
  "MARSA MUBARAK SNORKELING": "Марса Мубарак — шнорхелинг",
  "MASSAGE 1H": "Масаж 1 час",
  "MINI SAFARI": "Мини сафари",
  MOTOCROSS: "Мотокрос",
  "open water": "Open Water",
  "ORANGE BAY / WHITE ISLAND": "Orange Bay / White Island",
  OZIREA: "Ozirea",
  "PANORAMA WOLF": "Panorama / Wolf",
  PARACHUTE: "Парашут",
  PLONGEE: "Гмуркане",
  "PLONGÉE NIVEAU 1": "Гмуркане ниво 1",
  "QUAD SUNSET": "АТВ при залез",
  "SOMA BAY - AEROPORT 4 pax": "Soma Bay — летище 4 души",
  "SOMA BAY - AEROPORT 7 pax": "Soma Bay — летище 7 души",
  "SPA LUXURY 1": "СПА Luxury 1",
  "SPA LUXURY 2": "СПА Luxury 2",
  "SPA PRIVATIF 1": "Частен СПА 1",
  "SPA PRIVATIF 2": "Частен СПА 2",
  "SPA ROYAL": "СПА Royal",
  SPEEDBOAT: "Спийдбоут",
  "SPEEDBOAT SUNSET": "Спийдбоут при залез",
  "SUNRISE CHEVAL": "Конна езда при изгрев",
  "SUNRISE QUAD": "АТВ при изгрев",
  "SUPER SAFARI": "Супер сафари",
  "TORTUE ABU DABBAB": "Костенурки Абу Дабаб",
  WATERWORLD: "Waterworld",
  "ZERO TRACAS": "Zero Tracas",
  "ZERO TRACAS HORS ZONE": "Zero Tracas извън зона",
};

const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
let filled = 0;
for (const act of data.activities) {
  const fr = act.name.fr;
  const bg = NAME_BG[fr];
  if (bg) {
    act.name.bg = bg;
    filled += 1;
  } else if (!act.name.bg) {
    act.name.bg = fr;
  }
}
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
console.log("Filled BG names:", filled, "/", data.activities.length);
