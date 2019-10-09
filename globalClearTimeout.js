console.log("Use the setTimeout() function to delay a printout,");
console.log("but clear the timer before it can expire and print anything.")
function printTimerExpired() {
  console.log("Timer expired.");
}
console.log("Starting ...");
let timer = setTimeout(printTimerExpired, 5000);
console.log("... Set 5 second timer");

console.log("... clearing timer ...");
clearTimeout(timer);
console.log("... timer cleared, should not expire.")
