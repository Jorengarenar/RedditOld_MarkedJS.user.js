// ==UserScript==
// @name         Hacker News - comment collapse
// @description  Collapse comment tree without scrolling to its root (similar as on Reddit New)
// @version      0.5.0
// @author       Jorengarenar
// @namespace    https://joren.ga
// @match        https://news.ycombinator.com/item?id=*
// @grant        GM_addStyle
// ==/UserScript==

GM_addStyle(`
  .comment-collapser {
    border-right: 1px dotted white;
    margin: 7px auto;
    position: absolute;
    width: 6px;
  }

  .comment-collapser:hover {
    border-width: 3px;
    width: 5.1px;
  }
`);

function countHeight(comments, i) {
  let height = comments[i].offsetHeight;
  let ind = comments[i].querySelector("td.ind > img").width;
  for (let j = i+1; j < comments.length; ++j) {
    if (comments[j].querySelector("td.ind > img").width > ind) {
      height += comments[j].offsetHeight;
    } else {
      break;
    }
  }
  return height;
}

function collapse() {
  let comment = this.closest(".athing.comtr");
  comment.querySelector(".default .comhead .togg").click();

  let top = comment.getBoundingClientRect().top;
  if (top < 0) { // if top of comment is out of viewport, scroll to it
    window.scrollTo(null, window.scrollY + top - 10);
  }

  generateCollapsers();
}

function generateCollapsers() {
  document.querySelectorAll(".comment-collapser").forEach((cl) => {
    cl.parentNode.removeChild(cl);
  });

  let comments = document.querySelectorAll(".comment-tree .athing.comtr");
  for (let i = 0; i < comments.length; ++i) {
    let div = document.createElement("div");
    div.className = "comment-collapser";
    div.onclick = collapse;
    div.style = "height: " + (countHeight(comments, i) - 30) + "";
    comments[i].querySelector("td.votelinks").appendChild(div);
  }
}

document.querySelectorAll(".athing.comtr .default .comhead .togg").forEach((t) => {
  t.addEventListener("click", generateCollapsers);
});
generateCollapsers();
