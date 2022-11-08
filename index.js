const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const app = express();
const port = process.env.PORT || 5000;

require('dotenv').config();
app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASSWORD}@cluster0.t0pnxex.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function dbConnect() {
    try {
        await client.connect();
        console.log('database connected')
    } catch (error) {
        console.log(error.name, error.message);
    }
}

dbConnect();

// db and collections 
const Services = client.db("doctorDB").collection("services");

// endpoints 
app.get('/services', async (req, res) => {
    try {
        const cursor = Services.find({});
        const fewServices = await cursor.limit(3).toArray();
        res.send({
            success: true,
            data: fewServices,
        })

    } catch (error) {
        res.send({
            success: false,
            message: error.message
        })
    }
});


app.get('/allServices', async (req, res) => {
    try {
        const cursor = Services.find({});
        const services = await cursor.toArray();
        res.send({
            success: true,
            data: services,
        })

    } catch (error) {
        res.send({
            success: false,
            message: error.message
        })
    }
});

app.get('/', (req, res) => {
    res.send('health pursue server is running');
});

app.listen(port, () => {
    console.log(`health pursue is running at ${port}`);
})