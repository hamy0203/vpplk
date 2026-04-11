import { S, themeList, langList, save } from '../../state.js';
import { el, icon } from '../../utils.js';

export function mkHeader(leftEl, title, extras, renderFn) {
  var hdr = el("div", { className: "header" });
  hdr.appendChild(leftEl);
  hdr.appendChild(el("span", { className: "header-title" }, title));
  var right = el("div", { style: { display: "flex", gap: "6px", alignItems: "center" } });
  right.appendChild(el("button", { className: "header-btn", onClick: function() {
    var i = themeList.indexOf(S.theme);
    S.theme = themeList[(i + 1) % themeList.length];
    renderFn(); save();
  }}, icon("palette")));
  if (extras) extras.forEach(function(x) { right.appendChild(x); });
  right.appendChild(el("button", { className: "header-btn", onClick: function() {
    var i = langList.indexOf(S.lang);
    S.lang = langList[(i + 1) % langList.length];
    renderFn(); save();
  }}, S.lang.toUpperCase()));
  hdr.appendChild(right);
  return hdr;
}
