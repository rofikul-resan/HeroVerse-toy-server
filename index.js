const express = require("express");
require("dotenv").config();
const cors = require("cors");
const port = process.env.PORT || 5000;
const app = express();

//middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.absippg.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const toyCollection = client.db("hero-toys").collection("toy");

    app.post("/toy", async (req, res) => {
      const data = req.body;
      const result = await toyCollection.insertOne(data);
      res.send(result);
    });

    app.get("/toys", async (req, res) => {
      const limit = req.query.limit;
      const toy = await toyCollection.find().limit(+limit).toArray();
      res.send(toy);
    });

    app.delete("/toys/:id", async (req, res) => {
      const id = req.params.id;
      const result = await toyCollection.deleteOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    app.get("/toys-name/:name", async (req, res) => {
      const limit = req.query.limit;
      const nameKey = req.params.name;
      console.log(nameKey);
      const query = { name: { $regex: nameKey, $options: "i" } };
      const toy = await toyCollection.find(query).limit(+limit).toArray();
      res.send(toy);
    });

    app.get("/my-toys", async (req, res) => {
      const email = req.query.email;
      const limit = req.query.limit;
      const query = { sellerEmail: email };
      const toy = await toyCollection.find(query).limit(+limit).toArray();
      res.send(toy);
    });

    app.get("/toys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const toy = await toyCollection.findOne(query);
      res.send(toy);
    });

    app.get("/all-photo", async (req, res) => {
      const limit = req.query.limit;
      const option = {
        projection: { pictureURL: 1 },
      };
      const result = await toyCollection.find({}, option).toArray();
      res.send(result);
    });

    app.get("/category", async (req, res) => {
      const queryKey = req.query.category;
      const limitToy = req.query.limit;
      const query = { subCategory: { $regex: queryKey, $options: "i" } };
      const result = await toyCollection.find(query).limit(+limitToy).toArray();
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hay buddy i am running");
});

app.listen(port);
