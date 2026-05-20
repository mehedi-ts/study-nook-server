const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");
app.use(cors());
app.use(express.json());
dotenv.config();
const PORT = process.env.PORT;
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const run = async () => {
  try {
    await client.connect();

    const db = client.db("studyNook");
    const roomCollection = db.collection("rooms");
    const BookingCollection = db.collection("booking");
    app.post("/all-rooms", async (req, res) => {
      const newRoom = req.body;
      const result = await roomCollection.insertOne(newRoom);
      res.send(result);
    });
    app.post("/booking", async (req, res) => {
      const newbooking = req.body;
      console.log(newbooking);
      const result = await BookingCollection.insertOne(newbooking);
      res.send(result);
    });
    app.get("/all-rooms", async (req, res) => {
      const cursor = roomCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get("/all-rooms/:id", async (req, res) => {
      const id = req.params.id;
      const query = {
        _id: new ObjectId(id),
      };
      const result = await roomCollection.findOne(query);
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );
  } finally {
    // await client.close();
  }
};

app.get("/", (req, res) => {
  res.send("hello from server");
});
run().catch(console.dir);
app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
