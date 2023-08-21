const mongoose = require("mongoose");

const connectDatabase = () => {
    
  mongoose.connect(process.env.DB_URI,{tlsAllowInvalidCertificates: true, }).then((data) => {
    console.log(`mongoDB connect with server : ${data.connection.host}`);
  });
};

module.exports = connectDatabase;
