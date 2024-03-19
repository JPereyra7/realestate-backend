require("dotenv").config();
const express = require("express");
const session = require('express-session');
const { MongoClient } = require("mongodb");
const cors = require("cors");
// const { createAccount } = require("./Controllers/userController");
const app = express();
const port = process.env.PORT || 3000;

//MongoDb URI
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

//Security
const bcrypt = require("bcrypt");

app.use(express.json());

app.use(
    cors({
      origin: "http://localhost:5500",
      credentials: true,
    })
  );

app.use(session({
    secret: 'my-secret-key',
    resave: false,
    saveUninitialized: false,
    credentials: true
}));

//Created to retrieve accounts in the db, just for internal use
app.get("/userslogin", async (req, res) => {
  try {
    await client.connect();
    const database = client.db("realestate"); // Databasnamnet i MongoDb
    const collection = database.collection("userslogin"); // Kollektionsnamnet
    const userslogin = await collection.find({}).toArray();
    res.json(userslogin);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    await client.close();
  }
});

app.post("/api/create", async (req, res) => {
    try {
        const { username, password, passwordIgen } = req.body;

        //Password Match Checker
        if (password !== passwordIgen) {
            return res.status(400).json({ Error: "Passwords do not match ❌" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        //Connecting to MongoDB
        await client.connect();
        const database = client.db("realestate");
        const collection = database.collection("userslogin");

        //Check if acc exists
        const existingUser = await collection.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: "User already exists ✖️" });
        }
        //Insert new accounts into the collection in MongoDB
        await collection.insertOne({ username, password: hashedPassword });

        //Close the MongoDB connection
        await client.close();
        //Respond with success!
        res.status(201).json({ success: "Account created successfully ✅" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
    });

    app.post("/login", async (req, res) => {
        try {
            const { username, password } = req.body;
            
            // Connect to MongoDB
            await client.connect();
            const database = client.db("realestate");
            const collection = database.collection("userslogin");
    
            // Find user by username
            const existingUser = await collection.findOne({ username });
    
            // Check if user exists
            if (!existingUser) {
                // await client.close(); // Close MongoDB connection
                return res.status(404).send("Invalid Login Credentials, try again!");
            }
    
            // Compare passwords
            const passwordValid = await bcrypt.compare(password, existingUser.password);
            
            // Check if password is valid
            if (!passwordValid) {
                // await client.close(); // Close MongoDB connection
                return res.status(404).send("Invalid Login Credentials");
            }
    
            // Store user session
            req.session.userId = existingUser._id;
    
            // await client.close(); // Close MongoDB connection
    
            console.log(req.session);
            res.status(200).send("Login Successful ✨");
        } catch (err) {
            console.error(err);
            res.status(500).send("Internal Server Error");
        }
    });
    

app.listen(port, () => {
  console.log(`MongoDB listening on port ${port}`);
});
