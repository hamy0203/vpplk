export var DB = "soil_analyzer_v1";
export var S = {
  theme: "standard",
  lang: "vi",
  ro: false,
  phieus: [],
  cp: null,
  screen: "home",
  step: 1,
  pinnedId: null
};

export var themeList = ["standard", "dark", "docsach", "matcha"];
export var langList = ["vi", "en"];

export function save() {
  try {
    localStorage.setItem(DB, JSON.stringify({ theme: S.theme, lang: S.lang, phieus: S.phieus, pinnedId: S.pinnedId }));
  } catch(e) {}
}

export function load() {
  try {
    var d = localStorage.getItem(DB);
    if (d) {
      var p = JSON.parse(d);
      S.phieus = p.phieus || [];
      S.theme = p.theme || "standard";
      S.lang = p.lang || "vi";
      S.pinnedId = p.pinnedId || null;
    }
  } catch(e) {}
}
