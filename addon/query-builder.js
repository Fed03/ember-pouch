class QueryBuilder {
  constructor(db, query/*, recordArray*/) {
    this.db = db;
    this._selectors = query.filter;
    this._sortRules = query.sort;
  }

  get selectors() {
    return prependObjectPropertiesName(this._selectors, 'data');
  }

  get sortRules() {
    if (this._sortRules) {
      return this._sortRules.map(rule => {
        if (typeof rule === 'object' && rule !== null) {
          return prependObjectPropertiesName(rule, 'data');
        }
        return `data.${rule}`;
      });
    }
  }

  query() {
    const selector = this.selectors;
    const sort = this.sortRules;

    return this.db.find({
      selector,
      sort
    }).then(payload => {
      return payload.docs.map(doc => {
        const parsedDoc = this.db.rel.parseDocID(doc._id);
        if (parsedDoc.type) {
          doc.data.id = parsedDoc.id;
          return doc.data;
        }
      });
    });
  }
}

const prependObjectPropertiesName = function(obj, prependString) {
  return Object.keys(obj).reduce((previous, selector) => {
    previous[`${prependString}.${selector}`] = obj[selector];
    return previous;
  }, {});
};

export default QueryBuilder;
