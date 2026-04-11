import { S, save } from '../../state.js';
import { T } from '../../i18n.js';
import { el, icon, gid, isFilled } from '../../utils.js';
import { mkHeader } from '../components/header.js';
import { fi, sel } from '../components/fields.js';
import { rVuon, rDiemDoDac } from '../components/cards.js';
import { doImport, genDiemDo, mkDiemExport } from '../../io/import.js';

function saveHome(renderFn) {
  if (S.cp) {
    S.cp.updatedAt = new Date().toISOString();
    var i = S.phieus.findIndex(function(x) { return x.id === S.cp.id; });
    if (i >= 0) S.phieus[i] = JSON.parse(JSON.stringify(S.cp));
    else S.phieus.push(JSON.parse(JSON.stringify(S.cp)));
  }
  S.screen = "home"; S.cp = null; renderFn(); save();
}

function goStep(s, renderFn) {
  if (s === 2) genDiemDo();
  S.step = s; renderFn(); save(); window.scrollTo(0, 0);
}

export function rEdit(renderFn) {
  if (!S.cp) return el("div");
  var cp = S.cp;
  var root = el("div");
  var homeBtn = el("button", { className: "header-btn", onClick: function() { saveHome(renderFn); } });
  homeBtn.appendChild(icon("home"));
  var d = cp.ngayLap ? cp.ngayLap.split("-") : ["","",""];
  var title = d[2] + "-" + d[1] + "-" + d[0].slice(2) + "-" + (cp.khuLienHop || "...");
  root.appendChild(mkHeader(
    homeBtn,
    title,
    [el("button", { className: "header-btn", onClick: function() { S.ro = true; S._lastStep = S.step; S.screen = "view"; renderFn(); } }, icon("eye"))],
    renderFn
  ));

  var prog = el("div", { className: "progress" });
  [["① " + T("thongTinChung"), 1], ["② " + T("diemDoDac"), 2]].forEach(function(x) {
    var cls = "p-step";
    if (S.step === x[1]) cls += " active";
    else if (S.step > x[1]) cls += " done";
    prog.appendChild(el("button", { className: cls, onClick: function() {
      if (x[1] >= 2) {
        var ok = cp.vuonThua.length > 0 && cp.vuonThua.some(function(v) { return v.nong_truong || v.lo || v.thua; });
        if (!ok) { alert(T("nhapThongTinThua")); return; }
      }
      goStep(x[1], renderFn);
    }}, x[0]));
  });
  root.appendChild(prog);
  var bd = el("div", { className: "body-content" });

  if (S.step === 1) {
    var c = el("div", { className: "card" });
    c.appendChild(el("div", { style: { fontWeight: "700", marginBottom: "8px" } }, T("thongTinPhien")));
    c.appendChild(el("label", { className: "label" }, T("ngayLap")));
    c.appendChild(fi(cp.ngayLap, function(v) { cp.ngayLap = v; }, { type: "date" }));
    c.appendChild(el("label", { className: "label" }, T("khuLienHop")));
    c.appendChild(fi(cp.khuLienHop, function(v) { cp.khuLienHop = v; }));
    bd.appendChild(c);

    var vh = el("div", { style: { fontWeight: "700", marginTop: "16px", marginBottom: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" } });
    vh.appendChild(el("span", {}, T("thua") + " (" + cp.vuonThua.length + ")"));
    vh.appendChild(el("button", { className: "btn btn-o btn-sm", onClick: function() {
      if (cp.vuonThua.length > 0 && !confirm(T("xoaDataThua"))) return;
      document.getElementById("csv-e").click();
    }}, T("taiLenCSV")));
    bd.appendChild(vh);
    bd.appendChild(el("input", { type: "file", id: "csv-e", accept: ".csv", style: { display: "none" }, onChange: function(e) { doImport(e, false, renderFn); } }));

    cp.vuonThua.forEach(function(v) { bd.appendChild(rVuon(v, renderFn)); });
    bd.appendChild(el("button", { className: "btn btn-o", style: { marginTop: "4px" }, onClick: function() {
      cp.vuonThua.push({ id: gid(), ma_thua_qtsx: "", xi_nghiep: "", nong_truong: "", lo: "", thua: "" });
      renderFn(); save();
    }}, T("themThua")));

    bd.appendChild(el("button", { className: "btn btn-p", style: { marginTop: "16px" }, onClick: function() {
      var ok = cp.vuonThua.length > 0 && cp.vuonThua.some(function(v) { return v.nong_truong || v.lo || v.thua; });
      if (!ok) { alert(T("nhapThongTinThua")); return; }
      goStep(2, renderFn);
    }}, T("tiepDiemDoDac")));
  }

  if (S.step === 2) {
    bd.appendChild(el("div", { style: { fontSize: "13px", color: "var(--muted)", marginBottom: "10px" } }, T("chonDiemLayMau")));

    var fabList = el("button", { className: "fab", style: { fontSize: "18px" }, onClick: function() {
      var panel = document.getElementById("anchor-panel");
      if (panel) panel.classList.toggle("hidden");
    }});
    fabList.appendChild(icon("list"));
    bd.appendChild(fabList);

    var ap = el("div", { id: "anchor-panel", className: "card hidden", style: { position: "fixed", bottom: "84px", right: "20px", width: "280px", maxHeight: "250px", overflowY: "auto", zIndex: "51", boxShadow: "0 4px 16px rgba(0,0,0,0.25)" } });
    var apHeader = el("div", { style: { fontWeight: "700", fontSize: "13px", marginBottom: "6px" } });
    var apRows = {};  // keyed by d.id → DOM row
    function updAnchorPanel() {
      var done = cp.diemDo.filter(function(d) { return isFilled(d); }).length;
      apHeader.textContent = T("chuyenThua") + " (" + String(done).padStart(2, "0") + "/" + String(cp.diemDo.length).padStart(2, "0") + ")";
      if (tcCount) tcCount.textContent = String(cp.diemDo.length);
      cp.diemDo.forEach(function(d) {
        var row = apRows[d.id];
        if (!row) return;
        var isDone = isFilled(d);
        var v2 = cp.vuonThua.find(function(x) { return x.id === d.vuon_id; });
        var lbl = d._manualZone ? ("Zone " + d._manualZone) : (v2 ? ((v2.nong_truong||"") + "/" + (v2.lo||"") + "/" + (v2.thua||"")) : "");
        row.textContent = lbl + (isDone ? " ✓" : "");
        row.style.color = isDone ? "var(--accent)" : "var(--cardText)";
      });
    }
    ap.appendChild(apHeader);
    cp.diemDo.forEach(function(d) {
      var v = cp.vuonThua.find(function(x) { return x.id === d.vuon_id; });
      var label2 = d._manualZone ? ("Zone " + d._manualZone) : (v ? ((v.nong_truong || "") + "/" + (v.lo || "") + "/" + (v.thua || "")) : "");
      if (!label2) return;
      var isDone = isFilled(d);
      var row = el("div", { style: { padding: "8px 10px", cursor: "pointer", borderBottom: "1px solid var(--divider)", fontSize: "14px", color: isDone ? "var(--accent)" : "var(--cardText)" }, onClick: function() {
        var t = document.getElementById("diem-" + d.id);
        if (t) { t.scrollIntoView({ behavior: "smooth", block: "start" }); document.getElementById("anchor-panel").classList.add("hidden"); }
      }}, label2 + (isDone ? " ✓" : ""));
      apRows[d.id] = row;
      ap.appendChild(row);
    });
    updAnchorPanel();
    bd.appendChild(ap);

    // derive zone list from vuonThua, preserving insertion order
    var zoneList = [];
    cp.vuonThua.forEach(function(v) {
      if (v.zone && zoneList.indexOf(v.zone) === -1) zoneList.push(v.zone);
    });
    // also include zones from manual diemDo entries (zone stored directly on d)
    cp.diemDo.forEach(function(d) {
      if (d._manualZone && zoneList.indexOf(d._manualZone) === -1) zoneList.push(d._manualZone);
    });

    function renderZoneSection(zoneName, isManual) {
      var sec = el("div", { style: { marginBottom: "16px" } });
      sec.appendChild(el("div", { style: { fontWeight: "700", fontSize: "14px", marginBottom: "6px", padding: "4px 0", borderBottom: "2px solid var(--accent)" } }, "Zone " + zoneName));

      if (!isManual) {
        // CSV zone: dropdown of plots in this zone not yet assigned (lan === 1)
        var plotsInZone = cp.vuonThua.filter(function(v) { return v.zone === zoneName; });
        var assignedIds = cp.diemDo.filter(function(d) { return d.lan === 1; }).map(function(d) { return d.vuon_id; });
        var unassigned = plotsInZone.filter(function(v) { return assignedIds.indexOf(v.id) === -1; });

        if (unassigned.length > 0) {
          var dropOpts = unassigned.map(function(v) { return { value: v.id, label: (v.nong_truong||"") + "/" + (v.lo||"") + "/" + (v.thua||"") }; });
          var dropRow = el("div", { style: { marginBottom: "8px" } });
          var dropdown = sel("", dropOpts, function(vid) {
            if (!vid) return;
            var already = cp.diemDo.find(function(d) { return d.vuon_id === vid && d.lan === 1; });
            if (already) return;
            var newD = mkDiemExport(vid, 1);
            cp.diemDo.push(newD);
            save(); renderFn();
          }, T("chonThua"));
          dropRow.appendChild(dropdown);
          sec.appendChild(dropRow);
        }
      }

      // render existing cards for this zone
      var zoneDiems = isManual
        ? cp.diemDo.filter(function(d) { return d._manualZone === zoneName; })
        : cp.diemDo.filter(function(d) {
            var v = cp.vuonThua.find(function(x) { return x.id === d.vuon_id; });
            return v && v.zone === zoneName;
          });
      zoneDiems.forEach(function(d) { sec.appendChild(rDiemDoDac(d, renderFn, updAnchorPanel)); });

      return sec;
    }

    zoneList.forEach(function(z) {
      var isManual = cp.vuonThua.every(function(v) { return v.zone !== z; });
      bd.appendChild(renderZoneSection(z, isManual));
    });

    // add new zone button
    var addZoneRow = el("div", { style: { display: "flex", gap: "8px", alignItems: "center", marginTop: "8px", marginBottom: "16px" } });
    var zoneNameInp = el("input", { className: "fi", placeholder: T("tenZone"), style: { flex: "1" } });
    addZoneRow.appendChild(zoneNameInp);
    addZoneRow.appendChild(el("button", { className: "btn btn-o btn-sm", style: { width: "auto" }, onClick: function() {
      var zn = zoneNameInp.value.trim();
      if (!zn) return;
      // create a manual diemDo with _manualZone set and no vuon_id
      var newD = mkDiemExport(null, 1);
      newD._manualZone = zn;
      cp.diemDo.push(newD);
      save(); renderFn();
    }}, T("themZone")));
    bd.appendChild(addZoneRow);

    var tc = el("div", { className: "card", style: { marginTop: "4px" } });
    var tcCount = el("strong", {}, String(cp.diemDo.length));
    tc.appendChild(el("div", { style: { display: "flex", justifyContent: "space-between", fontSize: "14px" } }, [
      el("span", {}, T("tongSoDiemDo")),
      tcCount
    ]));
    bd.appendChild(tc);

    var nav = el("div", { style: { display: "flex", gap: "8px", marginTop: "12px" } });
    nav.appendChild(el("button", { className: "btn btn-o", style: { flex: "1" }, onClick: function() { goStep(1, renderFn); } }, T("quayLai")));
    nav.appendChild(el("button", { className: "btn btn-p", style: { flex: "1" }, onClick: function() { saveHome(renderFn); } }, T("luuPhien")));
    bd.appendChild(nav);
  }

  root.appendChild(bd);
  return root;
}
