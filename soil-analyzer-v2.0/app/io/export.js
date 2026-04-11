import { T } from '../i18n.js';
import { dpName } from '../utils.js';

export function exportCSV(p) {
  if (!p || !p.diemDo || p.diemDo.length === 0) { alert(T("chuaCoData")); return; }
  var hd = ["ten_diem","khu_lien_hop","xi_nghiep","nong_truong","lo","thua","zone","chat_luong_vuon","dien_tich_ha","loai_cay","thoi_diem_sx","tuoi_nuoc","bon_phan","kinh_do","vi_do","nguoi_thuc_hien","ngay_lay_mau","gio_hoan_thanh","hinh_anh","do_lai","lan_do","N_ppm","P_ppm","K_ppm","EC_uScm","do_am_pct","nhiet_do_C","pH","ghi_chu"];
  var rows = p.diemDo.map(function(d) {
    var v = p.vuonThua.find(function(x) { return x.id === d.vuon_id; }) || {};
    var name = d._manualZone ? ("Zone " + d._manualZone) : dpName(v, d.lan);
    var photos = (d.hinh_anh_files || []).join("; ");
    var zoneVal = d._manualZone || v.zone || "";
    return [name, p.khuLienHop||"", v.xi_nghiep||"", v.nong_truong||"", v.lo||"", v.thua||"", zoneVal, v.chat_luong_vuon||"", v.dien_tich_ha||"", v.loai_cay||"", d.thoi_diem_sx, d.tuoi_nuoc, d.bon_phan, d.kinh_do, d.vi_do, d.nguoi_th, d.ngay_lay_mau, d.gio_hoan_thanh, photos, d.do_lai ? "Yes" : "No", d.lan, d.nitro, d.photpho, d.kali, d.ec, d.do_am, d.nhiet_do, d.pH, d.ghi_chu];
  });
  var csv = [hd.join(",")].concat(rows.map(function(r) {
    return r.map(function(c) { return '"' + (c != null ? c : "") + '"'; }).join(",");
  })).join("\n");
  var blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  var a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  var pd = p.ngayLap ? p.ngayLap.split("-") : ["","",""];
  var fname = pd[2] + "-" + pd[1] + "-" + pd[0].slice(2) + "-" + (p.khuLienHop || "phien_do");
  a.download = fname.replace(/[^a-zA-Z0-9_\-\u00C0-\u1EF9]/g, "_") + ".csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
