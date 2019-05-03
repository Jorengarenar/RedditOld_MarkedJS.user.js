// ==UserScript==
// @name         ESG - Hide entered
// @description  Adds checkbox on the main page to hide/unhide entered giveaways while using Extended Steamgifts. Do not use with default ESG "Hide entered giveaways" option
// @author       Jorengarenar
// @version      1.3.2
// @include      *steamgifts.com*
// ==/UserScript==

let checkbox = document.createElement('input');
checkbox.type = "checkbox";
checkbox.style = "width: initial"
checkbox.onclick = function() {
    if (this.checked) {
        $(".sidebar__entry-insert.is-hidden").siblings(".sidebar__error.is-hidden").closest(".giveaway__row-outer-wrap").hide()
        $(document).on('scroll', function() {
            $(".sidebar__entry-insert.is-hidden").siblings(".sidebar__error.is-hidden").closest(".giveaway__row-outer-wrap").hide()
        });
    } else {
        $(".sidebar__entry-insert.is-hidden").closest(".giveaway__row-outer-wrap").show()
        $(document).on('scroll', function() {
            $(".sidebar__entry-insert.is-hidden").closest(".giveaway__row-outer-wrap").show()
        });
    }
}

let label = document.createElement('label');
label.className = "sidebar__navigation__item__name"
label.innerText = "Hide entered"
label.style = "vertical-align: middle"
label.appendChild(checkbox);

let div_hidder = document.createElement('div');
div_hidder.style = "display: inline-flex; position: sticky; top:15px";
div_hidder.appendChild(label);

$(".sidebar__navigation:last").after(div_hidder);

$(function() {
    checkbox.click();

    window.setTimeout(function() {
        if ( checkbox.checked ) {
            $(".sidebar__entry-insert").click(function() {
                $(this).closest(".giveaway__row-outer-wrap").fadeOut(300);
            });
            $(document).on('scroll', function() {
                $(".sidebar__entry-insert").click(function() {
                    $(this).closest(".giveaway__row-outer-wrap").fadeOut(300);
                });
            });
        }
    }, 100);
});
