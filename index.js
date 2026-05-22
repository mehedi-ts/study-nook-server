const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");
const { createRemoteJWKSet, jwtVerify } = require("jose-cjs");
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
const JWKS = createRemoteJWKSet(
  new URL(`${process.env.CLIENT_URL}/api/auth/jwks`),
);
const verifyToken = async (req, res, next) => {
  const authHeader = req?.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const { payload } = await jwtVerify(token, JWKS);
    console.log(payload);
    next();
  } catch (error) {
    return res.status(403).json({ message: "Forbidden" });
  }
};

const run = async () => {
  try {
    // await client.connect();

    const db = client.db("studyNook");
    const roomCollection = db.collection("rooms");
    const BookingCollection = db.collection("booking");
    app.post("/all-rooms", async (req, res) => {
      const newRoom = req.body;
      const result = await roomCollection.insertOne(newRoom);
      res.send(result);
    });
    app.post("/booking", verifyToken, async (req, res) => {
      const newbooking = req.body;

      const { roomId, date, startTime, endTime } = newbooking;

      const conflict = await BookingCollection.findOne({
        roomId,
        date,
        $or: [
          {
            startTime: { $lt: endTime },
            endTime: { $gt: startTime },
          },
        ],
      });

      if (conflict) {
        return res.status(400).send({
          success: false,
          message: "This time slot is already booked",
        });
      }

      const result = await BookingCollection.insertOne(newbooking);
      res.send({
        success: true,
        message: "Room booked successfully",
        result,
      });
    });
    app.delete("/booking/:id", verifyToken, async (req, res) => {
      const id = req.params.id;

      const result = await BookingCollection.deleteOne({
        _id: new ObjectId(id),
      });

      if (result.deletedCount === 0) {
        return res.status(404).send({
          success: false,
          message: "Booking not found",
        });
      }

      res.send({
        success: true,
        message: "Booking deleted successfully",
        result,
      });
    });
    app.get("/bookings/user/:userId", verifyToken, async (req, res) => {
      const userId = req.params.userId;
      const query = {
        userId: userId,
      };
      const result = await BookingCollection.find(query).toArray();
      res.send(result);
    });
    app.get("/booking-count/:roomId", verifyToken, async (req, res) => {
      const roomId = req.params.roomId;

      const count = await BookingCollection.countDocuments({
        roomId: roomId,
      });

      res.send({ count });
    });
    app.get("/all-rooms", async (req, res) => {
      try {
        const { search, amenities } = req.query;

        const query = {};

        // SEARCH
        if (search) {
          query.roomName = {
            $regex: search,
            $options: "i",
          };
        }

        // AMENITIES FILTER
        if (amenities) {
          const amenitiesArray = amenities
            .split(",")
            .map((item) => item.trim());

          query.amenities = {
            $elemMatch: {
              $in: amenitiesArray,
            },
          };
        }

        const result = await roomCollection.find(query).toArray();

        res.send(result);
      } catch (error) {
        console.log(error);

        res.status(500).send({
          success: false,
          message: "Failed to fetch rooms",
        });
      }
    });
    app.get("/latest-rooms", async (req, res) => {
      try {
        const rooms = await roomCollection
          .find()
          .sort({ _id: -1 })
          .limit(6)
          .toArray();

        res.send(rooms);
      } catch (error) {
        res.status(500).send({ message: "Failed to fetch rooms" });
      }
    });

    app.get("/all-rooms/:id", verifyToken, async (req, res) => {
      const id = req.params.id;
      const query = {
        _id: new ObjectId(id),
      };
      const result = await roomCollection.findOne(query);
      if (!result) {
        return res.status(404).json({ message: "Room not found" });
      }
      res.send(result);
    });
    app.delete("/all-rooms/:id", verifyToken, async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await roomCollection.deleteOne(filter);

      res.send(result);
    });
    app.patch("/all-rooms/:id", verifyToken, async (req, res) => {
      try {
        const id = req.params.id;
        const updatedData = req.body;

        const filter = { _id: new ObjectId(id) };

        const updateDoc = {
          $set: {
            roomName: updatedData.roomName,
            description: updatedData.description,
            image: updatedData.image,
            floor: updatedData.floor,
            capacity: updatedData.capacity,
            hourlyRate: updatedData.hourlyRate,
            amenities: updatedData.amenities,
          },
        };

        const result = await roomCollection.updateOne(filter, updateDoc);

        res.send(result);
      } catch (error) {
        console.error("PATCH ERROR:", error);
        res.status(500).send({ success: false, message: "Update failed" });
      }
    });
    app.get("/my-rooms/:userId", verifyToken, async (req, res) => {
      const userId = req.params.userId;

      const rooms = await roomCollection
        .find({
          userId: userId,
        })
        .toArray();

      res.send(rooms);
    });

    // await client.db("admin").command({ ping: 1 });
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
