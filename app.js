const express = require('express')
const app = express()

const mongoose = require('mongoose')
const bodyParser = require('body-parser')
require('dotenv/config')

app.use(bodyParser.json())

const postsRoute = require('./routes/posts')
const authRoute = require('./routes/auth')

app.use('/api/posts',postsRoute)
app.use('/api/user',authRoute)

app.get('/', (req,res)=>{
    res.send('Welcome to the Piazza App!')
})

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DB_CONNECTOR);
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
}

connectDB()

app.listen(3000, ()=>{
    console.log('Server is running')
})