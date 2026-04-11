import { S, save } from '../../state.js';
import { T } from '../../i18n.js';
import { el, icon, thuaName, dpName, pad } from '../../utils.js';
import { fi, sel, tog } from './fields.js';
import { mkDiemExport } from '../../io/import.js';

function csvField(v, key, labelText, extraAt, updTitleFn) {
  var wrap = el("div");
  wrap.appendChild(el("label", { className: "label" }, labelText));
  if (v._fromCSV) {
    var row = el("div", { style: { display: "flex", alignItems: "center", gap: "8px" } });
    var valSpan = el("span", { style: { fontSize: "15px", flex: "1" } }, v[key] || "—");
    var editBtn = el("button", { className: "btn-sm btn-o btn", style: { marginTop: "0" }, onClick: function() {
      if (!confirm(T("xacNhanSuaCSV"))) return;
      var inp = fi(v[key], function(val) { v[key] = val; if (updTitleFn) updTitleFn(); }, extraAt);
      row.replaceWith(inp);
      save();
    }}, T("sua"));
    row.appendChild(valSpan);
    row.appendChild(editBtn);
    wrap.appendChild(row);
  } else {
    wrap.appendChild(fi(v[key], function(val) { v[key] = val; if (updTitleFn) updTitleFn(); }, extraAt));
  }
  return wrap;
}

export function rVuon(v, renderFn) {
  var card = el("div", { className: "card", id: "vuon-" + v.id });
  var hdr = el("div", { className: "collapse-header" });
  var titleSpan = el("span", { style: { fontWeight: "600" } }, thuaName(v) || T("tenThua"));
  hdr.appendChild(titleSpan);
  function updTitle() { titleSpan.textContent = thuaName(v) || T("tenThua"); }
  var col = v._collapsed || false;
  var arrow = el("span", { style: { fontSize: "18px" } }, col ? "▸" : "▾");
  hdr.appendChild(arrow);
  var ct = el("div", { style: { marginTop: "8px", display: col ? "none" : "block" } });
  hdr.addEventListener("click", function() {
    col = !col; v._collapsed = col;
    ct.style.display = col ? "none" : "block";
    arrow.textContent = col ? "▸" : "▾";
  });

  ct.appendChild(csvField(v, "xi_nghiep", T("xiNghiep")));
  ct.appendChild(csvField(v, "nong_truong", T("nongTruong"), null, updTitle));

  var r1 = el("div", { className: "row" });
  var rl = el("div", { className: "flex1" });
  rl.appendChild(csvField(v, "lo", T("lo"), null, updTitle));
  r1.appendChild(rl);
  var rt = el("div", { className: "flex1" });
  rt.appendChild(csvField(v, "thua", T("thua"), null, updTitle));
  r1.appendChild(rt);
  ct.appendChild(r1);

  ct.appendChild(csvField(v, "zone", T("zone")));
  ct.appendChild(csvField(v, "chat_luong_vuon", T("chatLuongVuon")));
  ct.appendChild(csvField(v, "dien_tich_ha", T("dienTich"), { inputmode: "decimal" }));
  ct.appendChild(csvField(v, "loai_cay", T("loaiCay")));

  ct.appendChild(el("button", { className: "danger-link", onClick: function() {
    S.cp.vuonThua = S.cp.vuonThua.filter(function(x) { return x.id !== v.id; });
    S.cp.diemDo = (S.cp.diemDo || []).filter(function(x) { return x.vuon_id !== v.id; });
    renderFn(); save();
  }}, T("xoaThua")));

  card.appendChild(hdr); card.appendChild(ct); return card;
}

export function rDiemDoDac(d, renderFn, onFillChange) {
  var cp = S.cp;
  var v = cp.vuonThua.find(function(x) { return x.id === d.vuon_id; });
  var name = d._manualZone ? ("Zone " + d._manualZone) : dpName(v, d.lan, d.do_lai);
  var filled = d.kinh_do && d.vi_do && d.tuoi_nuoc && d.bon_phan;

  var isPinned = S.pinnedId === d.id;
  var isRetake = d.lan > 1;
  var card = el("div", { className: "card" + (isRetake ? " retake-card" : ""), id: "diem-" + d.id, style: { opacity: filled ? "0.45" : "1", transition: "opacity 0.3s, box-shadow 0.2s", boxShadow: isPinned ? "0 0 0 3px var(--accent)" : "" } });
  var hdr = el("div", { className: "collapse-header" });

  var _pt = null;
  hdr.addEventListener("touchstart", function() {
    _pt = setTimeout(function() {
      S.pinnedId = isPinned ? null : d.id;
      isPinned = !isPinned;
      card.style.boxShadow = isPinned ? "0 0 0 3px var(--accent)" : "";
      save();
    }, 5000);
  }, { passive: true });
  hdr.addEventListener("touchend", function() { clearTimeout(_pt); });
  hdr.addEventListener("touchcancel", function() { clearTimeout(_pt); });
  hdr.addEventListener("touchmove", function() { clearTimeout(_pt); });

  var titleSpan = el("span", { style: { fontWeight: "600", fontSize: "13px" } }, name + (filled ? " ✓" : ""));
  hdr.appendChild(titleSpan);
  var arrow = el("span", { style: { fontSize: "18px" } }, "▾");
  hdr.appendChild(arrow);
  var ct = el("div", { style: { marginTop: "8px" } });
  var col = false;
  hdr.addEventListener("click", function() { col = !col; ct.style.display = col ? "none" : "block"; arrow.textContent = col ? "▸" : "▾"; });

  function updFilled() {
    var nowFilled = d.kinh_do && d.vi_do && d.tuoi_nuoc && d.bon_phan;
    card.style.opacity = nowFilled ? "0.45" : "1";
    var base = d._manualZone ? ("Zone " + d._manualZone) : dpName(v, d.lan, d.do_lai);
    titleSpan.textContent = base + (nowFilled ? " ✓" : "");
    if (onFillChange) onFillChange();
  }

  ct.appendChild(el("label", { className: "label" }, T("thoiDiemSX")));
  ct.appendChild(fi(d.thoi_diem_sx, function(val) { d.thoi_diem_sx = val; }, { inputmode: "numeric" }));

  ct.appendChild(el("label", { className: "label" }, T("tuoiNuoc")));
  ct.appendChild(sel(d.tuoi_nuoc, [
    { value: "Đang tưới nước", label: T("tuoiNuoc1") },
    { value: "Mới tưới nước (còn giọt đọng)", label: T("tuoiNuoc2") },
    { value: "Đất ẩm vừa", label: T("tuoiNuoc3") },
    { value: "Đất khô", label: T("tuoiNuoc4") },
    { value: "Không rõ", label: T("tuoiNuoc5") }
  ], function(val) { d.tuoi_nuoc = val; updFilled(); save(); }, "-- " + T("tuoiNuoc") + " --"));

  ct.appendChild(el("label", { className: "label" }, T("bonPhan")));
  ct.appendChild(sel(d.bon_phan, [
    { value: "Mới bón phân", label: T("bonPhan1") },
    { value: "Không bón phân", label: T("bonPhan2") },
    { value: "Không rõ", label: T("bonPhan3") }
  ], function(val) { d.bon_phan = val; updFilled(); save(); }, "-- " + T("bonPhan") + " --"));

  var rg = el("div", { style: { display: "flex", gap: "8px", alignItems: "flex-end", marginTop: "4px" } });
  var dk = el("div", { className: "flex1" });
  dk.appendChild(el("label", { className: "label" }, T("kinhDo")));
  dk.appendChild(fi(d.kinh_do, function(val) { d.kinh_do = val; }));
  rg.appendChild(dk);
  var dv = el("div", { className: "flex1" });
  dv.appendChild(el("label", { className: "label" }, T("viDo")));
  dv.appendChild(fi(d.vi_do, function(val) { d.vi_do = val; }));
  rg.appendChild(dv);
  var gpsBtn = el("button", { className: "btn btn-p", style: { width: "auto", padding: "10px", marginTop: "0" }, onClick: function() {
    if (!navigator.geolocation) { alert("GPS N/A"); return; }
    navigator.geolocation.getCurrentPosition(function(pos) {
      var prevKD = d.kinh_do, prevVD = d.vi_do;
      d.kinh_do = pos.coords.longitude.toFixed(6);
      d.vi_do = pos.coords.latitude.toFixed(6);
      renderFn(); save();
      var undoBtn = document.getElementById("gps-undo-" + d.id);
      if (undoBtn) {
        undoBtn.style.display = "inline-block";
        undoBtn.onclick = function() { d.kinh_do = prevKD; d.vi_do = prevVD; renderFn(); save(); };
      }
    }, function(err) { alert("GPS: " + err.message); }, { enableHighAccuracy: true, timeout: 10000 });
  }});
  gpsBtn.appendChild(icon("pin"));
  rg.appendChild(gpsBtn);
  ct.appendChild(rg);
  var undoGps = el("button", { id: "gps-undo-" + d.id, className: "danger-link", style: { display: "none", fontSize: "12px", marginTop: "2px" } }, T("undoGPS"));
  ct.appendChild(undoGps);

  ct.appendChild(el("label", { className: "label" }, T("nguoiTH")));
  ct.appendChild(fi(d.nguoi_th, function(val) { d.nguoi_th = val; }));

  var r4 = el("div", { className: "row" });
  var dn = el("div", { className: "flex1" });
  dn.appendChild(el("label", { className: "label" }, T("ngayLay")));
  dn.appendChild(fi(d.ngay_lay_mau, function(val) { d.ngay_lay_mau = val; }, { type: "date" }));
  r4.appendChild(dn);
  var dg = el("div", { className: "flex1" });
  dg.appendChild(el("label", { className: "label" }, T("gioLay")));
  dg.appendChild(fi(d.gio_hoan_thanh, function(val) { d.gio_hoan_thanh = val; }, { type: "time" }));
  r4.appendChild(dg);
  ct.appendChild(r4);

  var photoRow = el("div", { style: { display: "flex", gap: "16px", marginTop: "12px", alignItems: "center" } });
  var pt = el("div", { style: { display: "flex", alignItems: "center", gap: "6px" } });
  pt.appendChild(tog(d.hinh_anh, function(val) { d.hinh_anh = val; save(); renderFn(); }));
  pt.appendChild(el("span", { style: { fontSize: "13px" } }, T("hinhAnh")));
  photoRow.appendChild(pt);
  ct.appendChild(photoRow);

  if (d.hinh_anh) {
    var photoArea = el("div", { className: "photo-grid" });
    if (!d.hinh_anh_files) d.hinh_anh_files = [];
    d.hinh_anh_files.forEach(function(fname, fi2) {
      var item = el("div", { className: "photo-item" });
      item.appendChild(el("div", { style: { width: "60px", height: "60px", borderRadius: "6px", background: "var(--inputBg)", border: "1px solid var(--divider)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", textAlign: "center", padding: "2px", color: "var(--muted)", wordBreak: "break-all" } }, fname));
      item.appendChild(el("button", { className: "photo-rm", onClick: function() {
        d.hinh_anh_files.splice(fi2, 1);
        renderFn(); save();
      }}, "×"));
      photoArea.appendChild(item);
    });
    var addBtn = el("button", { className: "add-photo-btn", onClick: function() {
      var inp = document.createElement("input");
      inp.type = "file"; inp.accept = "image/*"; inp.setAttribute("capture", "environment");
      inp.addEventListener("change", function() {
        if (inp.files && inp.files[0]) {
          var ts = new Date();
          var fname = dpName(v, d.lan).replace(/[^a-zA-Z0-9]/g, "_") + "_" + ts.getFullYear() + pad(ts.getMonth() + 1) + pad(ts.getDate()) + "_" + pad(ts.getHours()) + pad(ts.getMinutes()) + pad(ts.getSeconds()) + ".jpg";
          if (!d.hinh_anh_files) d.hinh_anh_files = [];
          d.hinh_anh_files.push(fname);
          renderFn(); save();
        }
      });
      inp.click();
    }});
    addBtn.appendChild(icon("cam"));
    photoArea.appendChild(addBtn);
    ct.appendChild(photoArea);
  }

  var doLaiRow = el("div", { style: { display: "flex", gap: "16px", marginTop: "12px", alignItems: "center" } });
  var dl = el("div", { style: { display: "flex", alignItems: "center", gap: "6px" } });
  dl.appendChild(tog(d.do_lai, function(val) {
    d.do_lai = val;
    if (val) {
      var nextLan = d.lan + 1;
      var alreadyHas = cp.diemDo.find(function(x) { return x.vuon_id === d.vuon_id && x.lan === nextLan; });
      if (!alreadyHas) {
        var newDiem = mkDiemExport(d.vuon_id, nextLan);
        newDiem.thoi_diem_sx = d.thoi_diem_sx;
        var idx = cp.diemDo.indexOf(d);
        cp.diemDo.splice(idx + 1, 0, newDiem);
      }
    } else {
      var childLan = d.lan + 1;
      var child = cp.diemDo.find(function(x) { return x.vuon_id === d.vuon_id && x.lan === childLan; });
      if (child) {
        // also turn off child's do_lai chain recursively
        (function removeChain(entry) {
          var next = cp.diemDo.find(function(x) { return x.vuon_id === entry.vuon_id && x.lan === entry.lan + 1; });
          cp.diemDo = cp.diemDo.filter(function(x) { return x.id !== entry.id; });
          if (next) removeChain(next);
        })(child);
      }
    }
    save(); renderFn();
  }));
  dl.appendChild(el("span", { style: { fontSize: "13px" } }, T("doLai")));
  doLaiRow.appendChild(dl);
  ct.appendChild(doLaiRow);

  var sensorRow1 = el("div", { className: "row" });
  var sN = el("div", { className: "flex1" });
  sN.appendChild(el("label", { className: "label" }, T("nitro")));
  sN.appendChild(fi(d.nitro, function(val) { d.nitro = val; }, { inputmode: "decimal" }));
  sensorRow1.appendChild(sN);
  var sP = el("div", { className: "flex1" });
  sP.appendChild(el("label", { className: "label" }, T("photpho")));
  sP.appendChild(fi(d.photpho, function(val) { d.photpho = val; }, { inputmode: "decimal" }));
  sensorRow1.appendChild(sP);
  var sK = el("div", { className: "flex1" });
  sK.appendChild(el("label", { className: "label" }, T("kali")));
  sK.appendChild(fi(d.kali, function(val) { d.kali = val; }, { inputmode: "decimal" }));
  sensorRow1.appendChild(sK);
  ct.appendChild(sensorRow1);

  var sensorRow2 = el("div", { className: "row" });
  var sEC = el("div", { className: "flex1" });
  sEC.appendChild(el("label", { className: "label" }, T("ec")));
  sEC.appendChild(fi(d.ec, function(val) { d.ec = val; }, { inputmode: "decimal" }));
  sensorRow2.appendChild(sEC);
  var sAm = el("div", { className: "flex1" });
  sAm.appendChild(el("label", { className: "label" }, T("doAm")));
  sAm.appendChild(fi(d.do_am, function(val) { d.do_am = val; }, { inputmode: "decimal" }));
  sensorRow2.appendChild(sAm);
  var sNhiet = el("div", { className: "flex1" });
  sNhiet.appendChild(el("label", { className: "label" }, T("nhietDo")));
  sNhiet.appendChild(fi(d.nhiet_do, function(val) { d.nhiet_do = val; }, { inputmode: "decimal" }));
  sensorRow2.appendChild(sNhiet);
  ct.appendChild(sensorRow2);

  var sensorRow3 = el("div", { className: "row" });
  var spH = el("div", { className: "flex1" });
  spH.appendChild(el("label", { className: "label" }, T("pH")));
  spH.appendChild(fi(d.pH, function(val) { d.pH = val; }, { inputmode: "decimal" }));
  sensorRow3.appendChild(spH);
  ct.appendChild(sensorRow3);

  ct.appendChild(el("label", { className: "label" }, T("ghiChu")));
  ct.appendChild(fi(d.ghi_chu, function(val) { d.ghi_chu = val; }));

  if (d._manualZone) {
    ct.appendChild(el("button", { className: "danger-link", onClick: function() {
      cp.diemDo = cp.diemDo.filter(function(x) { return x.id !== d.id; });
      renderFn(); save();
    }}, T("xoaDiem")));
  } else if (d.lan > 1) {
    ct.appendChild(el("button", { className: "danger-link", onClick: function() {
      var parent = cp.diemDo.find(function(x) { return x.vuon_id === d.vuon_id && x.lan === d.lan - 1; });
      if (parent) parent.do_lai = false;
      cp.diemDo = cp.diemDo.filter(function(x) { return x.id !== d.id; });
      renderFn(); save();
    }}, T("xoaDiem")));
  }

  card.appendChild(hdr); card.appendChild(ct); return card;
}
