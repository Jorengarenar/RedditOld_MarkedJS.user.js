// ==UserScript==
// @name         Show on AniChart only anime from username's AniList
// @description  Hide anime which isn't on your (or somebody's else) AniList watching/planning list
// @author       Jorengarenar
// @namespace    https://joren.ga
// @version      1.0.0
// @run-at       document-start
// @match        https://anichart.net/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// ==/UserScript==

const setUsername = () => {
  GM_setValue("username", prompt("AniList username: "));
  window.location.reload(false);
};
GM_registerMenuCommand("Set username", setUsername);
const userName = GM_getValue("username") || setUsername();

fetch("https://graphql.anilist.co", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
  body: JSON.stringify({
    query: `query ListView($statuses: [MediaListStatus!] = [CURRENT PLANNING]) {
              listCollection: MediaListCollection(userName: "${userName}", type: ANIME, forceSingleCompletedList: true, status_in: $statuses) {
                lists { entries { media { id } } }
              }
            }`
  })
}).then((res) => res.json().then((json) => res.ok ? json : Promise.reject(json))).then((json) => {
  let myAnimeIDs = json.data.listCollection.lists.map(x => x.entries.map(y => y.media.id)).reduce((a, b) => a.concat(b), []);
  new MutationObserver(function() {
    document.querySelectorAll("div.media-card").forEach((card) => {
      let id = card.querySelector("a.title").href.match(/\/(\d+)\//)[1];
      if (!myAnimeIDs.includes(parseInt(id))) { card.remove(); }
    });
  }).observe(document.body, { childList: true, subtree: true });
}).catch(console.error);
