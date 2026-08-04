class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async create(data) {
    return await this.model.create(data);
  }

  async insertMany(data) {
    return await this.model.insertMany(data);
  }

  async find(query = {}, options = {}) {
    const { sort, limit, skip, populate, lean = true } = options;
    
    let dbQuery = this.model.find(query);
    
    if (sort) dbQuery = dbQuery.sort(sort);
    if (skip) dbQuery = dbQuery.skip(skip);
    if (limit) dbQuery = dbQuery.limit(limit);
    if (populate) dbQuery = dbQuery.populate(populate);
    if (lean) dbQuery = dbQuery.lean();
    
    return await dbQuery.exec();
  }

  async findOne(query = {}, options = {}) {
    const { populate, lean = true } = options;
    
    let dbQuery = this.model.findOne(query);
    
    if (populate) dbQuery = dbQuery.populate(populate);
    if (lean) dbQuery = dbQuery.lean();
    
    return await dbQuery.exec();
  }

  async findById(id, options = {}) {
    return await this.findOne({ _id: id }, options);
  }

  async count(query = {}) {
    return await this.model.countDocuments(query);
  }

  async update(query, data, options = { new: true, runValidators: true }) {
    return await this.model.findOneAndUpdate(query, data, options);
  }

  async delete(query) {
    return await this.model.findOneAndDelete(query);
  }
  
  async deleteMany(query = {}) {
    return await this.model.deleteMany(query);
  }
}

module.exports = BaseRepository;
