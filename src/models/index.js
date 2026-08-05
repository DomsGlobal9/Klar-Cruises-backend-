// Pre-register all models to ensure Mongoose population works smoothly.
//
// Population resolves a `ref` by model name at query time, so every model that
// is referenced anywhere has to have been registered first — even if nothing
// requires it directly. Registering only the models the routes happen to
// import leaves populate() throwing MissingSchemaError for the rest.
require('./Amenity');
require('./Cabin');
require('./Cruise');
require('./CruiseLine');
require('./Destination');
require('./Enquiry');
require('./Excursion');
require('./Experience');
require('./FAQ');
require('./Gallery');
require('./Offer');
require('./Port');
require('./Restaurant');
require('./Review');
require('./Ship');
