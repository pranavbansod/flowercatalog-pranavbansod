const makeGifVisible = function() {
  let gif = document.getElementById('gif');
  gif.style.visibility = "visible";
};

const animate = function() {
  let gif = document.getElementById('gif');
  gif.style.visibility = "hidden";
  setTimeout(makeGifVisible,1000);
};


const addListenerToGif = function() {
  let gif = document.getElementById('gif');
  gif.addEventListener("click",animate);
};

window.onload = addListenerToGif;
