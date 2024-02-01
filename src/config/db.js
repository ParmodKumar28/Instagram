// Here, we are creating connection with Mongodb database with the help of mongoose ODM.
// Imports
import mongoose from "mongoose";

// Mongodb URI
const url = process.env.MONGODB_URI;

// Connecting the database using the mongoose
const connectToDB = async () => {
    try {
        await mongoose.connect(url, {
            family: 4
        });
        console.log("Mongodb connected successful!");
    } catch (error) {
        console.log(`Error while connecting to database`);
        console.log(error);
    }
}

// Exporting function
export default connectToDB;

