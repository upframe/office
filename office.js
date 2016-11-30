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

                    if (el.checked != obj[person]) {
                        el.checked = obj[person];
                    }
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
    request.open("POST", "/api", true);
    request.send(body);
    request.onreadystatechange = function() {
        if (request.readyState == 4) {
            if (request.status != 200) {
                window.location.reload(true);
            }

            if (event.target.type == "text") window.location.reload(true);
        }
    }
}

function letmefuckingin(event) {
  event.preventDefault();

  let pwd = prompt("Tell me about passwords"),
    request = new XMLHttpRequest();
  console.log(pwd); // just a debug
  request.open("POST", "/auth", true);
  request.send(pwd);
  request.onreadystatechange = function() {
    if (request.readyState == 4) {
      if (request.status == 200) {
        window.location.reload();
      } else {
        alert("Your password didn't convince me... :(");
      }
    }
  }
}
