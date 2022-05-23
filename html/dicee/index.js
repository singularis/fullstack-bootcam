randomNumber1 = Math.round(Math.random() * 5) +1;
var image_number1 = "./images/dice" + randomNumber1 + ".png"
document.getElementsByClassName("img1")[0].setAttribute("src", image_number1);

function random_image() {

}

randomNumber2 = Math.round(Math.random() * 5) +1;
var image_number2 = "./images/dice" + randomNumber2 + ".png"
document.getElementsByClassName("img2")[0].setAttribute("src", image_number2);

if (randomNumber1 > randomNumber2) {
    document.getElementsByClassName("winner")[0].innerHTML= "😇Player 1 Wins🤢";
    console.log ("wins1;")
} else if (randomNumber1 < randomNumber2) {
    document.getElementsByClassName("winner")[0].innerHTML= "🤢Player 2 Wins😇";
} else document.getElementsByClassName("winner")[0].innerHTML= "Draw";