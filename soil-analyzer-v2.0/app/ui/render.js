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
}

load();
render();

// Warn before tab close / hard refresh when a session is open
window.addEventListener("beforeunload", function(e) {
  if (S.cp) { e.preventDefault(); e.returnValue = ""; }
});

// Prevent pull-to-refresh on mobile (overscroll-behavior via CSS is preferred,
// but this JS guard catches browsers that ignore the CSS property)
document.addEventListener("touchmove", function(e) {
  if (window.scrollY === 0 && e.touches[0].clientY > 0) e.preventDefault();
}, { passive: false });

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./serviceWorker.js').catch(function() {});
}
