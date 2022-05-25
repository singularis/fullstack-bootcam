var buttonColours = ["red", "blue", "green", "yellow"]
var gamePattern = []
var userClickedPattern = []
var level = 0
var gameStatus = 0


function nextSequence() {
    $("#level-title").text("Level " + level);
    level++
    randomNumber = Math.round((Math.random() * 3))
    randomChosenColour = buttonColours[randomNumber]
    gamePattern.push(randomChosenColour)
    $("." + randomChosenColour).fadeTo(500, 0.1, function () {
        $(this).fadeTo(500, 1.0);
    });
    playSound(randomChosenColour)
    console.log("gamePattern " + gamePattern)
}

function playSound(name) {
    var audio = new Audio('./sounds/' + name + '.mp3');
    audio.play();
}

function animatePress(currentColour) {
    $(currentColour).addClass("pressed")
    setTimeout(function () {
        $(currentColour).removeClass("pressed");
    }, 100);
}


$(document).keypress(function (event) {
    if (event.keyCode == 97 && gameStatus === 0) {
        nextSequence()
        gameStat()
    }
    if (gameStatus === 0) {
        nextSequence()
        gameStat()
    }
});

function gameStat() {
    gameStatus = 1;
    if (gameStatus === 0) {
        gameStatus = 1;
    }
}

$(".btn").click(function () {
    if (gameStatus == 1) {
        button = $(this).attr("id")
        playSound(button)
        animatePress(this)
        userClickedPattern.push(button);
        console.log("User pattern " + userClickedPattern);
        if (userClickedPattern.length == level) {
            checkAnswer(userClickedPattern.length - 1)
        }

    }
});


function checkAnswer(currentLevel) {
    if (gamePattern[currentLevel] == userClickedPattern[currentLevel]) {
        setTimeout(function () {
            nextSequence()
            userClickedPattern = []
        }, 100);
    } else {
        playSound("wrong")
        $("body").addClass("game-over")
        setTimeout(function () {
            $("body").removeClass("game-over");
        }, 1000);
        $("#level-title").text("Game Over, Press Any Key to Restart");
        startOver()
    }
}

function startOver() {
    level = 0;
    gamePattern = [];
    gameStatus = 0;
    userClickedPattern = [];
}

$("#level-title").text("Press A Key to Start");