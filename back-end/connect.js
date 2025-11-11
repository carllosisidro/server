import { MongoClient } from "mongodb";

const URL = "mongodb+srv://carlos:Sonic2010@cluster0.lkxsbe3.mongodb.net/?appName=Cluster0";


const client = new MongoClient(URL);
export const db = client.db("instavale");   


// const musicasCollection = await db.collection("musicas").find({}).toArray();
// console.log(musicasCollection)