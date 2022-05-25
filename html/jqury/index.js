$("h1").click(function() {
    $("h1").css("color", "green")
})

$("button").click(function (){
    $("h1").css("color", "purple");
})

$(document).keypress(function(event) {
    $("h1").text(event.key);
})


$("h1").before("<button>New</<button>")

$("button").click(function (){
    $("h1").animate({opacity: 0.5}).slideUp();
})