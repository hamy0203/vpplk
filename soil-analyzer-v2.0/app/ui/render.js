import { S, load } from '../state.js';
import { rHome } from './screens/home.js';
import { rCreate } from './screens/create.js';
import { rEdit } from './screens/edit.js';
import { rView } from './screens/view.js';

export function render() {
  document.body.setAttribute("data-theme", S.theme);
  var app = document.getElementById("app");
  app.innerHTML = "";
  if (S.screen === "home") app.appendChild(rHome(render));
  else if (S.screen === "create") app.appendChild(rCreate(render));
  else if (S.screen === "edit") app.appendChild(rEdit(render));
  else if (S.screen === "view") app.appendChild(rView(render));
  scrollToPinned();
}

load();
render();

// Warn before tab close / hard refresh when a session is open
window.addEventListener("beforeunload", function(e) {
  if (S.cp) { e.preventDefault(); e.returnValue = ""; }
});

function scrollToPinned() {
  if (!S.pinnedId) return;
  var t = document.getElementById("diem-" + S.pinnedId);
  if (!t) return;
  var hdr = document.querySelector(".header");
  var prog = document.querySelector(".progress");
  var offset = (hdr ? hdr.offsetHeight : 0) + (prog ? prog.offsetHeight : 0) + 8;
  window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - offset, behavior: "smooth" });
}

document.addEventListener("visibilitychange", function() {
  if (document.visibilityState === "visible") scrollToPinned();
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('../../../serviceWorker.js').catch(function() {});
}
