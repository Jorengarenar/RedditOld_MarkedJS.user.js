// ==UserScript==
// @name         Auto import from AniList to AniChart
// @description  Automatically marks anime from Watching/Planning list as "Watching" / "Maybe Watching" (may require refreshing page twice)
// @author       Jorengarenar
// @namespace    https://joren.ga
// @version      1.0.0
// @run-at       document-start
// @match        https://anichart.net/*
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

"use strict";

if (Date.now() > (GM_getValue("jwt")?.expires || 0)) {
  if (window.location.hash.length === 0) {
    window.location.replace(`https://anilist.co/api/v2/oauth/authorize?client_id=6629&response_type=token`);
  } else {
    let urlSearch = new URLSearchParams(window.location.hash.substring(1));
    GM_setValue("jwt", {
      token: urlSearch.get("access_token"),
      expires: Date.now() + urlSearch.get("expires_in"),
    });
    window.history.replaceState({}, document.title, "/");
  }
}

const access_token = GM_getValue("jwt")?.token;
if (!access_token) {
  console.error("Was not able to find access token");
  return;
}

const url = "https://graphql.anilist.co";
const handleResponse = (response) => response.json().then((json) => response.ok ? json : Promise.reject(json));

const headers = {
  "Authorization": "Bearer " + access_token,
  "Content-Type": "application/json",
  "Accept": "application/json",
};

let highlights = {};
function buildQuery(list, color) {
  let query = "";
  list.entries.forEach(entry => {
    let id = entry.media.id;
    if (highlights[id] != color) {
      query += `
      hi${id} : UpdateAniChartHighlights (highlights: {
        mediaId: ${id}
        highlight: "${color}"
      })`;
    }
  });
  return query;
};

function bar(lists) {
  let queryBody = buildQuery(lists[0], "green") + buildQuery(lists[1], "yellow");
  if (queryBody === "") { return; }
  fetch(url, {
    method: "POST",
    headers: headers,
    body: JSON.stringify({ query: "mutation {" + queryBody + "}" })
  }).then(handleResponse).catch(console.error);
}

function foo(userId) {
  fetch(url, {
    method: "POST",
    headers: headers,
    body: JSON.stringify({
      query: `
        query ($statuses: [MediaListStatus!] = [CURRENT PLANNING]) {
          MediaListCollection (userId: ${userId}, type: ANIME, forceSingleCompletedList: true, status_in: $statuses) {
            lists {
              entries {
                media {
                  id
                }
              }
            }
          }
        }`
    })
  }).then(handleResponse).then(data => bar(data.data.MediaListCollection.lists)).catch(console.error);
}

fetch(url, {
  method: "POST",
  headers: headers,
  body: JSON.stringify({ query: "query { AniChartUser { user { id } highlights } }", })
}).then(handleResponse).then((json) => {
  highlights = json.data.AniChartUser.highlights;
  foo(json.data.AniChartUser.user.id)
}).catch(console.error);
