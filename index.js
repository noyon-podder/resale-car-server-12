const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();


const port = process.env.PORT || 5000;

const app = express();

//middleware
app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.tlsofwm.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    const categoryCollection = client.db('resaleCarDB').collection('category');
    const carsCollection = client.db('resaleCarDB').collection('cars');
    const usersCollection = client.db('resaleCarDB').collection('users');
    const bookingsCollection = client.db('resaleCarDB').collection('bookings');
   
    //category collection here
    app.get('/category', async(req, res) => {
        const query = {}
        const result = await categoryCollection.find(query).toArray();
        res.send(result)
    })

    app.get('/category/:categoryId', async(req, res) => {
        const category = req.params.categoryId;
        const query = {
            categoryId: category
        }
        const cars = await carsCollection.find(query).toArray();
        res.send(cars)
    })
    app.post('/users', async(req, res) => {
        const user = req.body;
        const cursor = await usersCollection.insertOne(user);
        res.send(cursor);
    })

    
    //bookings collection 

    app.post('/bookings', async(req, res) => {
        const booking = req.body
        const cursor = await bookingsCollection.insertOne(booking);
        res.send(cursor);
    })
    
}
run().catch(console.log)

app.get('/', async(req, res) => {
    res.send('resale server was running')
})

app.listen(port, () => console.log(`server running port : ${port}`))