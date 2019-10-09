console.log("Hello, world! -- dom-manipulation");

function addListItem(input, target) {
  let listItem = document.createElement('li');
  listItem.innerHTML = input;
  target.appendChild(listItem);
}

document.addEventListener('DOMContentLoaded', function() {
  let displayPromptButton = document.getElementById('displayPromptButton');
  let viewInputColor = document.getElementById('color');
  let viewColorList = document.getElementById('colorList');
  displayPromptButton.addEventListener('click', function() {
    console.log('clicked!');
    let input = prompt('What is your favorite color?');
    console.log('input is "' + input + '"');
    if (input != '' && input != null) {
      viewInputColor.innerHTML = "Your favorite color is: " + input;
      addListItem(input, viewColorList)
    }
  });
});
