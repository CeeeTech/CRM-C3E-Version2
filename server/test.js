const { MongoClient } = require('mongodb');

// Connection URI for source and destination MongoDB databases
const sourceURI = 'mongodb+srv://sltccrm:sltccrm@cluster-sltc-crm-paid.om94v.mongodb.net/?retryWrites=true&w=majority/test'; // Replace with your source DB URI
const destURI = 'mongodb+srv://techceee:techceee@stc-crm.zts10yh.mongodb.net/test'; // Replace with your destination DB URI

async function copyCollections() {
  // Connect to source MongoDB database
  const sourceClient = new MongoClient(sourceURI, { useNewUrlParser: true, useUnifiedTopology: true });
  await sourceClient.connect();
  const sourceDb = sourceClient.db();

  // Connect to destination MongoDB database
  const destClient = new MongoClient(destURI, { useNewUrlParser: true, useUnifiedTopology: true });
  await destClient.connect();
  const destDb = destClient.db();

  try {
    // Get a list of all collections in the destination database
    const collections = await destDb.listCollections().toArray();

    // Iterate over each collection
    for (const collectionInfo of collections) {
      const collectionName = collectionInfo.name;

      // Get the collection object from the destination database
      const destCollection = destDb.collection(collectionName);

      // Delete all documents in the collection
      await destCollection.deleteMany({});
      console.log(`Deleted all documents from collection '${collectionName}' in the destination database.`);
    }

    // Get a list of all collections in the source database
    const sourceCollections = await sourceDb.listCollections().toArray();

    // Iterate over each collection
    for (const collectionInfo of sourceCollections) {
      const collectionName = collectionInfo.name;

      // Get the collection object from the source database
      const collection = sourceDb.collection(collectionName);

      // Find all documents in the collection
      const documents = await collection.find().toArray();

      if (documents.length > 0) {
        // If collection doesn't exist in destination DB, create it
        if (!(await destDb.listCollections({ name: collectionName }).hasNext())) {
          await destDb.createCollection(collectionName);
        }

        // Get the corresponding collection in the destination database
        const destCollection = destDb.collection(collectionName);

        // Insert documents into the destination collection
        await destCollection.insertMany(documents);
        console.log(`Copied ${documents.length} documents to collection '${collectionName}'`);
      } else {
        console.log(`Collection '${collectionName}' is empty, skipping...`);
      }
    }

    console.log("All collections copied to the 'test' database.");
  } finally {
    // Close connections
    await sourceClient.close();
    await destClient.close();
  }
}

// Call the function to copy collections
copyCollections().catch(console.error);
