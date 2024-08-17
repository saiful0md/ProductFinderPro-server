const express = require('express')
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express()
const cors = require('cors')
require('dotenv').config();
const port = process.env.PORT || 5000

// midleware
app.use(cors({
  origin: ["http://localhost:5173", ""],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  withCredentials: true,
}
))
app.use(express.json())


app.get('/', (req, res) => {
  res.send('ProductFinderPro')
})

app.listen(port, () => {
  console.log(`ProductFinderPro is running port: ${port}`);
})

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xes5bsh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {

    const allProductsCollection = client.db('productsFinderPro').collection('allProducts')

    app.get('/allProducts', async (req, res) => {
      const { page = 1, limit = 10, search = '', category, sort } = req.query;
      console.log(search);
      let query = {};
      if (search) {
        query.productName = { $regex: search, $options: 'i' };
      }
      let sortOrder = {};
      if (sort === 'priceAsc') {
        sortOrder.price = 1;
      } else if (sort === 'priceDesc') {
        sortOrder.price = -1;
      } else if (sort === 'dateDesc') {
        sortOrder.creationDate = -1;
      }
      const result = await allProductsCollection.find(query).sort(sortOrder).limit(parseInt(limit))
      .skip((page - 1) * parseInt(limit)).toArray()
      res.send(result)
    })
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error

  }
}
run().catch(console.dir);
