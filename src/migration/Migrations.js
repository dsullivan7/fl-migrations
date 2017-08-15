import fs from 'fs'
import path from 'path'

import Migration from './Migration'

export default class Migrations {
  constructor(configuration) {
    this.path = configuration.path
  }

  executeMigration = (migration) =>
    new Promise((resolve, reject) => {
      migration.migrate((err, data) => {
        if (err) reject(err)
        resolve(data)
      })
    })

  migrate = async (callback) => {
    try {
      const fileList = fs.readdirSync(this.path)
      const results = await Promise.all(fileList.sort().map(filename => {
        const migrationPath = path.resolve(this.path, filename)
        return this.executeMigration(new Migration({path: migrationPath}))
      }))
      callback(null, results)
    }
    catch (error) {
      callback(error)
    }
  }
}
