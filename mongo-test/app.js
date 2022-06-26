const { MongoClient } = require("mongodb");

// Replace the uri string with your MongoDB deployment's connection string.
const uri =
  "mongodb://localhost:27017";

const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();

    const database = client.db('test');
    const movies = database.collection('products');

    // Query for a movie that has the title 'Back to the Future'
    const query = { _id: 1 };
    const movie = await movies.findOne(query);

    console.log(movie);

    const fruitDB = client.db('fruit');

    const fruitCollection = fruitDB.collection("fruit");
    // create a document to insert
    const fruit = [
      { name: "Apple", score: 5, review: "test"}, 
      { name: "Orange", score: 5, review: "test"}, 
      { name: "Top", score: 5,review: "test"}
    ];
    const options = { ordered: true };
    //const result = await fruitCollection.insertMany(fruit, options);
    //console.log(`${result.insertedCount} documents were inserted`);
    const queryFruit = { score: { $lt: 15 } };
    const optionsFruit = {
        // Include only the `title` and `imdb` fields in each returned document
        projection: { name: 1, score: 1, review: 1 },
      };
    const fruits = fruitCollection.find(queryFruit, optionsFruit);

    console.log(fruits);




  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);