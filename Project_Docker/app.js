
const express = require('express');
const { MongoClient } = require('mongodb');


const mongoURI = "conn_string";

const client = new MongoClient(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

const app = express();
const port = 3000;

app.use(express.json());

async function connectToMongoDB() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1); // Exit the process with failure
    }
}

const closeMatches = {
    'batman': 'Batman',
    'superman': 'Superman',
    'spiderman': 'Spider-Man',
    // Add more entries as needed
};

// Endpoint to compare hero and villain
app.get('/compare/:hero_villain', async (req, res) => {
    try {
        const [hero_name, villain_name] = req.params.hero_villain.split('_');
        const database = client.db('super_heros');
        const hero_collection = database.collection('heros');
        const villain_collection = database.collection('villans');

        // Find hero document
        const hero_document = await hero_collection.findOne({ Name: hero_name });
        if (!hero_document) {
            return res.status(404).json({ error: 'Hero not found' });
        }

        // Find villain document
        const villain_document = await villain_collection.findOne({ Name: villain_name });
        if (!villain_document) {
            return res.status(404).json({ error: 'Villain not found' });
        }

        res.json({ hero: hero_document, villain: villain_document });

    } catch (error) {
        console.error('Error fetching documents:', error);
        res.status(500).send('Error fetching documents');
    }
});

// Endpoint to fetch documents by category and name
app.get('/super_heros/:category/:name', async (req, res) => {
    try {
        const category = req.params.category;
        const name = req.params.name;
        const database = client.db('super_heros');
        const collection = database.collection(category);

        // Find documents with the specified name
        const documents = await collection.find({ Name: name }).toArray();
        if (documents.length === 0) {
            return res.status(404).json({ error: `${category} not found with name ${name}` });
        }

        res.json(documents[0]); // Assuming you want to return the first document found

    } catch (error) {
        console.error('Error fetching documents:', error);
        res.status(500).send('Error fetching documents');
    }
});

app.get('/compare/:hero_villain/:characteristic', async (req, res) => {
    try {
        const [hero_name,villan_name] = req.params.hero_villain.split('_');
        const characteristic = req.params.characteristic;
        const database = client.db('super_heros'); // Replace with your database name
        const hero_collection = database.collection('heros'); // Replace with your collection name
        const villan_collection = database.collection('villans');

        const hero_document = await hero_collection.findOne({ Name: hero_name });
    
        if (!hero_document) {
            return res.status(404).json({ error: 'Hero not found' });
        }

        // Find villain document
        const villain_document = await villan_collection.findOne({ Name: villan_name });
        
        if (!villain_document) {
            return res.status(404).json({ error: 'Villain not found' });
        }

        // Compare attributes (e.g., power, intelligence)
        let winner = null;
        if (hero_document[characteristic] > villain_document[characteristic]) {
            winner = hero_name;
        } else if (hero_document[characteristic] < villain_document[characteristic]) {
            winner = villan_name;
        } else {
            winner = 'It\'s a tie!';
        }

        res.json({ winner: winner });
    } catch (error) {
        console.error('Error fetching documents:', error);
        res.status(500).send('Error fetching documents');
    }
});

// Global error handler for uncaught exceptions and rejections
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1); // Exit the process with failure
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1); // Exit the process with failure
});

// Start the server and connect to MongoDB
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
    connectToMongoDB();
});