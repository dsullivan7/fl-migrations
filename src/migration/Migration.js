export default class Migration {
  constructor(configuration) {
    this.path = configuration.path
  }

  migrate = (callback) => {
    const migration = require(this.path)
    migration.up(callback)
  }
}
