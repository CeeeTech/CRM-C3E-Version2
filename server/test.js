const { MongoClient, ObjectId } = require('mongodb');

async function updateDocuments() {
  const client = new MongoClient('mongodb+srv://sltccrm:sltccrm@cluster-sltc-crm-paid.om94v.mongodb.net/?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true });
  
  try {
    await client.connect();

    const database = client.db('test');
    const collection = database.collection('leads');

    // Update documents in the collection
    const result = await collection.updateMany(
      { }, // Match all documents
      { $set: { "branch_id": new ObjectId("65bb379766d05053fd1dcd38") } } // Set the new branch_id
    );

    console.log(`${result.modifiedCount} documents updated successfully.`);
  } catch (error) {
    console.error('Error updating documents:', error);
  } finally {
    await client.close();
  }
}

updateDocuments();
