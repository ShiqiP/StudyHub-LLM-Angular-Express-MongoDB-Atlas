import mongoose from "mongoose";
// npx tsx .\migration.ts

(async () => {
    const sourceDBNAME = 'test'
    const targetDBNAME = 'studyhub'
    const sourceURI = `mongodb+srv://${process.env.ATLAS_MONGODB_USERNAME}:${process.env.ATLAS_MONGODB_PASSWORD}@${process.env.ATLAS_MONGODB_URL}/${sourceDBNAME}?retryWrites=true&w=majority&appName=${process.env.ATLAS_MONGODB_APPNAME}`
    const targetURI = `mongodb+srv://${process.env.ATLAS_MONGODB_USERNAME}:${process.env.ATLAS_MONGODB_PASSWORD}@${process.env.ATLAS_MONGODB_URL}/${targetDBNAME}?retryWrites=true&w=majority&appName=${process.env.ATLAS_MONGODB_APPNAME}`
    const sourceConn = await mongoose.createConnection(sourceURI).asPromise();
    const targetConn = await mongoose.createConnection(targetURI).asPromise();
    const collections = ["chats", "resources", "users"]
    collections.forEach(async (collection) => {
        const SourceModel = sourceConn.model(collection, new mongoose.Schema({}, { strict: false }));
        const TargetModel = targetConn.model(collection, new mongoose.Schema({}, { strict: false }));
        const documents = await SourceModel.find({});
        await TargetModel.insertMany(documents);
    })

    console.log("Migration complete!");
    console.log("Done");
})();
