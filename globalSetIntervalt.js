console.log("Use the setInterval() function to repeat a printout.")
function printTimerExpired() {
  console.log("Timer expired.");
}
console.log("Starting ...");
setInterval(printTimerExpired, 5000);
console.log("... Set 5 second interval");
