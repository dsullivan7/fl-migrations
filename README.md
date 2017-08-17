# Migrations for backbone-orm

[![NPM version](https://img.shields.io/npm/v/fl-migrations.svg?style=flat)](https://www.npmjs.org/package/fl-migrations)
[![Build Status](https://travis-ci.org/founderlab/fl-migrations.svg?branch=master)](https://travis-ci.org/founderlab/fl-migrations)
[![Coverage Status](https://img.shields.io/coveralls/founderlab/fl-migrations.svg)](https://coveralls.io/r/founderlab/fl-migrations?branch=master)
[![License](https://img.shields.io/npm/l/jfs.svg)](https://github.com/founderlab/fl-migrations/blob/master/LICENSE)

fl-migrations is an implementation of migrations for backbone-orm

## Install
```
npm install fl-migrations
```

## Usage

### Sample Migration File

```javascript
// 00001_migration.js
import YourModel from './some_model_directory/YourModel'

module.exports = {
  up: (callback) => {
    const newModel = new YourModel({field1: 'someValue', field2: 'someOtherValue'})
    newModel.save(callback)
  },
}
```

### Execute Migrations
```javascript
import { Migrations } from 'fl-migrations'

migrations = new Migrations({
  // required, the location of the migrations files
  path: './my_migrations_directory'

  // optional, the path to match migration files, defaults to '.js$'
  pattern: '.js$'
})

migrations.migrate()
```

### Reset Migrations
```javascript
migrations.reset()
```

## Tests
```
eval $(cat .test_env) npm run create-db
eval $(cat .test_env) npm test
```
