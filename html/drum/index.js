for (var i = 0; i < document.querySelectorAll(".drum").length; i++) {
    document.querySelectorAll(".drum")[i].addEventListener("click", function handlerClick() {
        this.style.color = "white";
        player(this.innerHTML)
        buttonAnimation(this.innerHTML)
            
    })
}

document.addEventListener("keydown", function (event){
    player(event.key)
    buttonAnimation(event.key)
})


function player (trigger) {
    switch (trigger) {
        case "w":
            var audion = new Audio('./sounds/tom-1.mp3');
            audion.play();
            break;
        case "a":
            var audion = new Audio('./sounds/tom-2.mp3');
            audion.play();
            break;
        case "s":
            var audion = new Audio('./sounds/tom-3.mp3');
            audion.play();
            break;
            case "d":
            var audion = new Audio('./sounds/tom-4.mp3');
            audion.play();
            break;
            case "j":
            var audion = new Audio('./sounds/crash.mp3');
            audion.play();
            break;
            case "k":
            var audion = new Audio('./sounds/kick-bass.mp3');
            audion.play();
            break;
            case "l":
            var audion = new Audio('./sounds/snare.mp3');
            audion.play();
            break;
        default:
            console.log(this.innerHTML)
            break;
    }
}

function buttonAnimation (key) {
    var press = document.querySelector("." + key);
    press.classList.add("pressed");
    setTimeout(function() {
        press.classList.remove("pressed"); 
    }, 100);
}