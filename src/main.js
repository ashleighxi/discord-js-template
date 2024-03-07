const Discord = require('discord.js')
require('dotenv').config()
const assert = require('assert')
const find_events = require('./utils/initialisation/find_events')
const find_commands = require('./utils/initialisation/find_commands')
const register_commands = require('./utils/initialisation/register_commands')
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.MONGO_URI;
const mongoose = require('mongoose');

const db = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });

  async function run() {
    try {
      // Connect the client to the server	(optional starting in v4.7)
      await db.connect();
      // Send a ping to confirm a successful connection
      await db.db("admin").command({ ping: 1 });
      await mongoose.connect(process.env.MONGO_URI);
      console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
      // Ensures that the client will close when you finish/error
      await db.close();
    }
  }

assert(process.env.TOKEN, "A Discord Token for your bot is required ! Please go to your application page to get it! Set your token then as an enviormental variable with the TOKEN variable name!")

const client = new Discord.Client({
    intents: [
        Discord.GatewayIntentBits.Guilds,
        Discord.GatewayIntentBits.GuildMessages,
        Discord.GatewayIntentBits.MessageContent,
        Discord.GatewayIntentBits.GuildMembers,
    ],
    partials: [
        Discord.Partials.Message,
        Discord.Partials.Channel,
        Discord.Partials.Reaction
    ]
});

find_events(client)

const commands = find_commands(client)

client.login(process.env.TOKEN)
run().catch(console.dir)

client.once(Discord.Events.ClientReady,(client)=>{
    register_commands(client,commands)
})