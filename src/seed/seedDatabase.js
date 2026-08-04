require('dotenv').config();
const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');

const Amenity = require('../models/Amenity');
const Port = require('../models/Port');
const Destination = require('../models/Destination');
const CruiseLine = require('../models/CruiseLine');
const Gallery = require('../models/Gallery');
const FAQ = require('../models/FAQ');
const Restaurant = require('../models/Restaurant');
const Experience = require('../models/Experience');
const Cabin = require('../models/Cabin');
const Ship = require('../models/Ship');
const Review = require('../models/Review');
const Offer = require('../models/Offer');
const Cruise = require('../models/Cruise');

const connectDB = require('../config/db');

const SEED_COUNTS = {
  cruiseLines: 25,
  ships: 120,
  destinations: 20,
  cruises: 50,
  reviews: 250,
  offers: 100,
  faqs: 100,
  restaurants: 100,
  experiences: 100,
  ports: 50,
  cabins: 50,
  amenities: 40
};

async function clearDatabase() {
  console.log('Clearing database...');
  await Promise.all([
    Amenity.deleteMany(),
    Port.deleteMany(),
    Destination.deleteMany(),
    CruiseLine.deleteMany(),
    Gallery.deleteMany(),
    FAQ.deleteMany(),
    Restaurant.deleteMany(),
    Experience.deleteMany(),
    Cabin.deleteMany(),
    Ship.deleteMany(),
    Review.deleteMany(),
    Offer.deleteMany(),
    Cruise.deleteMany()
  ]);
  console.log('Database cleared.');
}

/**
 * Ports the itineraries are built from, ordered west to east.
 *
 * Order matters: cruise itineraries take a contiguous slice of this list, so
 * a generated voyage sails in one direction along the basin instead of
 * teleporting between random harbours. Coordinates are real, which is what
 * lets the itinerary map plot a route rather than a decorative line.
 */
const MEDITERRANEAN_PORTS = [
  { name: 'Barcelona', country: 'Spain', region: 'Catalonia', lat: 41.38, lng: 2.17 },
  { name: 'Palma', country: 'Spain', region: 'Balearic Islands', lat: 39.57, lng: 2.65 },
  { name: 'Marseille', country: 'France', region: "Provence-Alpes-Côte d'Azur", lat: 43.30, lng: 5.37 },
  { name: 'Monte Carlo', country: 'Monaco', region: 'Monaco', lat: 43.74, lng: 7.43 },
  { name: 'Ajaccio', country: 'France', region: 'Corsica', lat: 41.93, lng: 8.74 },
  { name: 'Genoa', country: 'Italy', region: 'Liguria', lat: 44.41, lng: 8.93 },
  { name: 'Portofino', country: 'Italy', region: 'Liguria', lat: 44.30, lng: 9.21 },
  { name: 'Livorno', country: 'Italy', region: 'Tuscany', lat: 43.55, lng: 10.31 },
  { name: 'Civitavecchia', country: 'Italy', region: 'Lazio', lat: 42.09, lng: 11.79 },
  { name: 'Naples', country: 'Italy', region: 'Campania', lat: 40.85, lng: 14.27 },
  { name: 'Amalfi', country: 'Italy', region: 'Campania', lat: 40.63, lng: 14.60 },
  { name: 'Palermo', country: 'Italy', region: 'Sicily', lat: 38.12, lng: 13.36 },
  { name: 'Giardini Naxos', country: 'Italy', region: 'Sicily', lat: 37.82, lng: 15.27 },
  { name: 'Valletta', country: 'Malta', region: 'Malta', lat: 35.90, lng: 14.51 },
  { name: 'Dubrovnik', country: 'Croatia', region: 'Dalmatia', lat: 42.65, lng: 18.09 },
  { name: 'Kotor', country: 'Montenegro', region: 'Kotor Bay', lat: 42.42, lng: 18.77 },
  { name: 'Corfu', country: 'Greece', region: 'Ionian Islands', lat: 39.62, lng: 19.92 },
  { name: 'Katakolon', country: 'Greece', region: 'Peloponnese', lat: 37.65, lng: 21.32 },
  { name: 'Piraeus', country: 'Greece', region: 'Attica', lat: 37.94, lng: 23.64 },
  { name: 'Mykonos', country: 'Greece', region: 'Cyclades', lat: 37.45, lng: 25.33 },
  { name: 'Santorini', country: 'Greece', region: 'Cyclades', lat: 36.39, lng: 25.43 },
  { name: 'Heraklion', country: 'Greece', region: 'Crete', lat: 35.34, lng: 25.14 },
  { name: 'Rhodes', country: 'Greece', region: 'Dodecanese', lat: 36.44, lng: 28.22 },
  { name: 'Kusadasi', country: 'Türkiye', region: 'Aydın', lat: 37.86, lng: 27.26 },
  { name: 'Bodrum', country: 'Türkiye', region: 'Muğla', lat: 37.03, lng: 27.43 },
  { name: 'Limassol', country: 'Cyprus', region: 'Limassol', lat: 34.68, lng: 33.04 },
  { name: 'Istanbul', country: 'Türkiye', region: 'Marmara', lat: 41.01, lng: 28.98 },
];

function getRandomElements(array, count) {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

async function seedDatabase() {
  try {
    await connectDB();
    
    if (process.argv.includes('--reset')) {
      await clearDatabase();
      console.log('Reset complete. Exiting...');
      process.exit(0);
    }

    await clearDatabase();
    
    console.log('Seeding started...');

    console.log(`Seeding ${SEED_COUNTS.amenities} Amenities...`);
    const amenities = await Amenity.insertMany(
      Array.from({ length: SEED_COUNTS.amenities }).map(() => ({
        name: faker.commerce.productName() + ' ' + faker.word.adjective(),
        description: faker.lorem.sentence(),
        category: faker.helpers.arrayElement(['Cabin', 'Ship', 'Spa', 'Dining', 'Entertainment'])
      }))
    );

    // Real ports, in west-to-east order, with real coordinates.
    //
    // `faker.location.city() + ' Port'` produced names like "New Lynne Port"
    // in countries picked at random, which cannot be placed on a map and read
    // as obvious filler on the page. The Port schema has always had a
    // `coordinates` field; it was simply never populated.
    console.log(`Seeding ${MEDITERRANEAN_PORTS.length} Ports...`);
    const ports = await Port.insertMany(
      MEDITERRANEAN_PORTS.map((port) => ({
        name: port.name,
        country: port.country,
        region: port.region,
        description: faker.lorem.paragraph(),
        image: faker.image.urlLoremFlickr({ category: 'city' }),
        coordinates: { lat: port.lat, lng: port.lng }
      }))
    );

    console.log(`Seeding ${SEED_COUNTS.destinations} Destinations...`);
    const destinations = await Destination.insertMany(
      Array.from({ length: SEED_COUNTS.destinations }).map(() => {
        const name = faker.location.country() + ' ' + faker.helpers.arrayElement(['Riviera', 'Islands', 'Coast', 'Fjords', 'Passage']);
        return {
          name,
          slug: faker.helpers.slugify(name).toLowerCase(),
          description: faker.lorem.paragraphs(2),
          image: faker.image.urlLoremFlickr({ category: 'nature' }),
          region: faker.location.continent(),
          highlights: Array.from({ length: 3 }).map(() => faker.lorem.sentence())
        };
      })
    );

    console.log(`Seeding ${SEED_COUNTS.cruiseLines} Cruise Lines...`);
    const cruiseLines = await CruiseLine.insertMany(
      Array.from({ length: SEED_COUNTS.cruiseLines }).map(() => {
        const name = faker.company.name() + ' Cruises';
        return {
          name,
          slug: faker.helpers.slugify(name).toLowerCase(),
          description: faker.company.catchPhrase(),
          logo: faker.image.urlLoremFlickr({ category: 'logo' }),
          foundedYear: faker.number.int({ min: 1950, max: 2020 }),
          luxuryLevel: faker.helpers.arrayElement(['Premium', 'Ultra Premium', 'Luxury', 'Expedition'])
        };
      })
    );

    console.log(`Seeding ${SEED_COUNTS.restaurants} Restaurants...`);
    const restaurants = await Restaurant.insertMany(
      Array.from({ length: SEED_COUNTS.restaurants }).map(() => ({
        name: faker.commerce.department() + ' Dining',
        cuisine: faker.helpers.arrayElement(['Italian', 'French', 'Asian Fusion', 'Steakhouse', 'Global']),
        description: faker.lorem.paragraph(),
        priceCategory: faker.helpers.arrayElement(['Included', 'Specialty ($)', 'Premium ($$)'])
      }))
    );

    console.log(`Seeding ${SEED_COUNTS.experiences} Experiences...`);
    const experiences = await Experience.insertMany(
      Array.from({ length: SEED_COUNTS.experiences }).map(() => ({
        title: faker.commerce.productName() + ' Experience',
        description: faker.lorem.sentence(),
        category: faker.helpers.arrayElement(['Spa', 'Entertainment', 'Casino', 'Kids', 'Sports', 'Other'])
      }))
    );

    console.log(`Seeding ${SEED_COUNTS.cabins} Cabins...`);
    const cabins = await Cabin.insertMany(
      Array.from({ length: SEED_COUNTS.cabins }).map(() => ({
        name: faker.helpers.arrayElement(['Ocean View', 'Balcony', 'Suite', 'Grand Suite', 'Penthouse']),
        description: faker.lorem.paragraph(),
        image: faker.image.urlLoremFlickr({ category: 'interior' }),
        category: faker.helpers.arrayElement(['Interior', 'Ocean View', 'Balcony', 'Suite', 'Grand Suite']),
        size: faker.number.int({ min: 150, max: 1200 }),
        guests: faker.number.int({ min: 2, max: 6 }),
        amenities: getRandomElements(amenities, 5).map(a => a._id)
      }))
    );

    console.log(`Seeding ${SEED_COUNTS.ships} Ships...`);
    const ships = await Ship.insertMany(
      Array.from({ length: SEED_COUNTS.ships }).map(() => {
        const name = faker.person.firstName() + ' of the Seas';
        return {
          name,
          slug: faker.helpers.slugify(name).toLowerCase() + '-' + faker.string.alphanumeric(4),
          cruiseLine: faker.helpers.arrayElement(cruiseLines)._id,
          description: faker.lorem.paragraphs(2),
          image: faker.image.urlLoremFlickr({ category: 'transport' }),
          built: faker.number.int({ min: 2000, max: 2024 }),
          passengers: faker.number.int({ min: 500, max: 5000 }),
          cabins: getRandomElements(cabins, 4).map(c => c._id),
          restaurants: getRandomElements(restaurants, 6).map(r => r._id),
          experiences: getRandomElements(experiences, 5).map(e => e._id)
        };
      })
    );

    console.log(`Seeding ${SEED_COUNTS.cruises} Cruises...`);
    const cruises = await Cruise.insertMany(
      Array.from({ length: SEED_COUNTS.cruises }).map(() => {
        const destination = faker.helpers.arrayElement(destinations);

        // Take a contiguous run of ports so the voyage sails along the basin
        // in one direction. Picking each call at random produced itineraries
        // that jumped Barcelona → Rhodes → Marseille, which is nonsense on a
        // list and visibly nonsense once it is drawn on a map.
        const calls = faker.number.int({ min: 4, max: 7 });
        const start = faker.number.int({ min: 0, max: ports.length - calls });
        const leg = ports.slice(start, start + calls);
        if (faker.datatype.boolean()) leg.reverse();

        const name = `${leg[0].name} to ${leg[leg.length - 1].name}`;

        // A sea day between calls, never on the first or last day.
        const itinerary = [];
        leg.forEach((port, i) => {
          itinerary.push({
            day: itinerary.length + 1,
            title: port.name,
            description: faker.lorem.sentence(),
            port: port._id,
            isAtSea: false
          });
          if (i > 0 && i < leg.length - 2 && faker.datatype.boolean()) {
            itinerary.push({
              day: itinerary.length + 1,
              title: 'At sea',
              description: faker.lorem.sentence(),
              isAtSea: true
            });
          }
        });

        return {
          name,
          slug: faker.helpers.slugify(name).toLowerCase() + '-' + faker.string.alphanumeric(4),
          description: faker.lorem.paragraphs(3),
          heroImage: faker.image.urlLoremFlickr({ category: 'ocean' }),
          price: faker.number.int({ min: 1000, max: 15000 }),
          // Duration follows the itinerary rather than contradicting it.
          duration: itinerary.length - 1,
          rating: faker.number.float({ min: 3.5, max: 5, fractionDigits: 1 }),
          cruiseLine: faker.helpers.arrayElement(cruiseLines)._id,
          ship: faker.helpers.arrayElement(ships)._id,
          destination: destination._id,
          departurePort: leg[0]._id,
          arrivalPort: leg[leg.length - 1]._id,
          itinerary
        };
      })
    );

    console.log(`Seeding ${SEED_COUNTS.reviews} Reviews...`);
    await Review.insertMany(
      Array.from({ length: SEED_COUNTS.reviews }).map(() => ({
        name: faker.person.fullName(),
        country: faker.location.country(),
        avatar: faker.image.avatar(),
        rating: faker.number.int({ min: 3, max: 5 }),
        comment: faker.lorem.paragraph(),
        cruise: faker.helpers.arrayElement(cruises)._id
      }))
    );
    
    console.log(`Seeding Galleries for Cruises...`);
    const galleryItems = [];
    cruises.forEach(cruise => {
      Array.from({ length: 5 }).forEach(() => {
        galleryItems.push({
          title: faker.lorem.words(2),
          url: faker.image.urlLoremFlickr({ category: 'luxury' }),
          description: faker.lorem.sentence(),
          type: 'Cruise',
          referenceId: cruise._id,
          referenceModel: 'Cruise'
        });
      });
    });
    await Gallery.insertMany(galleryItems);

    console.log('✅ Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
