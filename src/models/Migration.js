import Backbone from 'backbone'
import { smartSync } from 'fl-server-utils'

const dbUrl = process.env.DATABASE_URL
if (!dbUrl) console.log('Missing process.env.DATABASE_URL')

export default class Migration extends Backbone.Model {
  url = `${dbUrl}/migrations`

  schema = () => ({
    name: 'Text',
    createdDate: 'DateTime',
  })

  defaults() { return {createdDate: new Date()} }
}

Migration.prototype.sync = smartSync(dbUrl, Migration)
