const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const app = express();
const port = process.env.PORT || 5000;

require('dotenv').config();
app.use(cors());
app.use(express.json());


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
const Reviews = client.db("doctorDB").collection("reviews");

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

app.get('/services/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const query = { _id: ObjectId(id) };
        const service = await Services.findOne(query);
        res.send({
            success: true,
            data: service
        })

    } catch (error) {
        res.send({
            success: false,
            message: error.message
        })
    }
});

app.post('/reviews', async (req, res) => {
    try {
        const doc = req.body;
        const result = await Reviews.insertOne(doc);
        if (result.insertedId) {
            res.send({
                success: true,
                message: `Successfully Created the Review`
            })
        }
        else {
            res.send({
                success: false,
                message: `Couldn't create the review. please try again`
            })
        }

    } catch (error) {
        res.send({
            success: false,
            message: error.message
        })
    }
});

app.get('/reviews', async (req, res) => {
    try {
        if (req.query.serviceId) {
            const query = {
                serviceId: req.query.serviceId
            }

            const cursor = Reviews.find(query).sort({ date: -1 });
            const review = await cursor.toArray();
            res.send({
                success: true,
                data: review
            })
        }

    } catch (error) {
        res.send({
            success: false,
            message: error.message
        })
    }
});

const verifyJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).send({ message: 'unauthorized access' });
        }
        req.decoded = decoded;
        next();
    })
}

app.post('/jwt', async (req, res) => {
    const user = req.body;
    const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '5h' })
    res.send({ token });
})

app.get('/user-reviews', verifyJWT, async (req, res) => {
    try {
        const decoded = req.decoded;

        if (decoded.email !== req.query.email) {
            return res.status(403).send({ message: 'Unauthorized Access' });
        }

        if (req.query.email) {
            const query = {
                email: req.query.email
            }
            const cursor = Reviews.find(query).sort({ date: -1 });
            const review = await cursor.toArray();
            res.send({
                success: true,
                data: review
            })
        }

    } catch (error) {
        res.send({
            success: false,
            message: error.message
        })
    }
});

app.get('/user-reviews/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const query = { _id: ObjectId(id) };
        const review = await Reviews.findOne(query);
        res.send({
            success: true,
            data: review
        })

    } catch (error) {
        res.send({
            success: false,
            message: error.message
        })
    }
});

app.patch('/user-reviews/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const filter = { _id: ObjectId(id) };
        const updateReview = {
            $set: {
                date: req.body.date,
                ratings: req.body.ratings,
                review: req.body.review,
            }
        }

        const result = await Reviews.updateOne(filter, updateReview);
        if (result.matchedCount) {
            res.send({
                success: true,
                message: `Update Review Successfully`
            })
        }
        else {
            res.send({
                success: false,
                message: `Couldn't Update. Please Try Again`
            })
        }

    } catch (error) {
        res.send({
            success: false,
            message: error.message
        })
    }
});

app.delete('/user-reviews/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const query = { _id: ObjectId(id) };
        const result = await Reviews.deleteOne(query);
        if (result.deletedCount) {
            res.send({
                success: true,
                message: `Successfully Deleted`
            })
        }
        else {
            res.send({
                success: false,
                message: `Couldn't Delete the Reviews, Please try again`
            })
        }

    } catch (error) {
        res.send({
            success: false,
            message: error.message
        })
    }
})



app.post('/allServices', async (req, res) => {
    try {
        const doc = req.body;
        const result = await Services.insertOne(doc);
        if (result.insertedId) {
            res.send({
                success: true,
                message: `Successfully Created the Service`
            })
        }
        else {
            res.send({
                success: false,
                message: `Couldn't create the service. Please try again`
            })
        }

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