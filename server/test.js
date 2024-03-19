const { MongoClient } = require('mongodb');

// Replace the following with your connection details
const uri = "mongodb+srv://techceee:techceee@stc-crm.zts10yh.mongodb.net/"; // Assuming MongoDB is running locally
const dbName = "test";

async function importData() {
    try {
        const client = await MongoClient.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        const db = client.db(dbName);

        // Get a list of JSON files in the specified directory
        const fs = require('fs').promises; // Using promises for async/await
        const files = await fs.readdir('C:/Users/ASUS/Desktop/sltc db');

        for (const file of files) {
            if (file.endsWith('.json')) {
                const collectionName = file.slice(0, -5); // Extract collection name from filename (assuming .json extension)
                const collection = db.collection(collectionName);

                // Read the JSON file content
                const data = await fs.readFile(`C:/Users/ASUS/Desktop/sltc db/${file}`, 'utf-8');
                const jsonData = JSON.parse(data);

                // Insert the data into the collection
                await collection.insertMany(jsonData);
                console.log(`Data from ${file} successfully imported into collection ${collectionName}`);
            }
        }

        await client.close();
    } catch (error) {
        console.error(error);
    }
}

importData();
