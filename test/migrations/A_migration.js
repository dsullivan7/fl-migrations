import Queue from 'queue-async'

import TestModel from '../models/TestModel'

module.exports = {
  up: (callback) => {
    const queue = new Queue()
    const newModels = [
      {myTextField: 'blah1', myIntegerField: 1},
      {myTextField: 'blah2', myIntegerField: 2},
    ]

    newModels.forEach(attributes => {
      queue.defer(callback => new TestModel(attributes).save(callback))
    })

    queue.await(callback)
  },
}
