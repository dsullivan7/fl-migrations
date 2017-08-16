import fs from 'fs'
import path from 'path'

import Migration from './Migration'
import MigrationModel from '../models/Migration'

export default class Migrations {
  constructor(configuration) {
    this.path = configuration.path
  }

  migrationPromise = (directory, filename) => () =>
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
              resolve(data)
            })
          })
        })
      })
    })

  migrate = (callback) => {
    const fileList = fs.readdirSync(this.path)
    const promiseList = fileList.sort().map(filename => {
      return this.migrationPromise(this.path, filename)
    })
    const results = []
    const initialPromise = promiseList.shift()
    let promiseChain = initialPromise()

    promiseList.forEach((promise) => {
      promiseChain = promiseChain.then((data) => {
        results.push(data)
        return promise()
      }).catch(error => callback(error))
    })

    promiseChain.then(data => {
      results.push(data)
      callback(null, results)
    }).catch(error => callback(error))
  }
}
