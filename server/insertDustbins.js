const mongoose = require('mongoose');
const Dustbin = require('./models/Dustbin'); // Path to your Dustbin model
require('dotenv').config({ path: './.env' });

const dustbinLocations = [
  {
    name: "Mech auditorium",
    location: {
      type: "Point",
      coordinates: [76.6126786443111, 12.314254726254102], // [Longitude, Latitude] - Example: Near the library
    },
  },
  {
    name: "Golden Jubliee",
    location: {
      type: "Point",
      coordinates: [76.61419077339373,12.316085281627188], // [Longitude, Latitude] - Example: Near the main auditorium
    },
  },
  
  {
    name: "Quadrangle",
    location: {
      type: "Point",
      coordinates: [76.61322298055934, 12.313435495302874], // [Longitude, Latitude] - Example: Near the cafeteria
    },
  },
  {
    name: "EC dept",
    location: {
      type: "Point",
      coordinates: [76.61302024351716, 12.313123665225676], // [Longitude, Latitude] - Example: In front of a hostel
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