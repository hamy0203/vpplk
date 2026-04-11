import { el } from '../../utils.js';
import { save } from '../../state.js';

export function fi(val, cb, at) {
  var inp = el("input", Object.assign({ className: "fi", value: val || "" }, at || {}));
  inp.addEventListener("input", function() { cb(inp.value); save(); });
  return inp;
}

export function sel(val, opts, cb, ph) {
  var s = el("select", { className: "fi" });
  s.appendChild(el("option", { value: "" }, ph || "--"));
  opts.forEach(function(o) {
    var v = typeof o === "object" ? o.value : o;
    var l = typeof o === "object" ? o.label : o;
    var op = el("option", { value: v }, l);
    if (v === val) op.selected = true;
    s.appendChild(op);
  });
  s.addEventListener("change", function() { cb(s.value); });
  return s;
}

export function tog(val, cb) {
  var b = el("button", { className: "toggle" + (val ? " on" : "") });
  var knob = el("div", { className: "toggle-knob" });
  b.appendChild(knob);
  b.addEventListener("click", function() {
    val = !val;
    b.className = "toggle" + (val ? " on" : "");
    knob.style.left = val ? "22px" : "2px";
    cb(val);
  });
  return b;
}

export function ro(l, v) {
  return el("div", { className: "ro-field" }, [
    el("span", { className: "ro-label" }, l + ": "),
    el("span", { className: "ro-val" }, v || "—")
  ]);
}
