import { S, save } from '../../state.js';
import { T } from '../../i18n.js';
import { el, icon, gid, isFilled } from '../../utils.js';
import { mkHeader } from '../components/header.js';
import { exportCSV } from '../../io/export.js';

export function rHome(renderFn) {
  var root = el("div");
  root.appendChild(mkHeader(
    el("span"),
    T("appTitle"),
    [el("button", { className: "header-btn", onClick: function() { S.ro = !S.ro; renderFn(); } }, S.ro ? icon("eye") : icon("edit"))],
    renderFn
  ));
  var bd = el("div", { className: "body-content" });

  if (S.phieus.length === 0) {
    bd.appendChild(el("div", { className: "empty-state" }, [
      icon("clip"),
      el("div", { style: { marginTop: "10px" } }, T("chuaTaoPhien")),
      el("div", { style: { fontSize: "13px" } }, T("nhanNutThem"))
    ]));
  }

  S.phieus.forEach(function(p) {
    var w = el("div", { style: { marginBottom: "10px" } });
    var card = el("div", { className: "card", style: { cursor: "pointer", marginBottom: "0" } });
    var pd = p.ngayLap ? p.ngayLap.split("-") : ["","",""];
    var cardTitle = pd[2] + "-" + pd[1] + "-" + pd[0].slice(2) + "-" + (p.khuLienHop || "...");
    card.appendChild(el("div", { className: "card-title" }, cardTitle));
    var tongSoDiemDo = (p.diemDo || []).length;
    var done = (p.diemDo || []).filter(isFilled).length;
    var pct = tongSoDiemDo > 0 ? Math.round(done / tongSoDiemDo * 100) : 0;
    var pctColor = pct === 100 ? "var(--accent)" : pct > 0 ? "#e8a700" : "var(--muted)";
    var subRow = el("div", { style: { display: "flex", justifyContent: "space-between", marginTop: "2px" } });
    subRow.appendChild(el("span", { style: { fontSize: "12px", fontStyle: "italic", color: "var(--muted)" } }, p.khuLienHop || ""));
    subRow.appendChild(el("span", { style: { fontSize: "12px", fontStyle: "italic", color: "var(--muted)" } }, p.updatedAt ? new Date(p.updatedAt).toLocaleDateString("vi-VN") : ""));
    card.appendChild(subRow);
    card.appendChild(el("div", { style: { display: "flex", justifyContent: "flex-end", marginTop: "2px" } }, [
      el("span", { style: { fontSize: "12px", fontWeight: "600", color: pctColor } }, pct + "% (" + done + "/" + tongSoDiemDo + ")")
    ]));
    card.appendChild(el("div", { style: { height: "4px", background: "var(--divider)", borderRadius: "2px", marginTop: "4px", overflow: "hidden" } }, [
      el("div", { style: { height: "100%", width: pct + "%", background: pctColor, borderRadius: "2px", transition: "width 0.3s" } })
    ]));
    card.addEventListener("click", function() {
      S.cp = JSON.parse(JSON.stringify(p));
      if (S.ro) S.screen = "view";
      else { S.screen = "edit"; S.step = 1; }
      renderFn();
    });
    w.appendChild(card);

    var acts = el("div", { style: { display: "flex", gap: "6px", marginTop: "6px" } });
    acts.appendChild(el("button", { className: "btn btn-o btn-sm", onClick: function() { exportCSV(p); } }, T("xuatCSV")));
    acts.appendChild(el("button", { className: "btn btn-d btn-sm", onClick: function() {
      if (!confirm(T("xoaPhien1"))) return;
      if (!confirm(T("xoaPhien2"))) return;
      S.phieus = S.phieus.filter(function(x) { return x.id !== p.id; });
      renderFn(); save();
    }}, T("xoa")));
    w.appendChild(acts);
    bd.appendChild(w);
  });

  root.appendChild(bd);
  bd.appendChild(el("div", { style: { textAlign: "center", color: "var(--muted)", fontSize: "12px", padding: "20px 16px", fontStyle: "italic" } }, T("backup")));

  if (!S.ro) {
    var fab = el("button", { className: "fab", onClick: function() {
      S.cp = { id: gid(), ngayLap: new Date().toISOString().slice(0, 10), khuLienHop: "", vuonThua: [], csvData: [], diemDo: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      S.step = 0; S.screen = "create"; renderFn();
    }});
    fab.appendChild(icon("plus"));
    root.appendChild(fab);
  }
  return root;
}
