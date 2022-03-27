// ==UserScript==
// @name         SteamGifts - One-Click Entry
// @version      1.0.0
// @description  Enter/Leave button
// @author       Jorengarenar
// @namespace    joren.ga
// @include      https://www.steamgifts.com/
// @include      https://www.steamgifts.com/giveaways*
// ==/UserScript==

"use strict";

const parseHTML = (string) => new DOMParser().parseFromString(string, "text/html");

document.querySelectorAll('.giveaway__row-inner-wrap').forEach((ga) => {
  if (ga.querySelector('.giveaway__column--contributor-level--negative')) { return; }

  const faded = ga.classList.contains('is-faded');

  const btn = document.createElement("button");
  btn.style = "cursor: pointer; background: inherit";
  btn.className = `one-click-entry ${faded ? 'leave' : ''}`;
  btn.textContent = faded ? 'Leave' : 'Enter';

  btn.onclick = function() {
    fetch(ga.querySelector('.giveaway__heading__name').href).then((res) => res.text()).then((data) => {
      const form = new FormData(parseHTML(data).querySelector('div[data-do^="entry_"]').closest("form"));
      form.set('do', btn.classList.contains('leave') ? "entry_delete" : "entry_insert");
      fetch("/ajax.php", { method: "post", body: form }).then((res) => res.json()).then((d) => {
        if (d?.type === "success") {
          btn.classList.toggle('leave');
          btn.closest('.giveaway__row-inner-wrap').classList.toggle("is-faded");
          btn.textContent = btn.classList.contains('leave') ? 'Leave' : 'Enter';
          document.querySelector('.nav__points').textContent = d.points;
        }
      });
    });
  };

  ga.querySelector('.giveaway__columns').append(btn);
});
