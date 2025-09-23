const mongoose = require('mongoose');
const Dustbin = require('./models/Dustbin'); // Path to your Dustbin model
require('dotenv').config({ path: './.env' });

const dustbinLocations = [
  {
    name: "Near gate",
    location: {
      type: "Point",
      coordinates: [76.61413401934064, 12.313050749704773], // [Longitude, Latitude] - Example: Near the library
    },
  },
  {
    name: "Gym",
    location: {
      type: "Point",
      coordinates: [76.6144594121166, 12.312173377313897], // [Longitude, Latitude] - Example: Near the cafeteria
    },
  },
  {
    name: "Reference Hall",
    location: {
      type: "Point",
      coordinates: [76.61349788732163, 12.313212365167118], // [Longitude, Latitude] - Example: Near the main auditorium
    },
  },
  {
    name: "gag",
    location: {
      type: "Point",
      coordinates: [76.61350533748366, 12.318923210023375], // [Longitude, Latitude] - Example: In front of a hostel
    },
  },
];

async function insertLocations() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('🔗 MongoDB connected for data insertion.');

    // Clear existing dustbin data to avoid duplicates
    await Dustbin.deleteMany({});
    console.log('🗑️ Existing dustbin locations cleared.');

    // Insert new data
    await Dustbin.insertMany(dustbinLocations);
    console.log('✅ Dustbin locations hardcoded successfully!');

  } catch (error) {
    console.error('❌ Error inserting data:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 MongoDB connection closed.');
  }
}

insertLocations();