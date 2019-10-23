const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = (callback) => {
    MongoClient.connect('<INSERT_MONGODB_URL', {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(client => {
        _db = client.db();
        callback(client);
    })
    .catch(err => {
        console.log("Error trying to connect: ", err);
        throw err;
    });
}

const getDB = () => {
    if(_db){
        return _db
    }
    throw 'No Database Found';
}

exports.mongoConnect = mongoConnect;
exports.getDB = getDB;
