const { MongoClient } = require('mongodb');

const uri = "mongodb://localhost:27017";
const dbName = "joinventos";

let dbInstance = null;

async function connectDB() {
    if (dbInstance) return dbInstance;
    try {
        const client = new MongoClient(uri);
        await client.connect();
        dbInstance = client.db(dbName);
        console.log("Conectado com sucesso ao MongoDB!");
        return dbInstance;
    } catch (error) {
        console.error("Erro ao conectar ao MongoDB:", error);
        process.exit(1);
    }
}

module.exports = {
    connect: connectDB,
    getDb: async () => {
        if (!dbInstance) {
            await connectDB();
        }
        return dbInstance;
    }
};