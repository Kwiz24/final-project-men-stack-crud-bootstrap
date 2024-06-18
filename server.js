const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const morgan = require("morgan");

const app = express();
const Album = require("./models/album");

app.use(express.urlencoded({ extended: false }));
app.use(methodOverride("_method"));
app.use(morgan("dev"));
app.use(express.static('public'));

// Route to handle search
app.get("/albums/search", async (req, res) => {
    const query = req.query.q;
    console.log("Search query:", query); // Debug statement
    try {
        const searchResults = await Album.find({
            $or: [
                { artist: new RegExp(query, 'i') },
                { albumName: new RegExp(query, 'i') },
                { genre: new RegExp(query, 'i') }
            ]
        });
        console.log("Search results:", searchResults); // Debug statement
        res.render("index.ejs", {
            albums: searchResults,
        });
    } catch (err) {
        console.error("Error during search:", err);
        res.status(500).send("Internal Server Error");
    }
});

// Index route (root)
app.get("/", async (req, res) => {
    try {
        const allAlbums = await Album.find();
        res.render("index.ejs", {
            albums: allAlbums,
        });
    } catch (err) {
        console.error("Error:", err);
        res.status(500).send("Internal Server Error");
    }
});

// Route to handle /albums
app.get("/albums", async (req, res) => {
    try {
        const allAlbums = await Album.find();
        res.render("index.ejs", {
            albums: allAlbums,
        });
    } catch (err) {
        console.error("Error:", err);
        res.status(500).send("Internal Server Error");
    }
});

// Route to create a new album
app.get("/albums/new", (req, res) => {
    res.render("albums/new.ejs");
});

app.post("/albums", async (req, res) => {
    const { artist, albumName, genre, year, artistImageUrl, albumImageUrl } = req.body;
    try {
        const createdAlbum = await Album.create({
            artist,
            albumName,
            genre,
            year,
            artistImageUrl,
            albumImageUrl,
        });
        res.redirect('/albums');
    } catch (err) {
        console.error("Error creating album:", err);
        res.status(500).send("Internal Server Error");
    }
});

// Route to view a specific album
app.get("/albums/:albumId", async (req, res) => {
    try {
        const foundAlbum = await Album.findById(req.params.albumId);
        res.render("albums/show.ejs", { album: foundAlbum });
    } catch (err) {
        console.error("Error finding album:", err);
        res.status(500).send("Internal Server Error");
    }
});

// Route to delete a specific album
app.delete("/albums/:albumId", async (req, res) => {
    try {
        await Album.findByIdAndDelete(req.params.albumId);
        res.redirect("/albums");
    } catch (err) {
        console.error("Error deleting album:", err);
        res.status(500).send("Internal Server Error");
    }
});

// Route to edit a specific album
app.get("/albums/:albumId/edit", async (req, res) => {
    try {
        const foundAlbum = await Album.findById(req.params.albumId);
        res.render("albums/edit.ejs", { album: foundAlbum });
    } catch (err) {
        console.error("Error finding album:", err);
        res.status(500).send("Internal Server Error");
    }
});

app.put("/albums/:albumId", async (req, res) => {
    const { artist, albumName, genre, year, artistImageUrl, albumImageUrl } = req.body;
    try {
        const updatedAlbum = await Album.findByIdAndUpdate(req.params.albumId, {
            artist,
            albumName,
            genre,
            year,
            artistImageUrl,
            albumImageUrl,
        }, { new: true });
        res.redirect(`/albums/${req.params.albumId}`);
    } catch (err) {
        console.error("Error updating album:", err);
        res.status(500).send("Internal Server Error");
    }
});


// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
mongoose.connection.on("connected", () => {
    console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(3003, () => {
    console.log(`Listening on port ${3003}`);
});
