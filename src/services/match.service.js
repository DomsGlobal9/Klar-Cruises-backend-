const cruiseRepository = require('../repositories/cruise.repository');

/**
 * Cruise matching.
 *
 * Two jobs, deliberately kept apart: read a plain-English request into a
 * structured intent, then score the catalogue against that intent. Keeping
 * them separate means the parser can be swapped for a model later without
 * touching the scoring, and the scoring stays testable against fixed intents.
 *
 * The output contract is that every match carries its reasons. A recommendation
 * without a stated reason is indistinguishable from a random pick, and the
 * whole point of the product is that the user can check our working.
 */

const MONTHS = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december',
];

/**
 * Interest keywords, mapped to the words we look for.
 *
 * These are matched against the free text of a cruise (name, description,
 * highlights, destination) rather than a dedicated field, because no such
 * field exists yet. That makes them weak signals, weighted accordingly below.
 */
const INTERESTS = {
  family:    ['kid', 'kids', 'child', 'children', 'family', 'teen'],
  romantic:  ['honeymoon', 'romantic', 'romance', 'anniversary', 'couple'],
  luxury:    ['luxury', 'luxurious', 'premium', 'suite', 'upscale', 'five star'],
  expedition:['expedition', 'adventure', 'wildlife', 'glacier', 'arctic', 'antarctic'],
  relaxed:   ['relax', 'relaxing', 'calm', 'quiet', 'slow'],
  casino:    ['casino', 'gambling', 'poker'],
  food:      ['food', 'dining', 'cuisine', 'restaurant', 'vegetarian', 'vegan', 'jain', 'halal'],
};

/**
 * Words to ignore when treating leftover text as place/line/ship vocabulary.
 *
 * Without this, "cruise" matches every cruise and we tell the user their
 * itinerary matched "cruise" — a reason that is true, useless, and makes the
 * whole recommendation look automated. Covers generic travel nouns, the words
 * already consumed by budget/party/duration parsing, and common filler.
 */
const STOPWORDS = new Set([
  'cruise', 'cruises', 'cruising', 'sail', 'sailing', 'ship', 'ships', 'boat',
  'voyage', 'voyages', 'trip', 'trips', 'holiday', 'holidays', 'vacation',
  'travel', 'travelling', 'traveling', 'tour', 'package', 'deal', 'deals',
  'want', 'wants', 'need', 'needs', 'looking', 'like', 'love', 'prefer',
  'please', 'thanks', 'something', 'anything', 'someone', 'people', 'person',
  'night', 'nights', 'days', 'week', 'weeks', 'month', 'months', 'year',
  'adult', 'adults', 'kids', 'child', 'children', 'family', 'guest', 'guests',
  'budget', 'lakh', 'lakhs', 'crore', 'price', 'cost', 'cheap', 'under',
  'over', 'about', 'around', 'with', 'without', 'from', 'that', 'this',
  'have', 'having', 'good', 'best', 'nice', 'great', 'would', 'could',
  'there', 'their', 'they', 'them', 'more', 'most', 'some', 'very', 'much',
  'also', 'then', 'than', 'been', 'were', 'what', 'when', 'where', 'which',
]);

/** Words that signal the guest does not want to fly far. */
const NO_FLY_TERMS = ['without flying', 'no flight', 'no flying', 'from india', 'from mumbai', 'from chennai', 'from goa', 'from cochin', 'from kochi'];

/**
 * Reads a budget out of free text, normalised to rupees.
 *
 * Handles the way Indian users actually write amounts — "4 lakh", "₹2.5L",
 * "under 2 lakhs", "50k" — as well as plain digits. Returns null rather than
 * guessing when there is no number, so the caller can tell "no budget given"
 * apart from "budget of zero".
 */
function parseBudget(text) {
  const crore = text.match(/(?:₹|rs\.?\s*)?(\d+(?:\.\d+)?)\s*(?:crore|cr\b)/i);
  if (crore) return Math.round(parseFloat(crore[1]) * 1e7);

  const lakh = text.match(/(?:₹|rs\.?\s*)?(\d+(?:\.\d+)?)\s*(?:lakhs?|lacs?|lakh|l\b)/i);
  if (lakh) return Math.round(parseFloat(lakh[1]) * 1e5);

  const thousand = text.match(/(?:₹|rs\.?\s*)?(\d+(?:\.\d+)?)\s*k\b/i);
  if (thousand) return Math.round(parseFloat(thousand[1]) * 1000);

  const plain = text.match(/(?:₹|rs\.?\s*)(\d[\d,]{2,})/i);
  if (plain) return parseInt(plain[1].replace(/,/g, ''), 10);

  return null;
}

/**
 * Reads party composition. Defaults to a couple, which is what cruise pricing
 * assumes and what most enquiries turn out to be.
 */
function parseParty(text) {
  let adults = null;
  let children = 0;

  const family = text.match(/family of (\d+)/i);
  const adultsMatch = text.match(/(\d+)\s*adults?/i);
  const childMatch = text.match(/(\d+)\s*(?:kids?|child(?:ren)?)/i);

  // "kids 8 and 11" states ages, not a count — the count is how many ages.
  const ages = text.match(/(?:kids?|child(?:ren)?)\s*(?:aged?\s*)?(\d{1,2})(?:\s*(?:,|and|&)\s*(\d{1,2}))*/i);

  if (adultsMatch) adults = parseInt(adultsMatch[1], 10);
  if (childMatch) children = parseInt(childMatch[1], 10);
  else if (ages) children = ages[0].match(/\d{1,2}/g)?.length ?? 0;

  if (family) {
    const total = parseInt(family[1], 10);
    if (adults === null) adults = Math.max(1, total - children);
  }

  if (/\bsolo\b|\balone\b|\bmyself\b/i.test(text)) adults = adults ?? 1;
  if (/\bcouple\b|\bhoneymoon\b|\bthe two of us\b/i.test(text)) adults = adults ?? 2;

  return { adults: adults ?? 2, children };
}

/** Reads a trip length in nights. */
function parseNights(text) {
  const nights = text.match(/(\d+)\s*(?:nights?|nite?s?)/i);
  if (nights) return parseInt(nights[1], 10);

  const days = text.match(/(\d+)\s*days?/i);
  if (days) return Math.max(1, parseInt(days[1], 10) - 1);

  if (/\bweekend\b/i.test(text)) return 3;
  if (/\btwo weeks?\b|\bfortnight\b/i.test(text)) return 14;
  if (/\ba week\b|\bone week\b/i.test(text)) return 7;
  return null;
}

/**
 * Turns a plain-English request into structured intent.
 *
 * @param {string} query What the user typed.
 * @returns {Object} Structured intent; fields are null when not stated.
 */
function parseIntent(query) {
  const text = String(query || '');
  const lower = text.toLowerCase();

  const interests = Object.entries(INTERESTS)
    .filter(([, terms]) => terms.some((t) => lower.includes(t)))
    .map(([name]) => name);

  const month = MONTHS.find((m) => new RegExp(`\\b${m}\\b`, 'i').test(lower)) || null;

  return {
    raw: text,
    budget: parseBudget(lower),
    ...parseParty(lower),
    nights: parseNights(lower),
    month,
    interests,
    noFly: NO_FLY_TERMS.some((t) => lower.includes(t)),
    // Everything left over is treated as place/line/ship vocabulary. Short
    // words are dropped because they match noise, not names.
    terms: lower
      .replace(/[^a-z\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 3 && !STOPWORDS.has(w) && !MONTHS.includes(w)),
  };
}

/**
 * Fields whose values are identical across the whole catalogue carry no
 * information, so matching on them would produce reasons that sound
 * meaningful but discriminate nothing. This finds the ones worth using.
 */
function discriminatingFields(cruises) {
  const varies = (key) => new Set(cruises.map((c) => c?.[key])).size > 1;
  return {
    luxuryLevel: varies('luxuryLevel'),
    difficulty: varies('difficulty'),
    familyFriendly: varies('familyFriendly'),
    bestSeason: varies('bestSeason'),
  };
}

/** Free text associated with a cruise, for keyword matching. */
function searchableText(cruise) {
  return [
    cruise.name,
    cruise.description,
    ...(cruise.highlights || []),
    cruise.destination?.name,
    cruise.cruiseLine?.name,
    cruise.ship?.name,
    cruise.departurePort?.name,
    ...(cruise.itinerary || []).map((d) => d.port?.name || d.title),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

/**
 * Scores one cruise against an intent.
 *
 * Returns both a score and the reasons behind it. Reasons are only emitted for
 * signals that actually fired — an empty reason list means we matched nothing
 * in particular, and the caller should say so rather than invent a rationale.
 */
function scoreCruise(cruise, intent, signal) {
  let score = 0;
  const reasons = [];

  const guests = intent.adults + intent.children;
  const text = searchableText(cruise);

  // Budget. `price` is a per-person fare, so the comparison has to be made on
  // the whole party or a family looks affordable when it is not.
  if (intent.budget && cruise.price) {
    const partyFare = cruise.price * guests;
    const ratio = partyFare / intent.budget;
    if (ratio <= 1) {
      // Closer to the budget scores higher — spending 30% of it usually means
      // a worse holiday than one that uses it.
      score += 30 * (0.5 + 0.5 * ratio);
      reasons.push(`Fits your budget — about ${Math.round(ratio * 100)}% of it for ${guests} guest${guests === 1 ? '' : 's'}`);
    } else if (ratio <= 1.15) {
      score += 8;
      reasons.push(`Slightly over budget, by roughly ${Math.round((ratio - 1) * 100)}%`);
    }
  }

  // Trip length.
  if (intent.nights && cruise.duration) {
    const diff = Math.abs(cruise.duration - intent.nights);
    if (diff === 0) {
      score += 25;
      reasons.push(`Exactly the ${intent.nights} nights you asked for`);
    } else if (diff <= 2) {
      score += 15;
      reasons.push(`${cruise.duration} nights, close to the ${intent.nights} you wanted`);
    }
  }

  // Place, line and ship names.
  const hits = [...new Set(intent.terms.filter((t) => text.includes(t)))];
  if (hits.length) {
    score += Math.min(24, hits.length * 8);
    reasons.push(`Matches "${hits.slice(0, 3).join('", "')}" in the itinerary`);
  }

  // Interests are matched against free text, so they are weak evidence and
  // weighted well below budget and duration.
  const interestHits = intent.interests.filter((i) =>
    INTERESTS[i].some((term) => text.includes(term))
  );
  if (interestHits.length) {
    score += interestHits.length * 6;
    reasons.push(`Suits ${interestHits.join(' and ')} travel`);
  }

  // Season, only when the catalogue actually varies on it.
  if (signal.bestSeason && intent.month && cruise.bestSeason) {
    if (cruise.bestSeason.toLowerCase().includes(intent.month)) {
      score += 18;
      reasons.push(`${intent.month[0].toUpperCase()}${intent.month.slice(1)} is the best time to sail this route`);
    }
  }

  // Families, likewise.
  if (signal.familyFriendly && intent.children > 0 && cruise.familyFriendly) {
    score += 12;
    reasons.push('Set up for families sailing with children');
  }

  // Rating is a mild tie-breaker, never a reason on its own — every cruise has
  // one, so it explains nothing about why this cruise suits this request.
  score += (cruise.rating || 0) * 2;

  return { score, reasons };
}

/**
 * Finds the cruises that best fit a plain-English request.
 *
 * @param {string} query What the user typed.
 * @param {number} limit How many matches to return.
 * @returns {Promise<{intent:Object, matches:Array, weakMatch:boolean}>}
 */
async function matchCruises(query, limit = 3) {
  const intent = parseIntent(query);

  // The catalogue is small enough to score in memory, and scoring depends on
  // populated names, so this reads the set rather than pushing it into Mongo.
  const cruises = await cruiseRepository.findCruisesWithBasicInfo(
    {},
    { limit: 200, sort: { rating: -1 } }
  );

  const signal = discriminatingFields(cruises);

  const scored = cruises
    .map((cruise) => {
      const { score, reasons } = scoreCruise(cruise, intent, signal);
      return { cruise, score, reasons };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  // If nothing scored on anything but rating, say so instead of dressing up
  // the top-rated cruises as a personalised match.
  const weakMatch = scored.every((m) => m.reasons.length === 0);

  return {
    intent,
    weakMatch,
    matches: scored.map(({ cruise, score, reasons }) => ({
      id: cruise._id,
      name: cruise.name,
      slug: cruise.slug,
      heroImage: cruise.heroImage,
      price: cruise.price,
      duration: cruise.duration,
      rating: cruise.rating,
      destination: cruise.destination?.name || null,
      cruiseLine: cruise.cruiseLine?.name || null,
      ship: cruise.ship?.name || null,
      departurePort: cruise.departurePort?.name || null,
      score: Math.round(score),
      reasons,
    })),
  };
}

module.exports = { matchCruises, parseIntent };
