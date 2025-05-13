import mongoose from "mongoose";

export function connect_db() {
    if (process.env.ATLAS_MONGODB_URL && process.env.ATLAS_MONGODB_USERNAME && process.env.ATLAS_MONGODB_PASSWORD && process.env.ATLAS_MONGODB_APPNAME) {
        mongoose.connect(`mongodb+srv://${process.env.ATLAS_MONGODB_USERNAME}:${process.env.ATLAS_MONGODB_PASSWORD}@${process.env.ATLAS_MONGODB_URL}/${process.env.ATLAS_MONGODB_DBNAME}?retryWrites=true&w=majority&appName=${process.env.ATLAS_MONGODB_APPNAME}`)
            .then(_ => console.log(`connected to local DB`))
            .catch(e => console.log(`failed to connect to DB`, e));
    }
}