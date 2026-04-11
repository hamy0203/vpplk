import { S } from '../../state.js';
import { T } from '../../i18n.js';
import { el, icon } from '../../utils.js';
import { mkHeader } from '../components/header.js';
import { fi } from '../components/fields.js';
import { doImport } from '../../io/import.js';

export function rCreate(renderFn) {
  var root = el("div");
  var homeBtn = el("button", { className: "header-btn", onClick: function() { S.screen = "home"; S.cp = null; renderFn(); } });
  homeBtn.appendChild(icon("home"));
  root.appendChild(mkHeader(homeBtn, T("taoPhienMoi"), [], renderFn));
  var bd = el("div", { className: "body-content" });

  bd.appendChild(el("label", { className: "label" }, T("khuLienHop")));
  bd.appendChild(fi(S.cp ? S.cp.khuLienHop : "", function(v) { S.cp.khuLienHop = v; }));

  bd.appendChild(el("button", { className: "btn btn-p", style: { marginTop: "20px" }, onClick: function() {
    if (confirm(T("hoiImport"))) {
      document.getElementById("csv-c").click();
    } else {
      S.step = 1; S.screen = "edit"; renderFn();
    }
  }}, T("tiepTuc")));

  bd.appendChild(el("input", { type: "file", id: "csv-c", accept: ".csv", style: { display: "none" }, onChange: function(e) { doImport(e, true, renderFn); } }));
  root.appendChild(bd);
  return root;
}
