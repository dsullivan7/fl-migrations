import fs from 'fs'
import path from 'path'

import Migration from './Migration'
import MigrationModel from '../models/Migration'

export default class Migrations {
  constructor(configuration) {
    this.path = configuration.path
  }

  migrationPromise = (directory, filename) =>
    new Promise((resolve, reject) => {
      // ensure that the table has been created
      MigrationModel.db().ensureSchema(err => {
        if (err) return reject(err)

        // check to see if this migration has already been run
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
              resolve(data)
            })
          })
        })
      })
    })

  migrate = (callback) => {
    // sort the file list to ensure we are executing migrations in order
    const fileList = fs.readdirSync(this.path).sort()
    const results = []
    let promiseChain

    fileList.forEach(filename => {
      if (!promiseChain) {
        promiseChain = this.migrationPromise(this.path, filename)
      }
      else {
        promiseChain = promiseChain.then((data) => {
          results.push(data)
          return this.migrationPromise(this.path, filename)
        })
      }
    })

    if (!promiseChain) {
      callback(null, results)
    }
    else {
      // handle the final promise and excute the callback
      promiseChain.then(data => {
        results.push(data)
        callback(null, results)
      }).catch(error => callback(error))
    }
  }
}
