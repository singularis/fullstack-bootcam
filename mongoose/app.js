const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/testDB');


const testScheme = new mongoose.Schema({ 
    name: {
        type: String,
        required: [true, "No name specified"]
      },
    rating: {
        type: Number,
        min: 1,
        max: 10
    },
    review: String
});

const Test = mongoose.model("Test", testScheme)


const test = new Test (
    {rating: 34, review: "test"}
)


//test.save().then(() => console.log('Done'));

const peopleScheme = new mongoose.Schema({ 
    name: String,
    age: Number,
    favorite: testScheme,
});

const Person = mongoose.model("Person", peopleScheme)

const razer = new Test (
    {name: "razer", rating: 4, review: "test"}
)

const person = new Person (
    { name: "Dante", age: 5}
)

//razer.save().then(() => console.log('razer added'));

const diego = new Person (
    { name: "Diego", age: 5, favorite: razer }
)

const potato = new Test (
    {name: "potato", rating: 9, review: "test"}
)

potato.save().then(() => console.log('potato added'));

//diego.save().then(() => console.log('diego added'));
//person.save().then(() => console.log('Person added'));

// const mango = new Test ({
//     name: "Mango",
//     score: "5",
//     review: "Can be"
// });


// const banana = new Test ({
//     name: "banana",
//     score: "5",
//     review: "Can be"
// });

// const orange = new Test ({
//     name: "orange",
//     score: "5",
//     review: "Can be"
// });

// Test.insertMany([mango, banana, orange], function (err) { 
//     if (err) {
//         console.log(err)
//     }
//     else {
//         console.log("Done")
//     }
// })

Test.find(function(err, returnData) {
    if (err) {
        console.log(err)
    }
    else {
        
        returnData.forEach(
        function printer(item) {
            console.log(item.name)
        }
        )}
});

Person.updateOne({_id: "62b8adfaf99f7b69765efd40"}, {favorite: potato}, function(err){
    if (err) {
        console.log("there is error")
    } else {
        console.log("data update")
        mongoose.connection.close()
    }
})

// Test.deleteOne({_id: "62b737f24d05c95866d1e4f5"}, function(err){
//     if (err) {
//         console.log("there is error")
//     } else {
//         console.log("data update")
//         mongoose.connection.close()
//     }
// })

// Person.deleteMany({name: "Dante"}, function(err){
//     if (err) {
//         console.log("there is error")
//     } else {
//         console.log("data update")
//         mongoose.connection.close()
//     }
// })
