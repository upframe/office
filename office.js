"use strict";

document.addEventListener("DOMContentLoaded", function() {
    let team = document.getElementById('team');
    let update = function() {
        let request = new XMLHttpRequest();
        request.open("GET", "/api");
        request.send();
        request.onreadystatechange = function() {
            if (request.readyState == 4) {
                if (request.status != 200) {
                    window.location.reload(true);
                }

                // TODO: improve this
                let obj = JSON.parse(request.responseText);
                for (let person in obj) {
                    let el = document.getElementById(person);

                    if (!el) {
                        team.insertAdjacentHTML('beforeend', `<div>
                            <input id="${person}" type="checkbox" onchange="update(event)">
                            <label for="${person}" class="circle"></label>
                            <label for="${person}">@${person}</label>
                        </div>`);
                        el = document.getElementById(person);
                    }

                    el.checked = obj[person];
                }

                setTimeout(update, 1000);
            }
        }
    }

    update();
});

function update(event) {
    let body = "{}";

    if (event.target.type == "text") {
        if (event.keyCode != 13) {
            return true
        }

        body = `{"${event.target.value}":true}`;
    } else {
        body = `{"${event.target.id}":${event.target.checked}}`;
    }

    let request = new XMLHttpRequest();
    request.open("POST", "/api");
    request.send(body);
    request.onreadystatechange = function() {
        if (request.readyState == 4) {
            if (request.status != 200) {
                window.location.reload(true);
            }
        }
    }
}
