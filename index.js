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
      const { search = '', category, page, size, sort } = req.query;
      let query = {};
      if (search) {
        query.productName = { $regex: search, $options: 'i' };
      }
      if (category) {
        query.category = category;
      }
      let sortOrder = {};
      if (sort === 'priceAsc') {
        sortOrder.price = 1;
      } else if (sort === 'priceDesc') {
        sortOrder.price = -1;
      } else if (sort === 'dateDesc') {
        sortOrder.creationDate = -1;
      }
      const options = {
        skip: parseInt(page) * parseInt(size),
        limit: parseInt(size),
        sort: sortOrder
      };
      console.log(options);
      const result = await allProductsCollection.find(query, options).toArray()
      res.send(result)
    })
    app.get('/productsCount', async (req, res) => {
      const count = await allProductsCollection.estimatedDocumentCount()
      res.send({ count })
    })
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error

  }
}
run().catch(console.dir);
