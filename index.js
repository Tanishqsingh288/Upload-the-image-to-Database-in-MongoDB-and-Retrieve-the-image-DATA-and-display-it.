const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const bodyparser = require('body-parser');

const app=express()

app.use(bodyparser.json())


app.get("/",(req,res)=>{
    res.sendFile(path.join(__dirname,"index.html"))
});



// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/test").then(() => {
    console.log("Database connected");
}).catch((err) => {
    console.log("Can't connect to the DB due to error: " + err);
});

// Mongoose Image Schema
const imageSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    data: {
        type: Buffer, // Store image as binary data
        required: true,
    },
    contentType: {
        type: String, // MIME type of the image (e.g., 'image/jpeg')
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

const Image = mongoose.model('Image', imageSchema);

// Set up multer for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Route to handle image upload
app.post("/upload", upload.single('image'), async (req, res) => {
    try {
        const img = req.file;
        if (!img) {
            return res.status(400).send('No image uploaded');
        }

        const newImage = new Image({
            name: img.originalname,
            data: img.buffer,
            contentType: img.mimetype,
        });

        await newImage.save();
        res.send('Image uploaded and saved successfully!');
    } catch (err) {
        console.log(err);
        res.status(500).send('Error uploading image.');
    }
});

// Start the server
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});



// Route to retrieve and serve the image
app.get('/image/:id', async (req, res) => {
    try {
        const image = await Image.findById(req.params.id);
        if (!image) {
            return res.status(404).send('Image not found');
        }
        
        res.set('Content-Type', image.contentType);
        res.send(image.data);
    } catch (err) {
        console.log(err);
        res.status(500).send('Error retrieving image.');
    }
});
