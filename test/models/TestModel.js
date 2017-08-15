import Backbone from 'backbone'
import { smartSync } from 'fl-server-utils'

const dbUrl = process.env.DATABASE_URL
if (!dbUrl) console.log('Missing process.env.DATABASE_URL')

export default class TestModel extends Backbone.Model {
  url = `${dbUrl}/testModels`

  schema = () => ({
    myTextField: 'Text',
    myIntegerField: 'Integer',
    createdDate: 'DateTime',
  })

  defaults() { return {createdDate: new Date()} }
}

TestModel.prototype.sync = smartSync(dbUrl, TestModel)
