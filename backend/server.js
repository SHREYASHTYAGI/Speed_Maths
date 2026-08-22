require("dotenv").config();

const app = require("./src/app");
const dns=require('dns');
dns.setServers(['1.1.1.1'],['8.8.8.8'])
const connectDB = require("./src/db/db");

const PORT = process.env.PORT || 8000;

connectDB()
 
app.listen(PORT,()=>{
    console.log("Server is Live")
})
