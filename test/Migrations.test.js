/* eslint-env node, jest */

import path from 'path'

import Migration from '../src/migration/Migration'
import { Migrations } from '../src'
import TestModel from './models/TestModel'

const resetSchema = () => new Promise((resolve, reject) => {
  TestModel.db().resetSchema((err, data) => {
    if (err) reject(err)
    resolve(data)
  })
})

const ensureSchema = () => new Promise((resolve, reject) => {
  TestModel.db().ensureSchema((err, data) => {
    if (err) reject(err)
    resolve(data)
  })
})

const modelSave = (model) => new Promise((resolve, reject) => {
  model.save((err, data) => {
    if (err) reject(err)
    resolve(data)
  })
})

const modelFind = (Model, query) => new Promise((resolve, reject) => {
  Model.find(query, (err, data) => {
    if (err) reject(err)
    resolve(data)
  })
})

const migrate = (migration) => new Promise((resolve, reject) => {
  migration.migrate((err, data) => {
    if (err) reject(err)
    resolve(data)
  })
})

beforeEach(async () => {
  await resetSchema()
  await ensureSchema()
})

describe('Migrations Tests', async () => {
  test('should execute a single migration', async () => {
    const model = new TestModel({myTextField: 'blah', myIntegerField: 777})
    await modelSave(model)

    // ensure the database is how we expect
    const storedModelsBefore = await modelFind(TestModel, {})
    expect(storedModelsBefore.length).toBe(1)
    expect(storedModelsBefore[0].attributes.myIntegerField).toBe(777)
    expect(storedModelsBefore[0].attributes.myTextField).toBe('blah')

    // execute the migrations and retest
    const migration = new Migration({path: path.resolve(__dirname, 'migrations/A_migration')})
    await (migrate(migration))
    const storedModelsAfter = await modelFind(TestModel, {$sort: 'createdDate'})
    expect(storedModelsAfter.length).toBe(3)
    expect(storedModelsAfter[0].attributes.myIntegerField).toBe(777)
    expect(storedModelsAfter[1].attributes.myIntegerField).toBe(1)
    expect(storedModelsAfter[1].attributes.myTextField).toBe('blah1')
    expect(storedModelsAfter[2].attributes.myIntegerField).toBe(2)
    expect(storedModelsAfter[2].attributes.myTextField).toBe('blah2')
  })

  // test('should execute all migrations in the directory', async () => {
  //   const model = new TestModel({myTextField: 'blah', myIntegerField: 777})
  //   await modelSave(model)

  //   // ensure the database is how we expect
  //   const storedModelsBefore = await modelFind(TestModel, {})
  //   expect(storedModelsBefore.length).toBe(1)
  //   expect(storedModelsBefore[0].attributes.myIntegerField).toBe(777)
  //   expect(storedModelsBefore[0].attributes.myTextField).toBe('blah')

  //   // execute the migrations and retest
  //   const migrations = new Migrations({path: path.resolve(__dirname, 'migrations')})
  //   await (migrate(migrations))
  //   const storedModelsAfter = await modelFind(TestModel, {$sort: 'createdDate'})
  //   expect(storedModelsAfter.length).toBe(3)
  //   expect(storedModelsAfter[0].attributes.myIntegerField).toBe(777)
  //   expect(storedModelsAfter[1].attributes.myIntegerField).toBe(1)
  //   expect(storedModelsAfter[1].attributes.myTextField).toBe('blah1')
  //   expect(storedModelsAfter[2].attributes.myIntegerField).toBe(2)
  //   expect(storedModelsAfter[2].attributes.myTextField).toBe('blah2')
  // })
})
