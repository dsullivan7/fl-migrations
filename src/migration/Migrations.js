import fs from 'fs'
import path from 'path'

import Migration from './Migration'
import MigrationModel from '../models/Migration'

export default class Migrations {
  constructor(configuration) {
    this.path = configuration.path
  }

  migrationPromise = (directory, filename, results) =>
    new Promise((resolve, reject) => {
      MigrationModel.db().ensureSchema(err => {
        if (err) return reject(err)
        MigrationModel.findOne({name: filename}, (err, data) => {
          if (err) return reject(err)
          if (data) {
            // this migration has already been run
            return resolve(data)
          }

          // perform the migration
          const migrationPath = path.resolve(directory, filename)
          const migrationExecution = new Migration({path: migrationPath})
          migrationExecution.migrate((err) => {
            if (err) return reject(err)

            // create a new entry in the db to keep track of the executed migration
            const migration = new MigrationModel({name: filename})
            migration.save((err, data) => {
              if (err) return reject(err)
              results.push(data)
              resolve(results)
            })
          })
        })
      })
    })

  migrate = (callback) => {
    const fileList = fs.readdirSync(this.path)
    const results = []
    let promiseChain = Promise.resolve()

    fileList.sort().forEach(filename => {
      promiseChain = promiseChain.then(() => {
        return this.migrationPromise(this.path, filename, results)
      })
    })

    promiseChain.then(results => {
      callback(null, results)
    }).catch(error => callback(error))
  }
}
