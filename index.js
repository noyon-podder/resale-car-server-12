const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

require('dotenv').config();

const stripe = require("stripe")('sk_test_51M8T8rC3nf5rDn3xdpe2Ofw0PaQW7M04zwyeE5lF0lmfO6Y1ETbuTR29y5Qwxsd8smOQrtZuZqIJvgCjIXuWywSy00Zo7gqYKG');

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

    app.get('/all-product', async(req, res) => {
        const query = {}
        const result = await carsCollection.find(query).toArray();
        res.send(result);
    })

    app.get('/category/:categoryId', async(req, res) => {
        const category = req.params.categoryId;
        const query = {
            categoryId: category
        }
        const cars = await carsCollection.find(query).toArray();
        res.send(cars)
    })

    app.post('/category', async(req, res) => {
        const product = req.body;
        const cursor = await carsCollection.insertOne(product);
        res.send(cursor);
    })

    app.delete('/all-product/:id', async(req, res) => {
        const id = req.params.id;
        const filter = { _id: ObjectId(id)}
        const result = await carsCollection.deleteOne(filter)
        res.send(result)
    })

    //users collection
    app.post('/users', async(req, res) => {
        const user = req.body;
        const cursor = await usersCollection.insertOne(user);
        res.send(cursor);
    })

    
    //bookings collection 

    app.get('/bookings', async(req, res) => {
        const query = {}
        const booking = await bookingsCollection.find(query).toArray();
        res.send(booking)
    })

    app.get('/bookings/:id', async(req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id)}
        const result = await bookingsCollection.findOne(query)
        res.send(result)
    })

    app.post('/bookings', async(req, res) => {
        const booking = req.body
        const cursor = await bookingsCollection.insertOne(booking);
        res.send(cursor);
    })
    
    app.post("/create-payment-intent", async(req, res) => {
        const booking = req.body;
        const productPrice = booking.productPrice;
        const amount = productPrice * 100;

        console.log('amount is ', amount)
        const paymentIntent = await stripe.paymentIntents.create({
            currency: 'usd',
            amount: amount,
            "payment_method_types": [
                "card"
            ]
        });
        res.send({
            clientSecret: paymentIntent.client_secret,
        })
    })
    // users collection 
    app.get('/dashboard/admin/:email', async(req, res) => {
        const email = req.params.email;
        const filter = {
            email: email
        }
        const user = await usersCollection.findOne(filter);
        res.send({isAdmin: user?.role == "admin"})
    })

   
    
}
run().catch(console.log)

app.get('/', async(req, res) => {
    res.send('resale server was running')
})

app.listen(port, () => console.log(`server running port : ${port}`))