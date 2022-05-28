const superheroes = require('superheroes');
const supervillains = require('supervillains');
 
superheroes.all;
//=> ['3-D Man', 'A-Bomb', …]
 
var test = superheroes.random();
console.log(test)
//=> 'Spider-Ham'



var test1= supervillains.all;
console.log(test1)
//=> 'Mud Pack'