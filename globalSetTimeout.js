console.log("Use the setTimeout() function to delay a printout");
function printTimerExpired() {
  console.log("Timer expired.");
}
console.log("Starting ...");
setTimeout(printTimerExpired, 5000);
console.log("... Set 5 second timer");
