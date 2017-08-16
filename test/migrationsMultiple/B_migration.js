import Queue from 'queue-async'

import TestModel from '../models/TestModel'

module.exports = {
  up: (callback) => {
    const queue = new Queue()
    const newModels = [
      {myTextField: 'blah3', myIntegerField: 333},
      {myTextField: 'blah4', myIntegerField: 444},
    ]

    newModels.forEach(attributes => {
      queue.defer(callback => new TestModel(attributes).save(callback))
    })

    queue.await(callback)
  },
}
