import { S, save } from '../state.js';
import { gid } from '../utils.js';

function mkDiem(vuon_id, lan) {
  return {
    id: gid(), vuon_id: vuon_id, lan: lan || 1,
    thoi_diem_sx: "", tuoi_nuoc: "", bon_phan: "",
    kinh_do: "", vi_do: "", nguoi_th: "",
    ngay_lay_mau: new Date().toISOString().slice(0, 10),
    gio_hoan_thanh: "", hinh_anh: false, hinh_anh_files: [],
    do_lai: false, ghi_chu: "",
    nitro: "", photpho: "", kali: "", ec: "", do_am: "", nhiet_do: "", pH: ""
  };
}

export function genDiemDo() {
  if (!S.cp) return;
  if (!S.cp.diemDo) S.cp.diemDo = [];
}

export function mkDiemExport(vuon_id, lan) {
  return mkDiem(vuon_id, lan);
}

export function doImport(e, isCreate, renderFn) {
  var file = e.target.files[0];
  if (!file) return;
  var reader = new FileReader();
  reader.onload = function(ev) {
    try {
      var text = ev.target.result;
      if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
      var lines = text.split("\n").map(function(l) {
        return l.split(",").map(function(c) { return c.trim().replace(/^"|"$/g, ""); });
      });
      if (lines.length < 2) return;
      var hd = lines[0];
      var rows = lines.slice(1).filter(function(r) { return r.length >= hd.length && r.some(function(c) { return c; }); });
      var data = rows.map(function(r) { var o = {}; hd.forEach(function(k, i) { o[k] = r[i] || ""; }); return o; });
      S.cp.csvData = data;
      var klh = S.cp.khuLienHop;
      var filtered = klh ? data.filter(function(d) { return (d.khu_lien_hop || "").toUpperCase() === klh.toUpperCase(); }) : data;
      if (filtered.length === 0 && data.length > 0) filtered = data;
      S.cp.vuonThua = filtered.map(function(d) {
        return {
          id: gid(), _fromCSV: true,
          xi_nghiep: d.xi_nghiep || "", nong_truong: d.nong_truong || "",
          lo: d.lo || "", thua: d.thua || "",
          zone: d.zone || "", chat_luong_vuon: d.chat_luong_vuon || "",
          dien_tich_ha: d.dien_tich_ha || "", loai_cay: d.loai_cay || ""
        };
      });
      genDiemDo();
      if (isCreate) { S.step = 1; S.screen = "edit"; }
      renderFn();
      save();
    } catch(err) { alert("Error: " + err.message); }
  };
  reader.readAsText(file);
  e.target.value = "";
}
