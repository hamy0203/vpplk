import { S } from '../../state.js';
import { T } from '../../i18n.js';
import { el, icon, thuaName, dpName } from '../../utils.js';
import { mkHeader } from '../components/header.js';
import { ro } from '../components/fields.js';
import { exportCSV } from '../../io/export.js';

export function rView(renderFn) {
  if (!S.cp) return el("div");
  var cp = S.cp;
  var root = el("div");
  var homeBtn = el("button", { className: "header-btn", onClick: function() { S.screen = "home"; S.cp = null; renderFn(); } });
  homeBtn.appendChild(icon("home"));
  var editBtn = el("button", { className: "header-btn", onClick: function() { S.ro = false; S.step = S._lastStep || 1; S.screen = "edit"; renderFn(); } });
  editBtn.appendChild(icon("edit"));
  editBtn.appendChild(document.createTextNode(" " + T("sua")));
  var d = cp.ngayLap ? cp.ngayLap.split("-") : ["","",""];
  var title = d[2] + "-" + d[1] + "-" + d[0].slice(2) + "-" + (cp.khuLienHop || "...");
  root.appendChild(mkHeader(homeBtn, title, [editBtn], renderFn));
  var bd = el("div", { className: "body-content" });

  var c1 = el("div", { className: "card" });
  c1.appendChild(el("div", { style: { fontWeight: "700", marginBottom: "8px" } }, T("thongTinPhien")));
  [[T("ngayLap"), cp.ngayLap], [T("khuLienHop"), cp.khuLienHop]].forEach(function(x) { c1.appendChild(ro(x[0], x[1])); });
  bd.appendChild(c1);

  bd.appendChild(el("div", { style: { fontWeight: "700", marginTop: "12px", marginBottom: "6px" } }, T("thua") + " (" + cp.vuonThua.length + ")"));
  cp.vuonThua.forEach(function(v) {
    var c = el("div", { className: "card" });
    c.appendChild(ro(T("thua"), thuaName(v)));
    bd.appendChild(c);
  });

  bd.appendChild(el("div", { style: { fontWeight: "700", marginTop: "12px", marginBottom: "6px" } }, T("diemDoDac") + " (" + cp.diemDo.length + ")"));
  cp.diemDo.forEach(function(d) {
    var v = cp.vuonThua.find(function(x) { return x.id === d.vuon_id; });
    var name = dpName(v, d.lan);
    var c = el("div", { className: "card" + (d.lan > 1 ? " retake-card" : "") });
    c.appendChild(ro(T("diemDoDac"), name));
    c.appendChild(ro("GPS", d.kinh_do + ", " + d.vi_do));
    c.appendChild(ro(T("tuoiNuoc"), d.tuoi_nuoc));
    c.appendChild(ro(T("bonPhan"), d.bon_phan));
    c.appendChild(ro(T("nguoiTH"), d.nguoi_th));
    if (d.hinh_anh_files && d.hinh_anh_files.length > 0) c.appendChild(ro(T("hinhAnh"), d.hinh_anh_files.join(", ")));
    if (d.ghi_chu) c.appendChild(ro(T("ghiChu"), d.ghi_chu));
    bd.appendChild(c);
  });

  var nav = el("div", { style: { display: "flex", gap: "8px", marginTop: "16px" } });
  nav.appendChild(el("button", { className: "btn btn-p", style: { flex: "1" }, onClick: function() { exportCSV(cp); } }, T("xuatCSV")));
  bd.appendChild(nav);
  root.appendChild(bd);
  return root;
}
