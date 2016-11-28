"use strict";

document.addEventListener("DOMContentLoaded", function() {
  let inputs = document.querySelectorAll('input[type="checkbox"]');

  Array.from(inputs).forEach(input => {
    input.addEventListener("change", changeStatus)
  });
});

function changeStatus(e) {
  console.log("Changed...");
}
