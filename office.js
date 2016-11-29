"use strict";

document.addEventListener("DOMContentLoaded", function() {
  let inputs = document.querySelectorAll('input[type="checkbox"]');

  Array.from(inputs).forEach(input => {
    input.addEventListener("change", function(event) {
      let json = {};
      json[input.dataset.user] = input.checked;

      let request = new XMLHttpRequest();
      request.open("POST", "/switch");
      request.send(JSON.stringify(json));
      request.onreadystatechange = function() {
        if(request.readyState == 4) {
          if(request.status == 500) {
            event.preventDefault();
          }

        }
      }
    });
  });
});
