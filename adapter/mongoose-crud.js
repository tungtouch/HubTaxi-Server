(function () {
    var BaseCrud, MongooseCrud, Utils, async, _,
        __hasProp = {}.hasOwnProperty,
        __extends = function (child, parent) {
            for (var key in parent) {
                if (__hasProp.call(parent, key)) child[key] = parent[key];
            }
            function ctor() {
                this.constructor = child;
            }

            ctor.prototype = parent.prototype;
            child.prototype = new ctor();
            child.__super__ = parent.prototype;
            return child;
        };

    async = require('async');

    BaseCrud = require('../crud/crud-base').BaseCrud;

    _ = require('underscore');

    Utils = require('../utils/utils').Utils;

    MongooseCrud = (function (_super) {
        __extends(MongooseCrud, _super);

        function MongooseCrud() {
            return MongooseCrud.__super__.constructor.apply(this, arguments);
        }

        MongooseCrud.prototype.read = function (MongooseModelClazz, siteId, aFilter, sQuery, aSort, aGroup, iOffset, iLimit, iField, callback) {
            var findConditions, findConditionsStartUp, findOptions, modelPopulation, operMap;

            if (aFilter == null) {

                aFilter = [];
            }
            if (sQuery == null) {
                sQuery = '';
            }
            if (aSort == null) {
                aSort = [];
            }
            if (aGroup == null) {
                aGroup = [];
            }
            if (iOffset == null) {
                iOffset = 0;
            }
            if (iLimit == null) {
                iLimit = 15;
            }
            if (iField == null) {
                iField = '';
            }

            findOptions = {};
            findOptions.skip = parseInt(iOffset);
            findOptions.limit = parseInt(iLimit);


            /*
             Get order list from aSort
             each element is a object {field, dir}
             */

            findOptions.sort = aSort.reduce(function (l, r) {
                var oSort;
                oSort = {};
                switch (r.dir.toUpperCase()) {
                    case 'ASC':
                        oSort[r.field] = 1;
                        break;
                    case 'DESC':
                        oSort[r.field] = -1;
                        break;
                    default:
                        oSort[r.field] = 1;
                }
                oSort = _.extend(l, oSort);
                return oSort;
            }, {});

            if(aGroup.length > 0){
                _.extend(findOptions, aGroup[0]);
                /*findOptions.group = ;*/
            }


            Utils.logDebug('findOptions: ', findOptions);
            console.log('findOptions: ', findOptions);

            operMap = {
                eq: '$eq',
                lt: '$lt',
                gt: '$gt',
                gte: '$gte',
                lte: '$lte',
                ne: '$ne',
                bt: '$in',
                nbt: '$nin',
                like: '$LIKE'
            };


            findConditionsStartUp = null;
            if (siteId === '0' || siteId === 0) {
                findConditionsStartUp = {};
            } else {
                findConditionsStartUp = {
                    site: siteId
                };
            }


            findConditions = aFilter.reduce(function (l, r) {
                var oLeft, oper, ret;
                oLeft = l;
                switch (r.cmp) {
                    case 'eq':
                        switch (r.type) {
                            case 'integer':
                                oLeft[r.field] = r.value;
                                break;
                            case 'string':
                                oLeft[r.field] = '' + r.value + '';
                                break;
                            case 'date':
                                oLeft[r.field] = r.value;
                                break;
                            default:
                                oLeft[r.field] = r.value;
                        }
                        break;

                    case 'lt':
                        oLeft[r.field] = {$lt: r.value};
                        break;

                    case 'gt':
                        oLeft[r.field] = {$gt: r.value};
                        break;

                    case 'gte':
                        oLeft[r.field] = {$gte: r.value};
                        break;

                    case 'lte':
                        oLeft[r.field] = {$lte: r.value};
                        break;

                    case 'ne':
                        oLeft[r.field] = {$ne: r.value};
                        break;

                    case 'bt':
                        oLeft[r.field] = {$in: r.value};
                        break;

                    case 'nbt':
                        oLeft[r.field] = {$nin: r.value};
                        break;

                    case 'like':
                        oLeft[r.field] = new RegExp(r.value, 'i');
                        break;

                    default:
                        oper = {};
                        oper[operMap[r.cmp]] = r.value;
                        oLeft[r.field] = _.extend(oLeft[r.field] || {}, oper);
                }
                ret = l;
                return ret;
            }, findConditionsStartUp);


            Utils.logDebug('findConditions: ', findConditions);


            modelPopulation = [];

            if (MongooseModelClazz.getPopulation != null) {
                modelPopulation = MongooseModelClazz.getPopulation();
            }
            Utils.logDebug('modelPopulation: ', modelPopulation);


            async.waterfall([
                (function (_this) {
                    return function (cb) {
                        MongooseModelClazz.count(findConditions, function (err, return_count) {
                            cb(err, return_count);
                        });
                    };
                })(this), (function (_this) {
                    return function (return_count, cb) {
                        var chaining, fieldsName, populate, tableName, _i, _len;
                        if (modelPopulation.length > 0) {

                            chaining = MongooseModelClazz.find(findConditions, iField.toString(), findOptions);
                            for (_i = 0, _len = modelPopulation.length; _i < _len; _i++) {
                                populate = modelPopulation[_i];
                                tableName = populate[0];
                                fieldsName = populate[1];
                                if (fieldsName === '*') {
                                    chaining.populate(tableName);
                                } else {
                                    chaining.populate(tableName, fieldsName);
                                }
                            }
                            chaining.exec(function (error, docs) {
                                cb(error, docs, return_count);
                            });
                        } else {
                            MongooseModelClazz.find(findConditions, null, findOptions).exec(function (error, docs) {
                                cb(error, docs, return_count);
                            });
                        }
                    };
                })(this)
            ], function (error, docs, return_count) {
                var sumDoc;
                sumDoc = {};

                callback(error, docs, return_count, sumDoc);
            });
        };

        MongooseCrud.prototype.readOne = function (MongooseModelClazz, siteId, id, callback) {

            var chaining, fieldsName, populate, tableName, _i, _len, modelPopulation;
            modelPopulation = [];
            var idArray = id.split(',');

            if (MongooseModelClazz.getPopulation != null) {
                modelPopulation = MongooseModelClazz.getPopulation();
            }

            if (_.isArray(idArray) && idArray.length === 1) { // Check if Id is Array then get data by mutil ID
                if (modelPopulation.length > 0) {
                    chaining = MongooseModelClazz.find({'_id': {$in: idArray}});
                    for (_i = 0, _len = modelPopulation.length; _i < _len; _i++) {
                        populate = modelPopulation[_i];
                        tableName = populate[0];
                        fieldsName = populate[1];
                        if (fieldsName === '*') {
                            chaining.populate(tableName);
                        } else {
                            chaining.populate(tableName, fieldsName);
                        }
                    }
                    chaining.exec(function (error, docs) {
                        return callback(error, docs);
                    });
                } else {
                    MongooseModelClazz.findById(idArray[0], function (error, doc) {
                        return callback(error, doc);
                    });
                }
            } else {
                if (modelPopulation.length > 0) {
                    chaining = MongooseModelClazz.find({'_id': {$in: idArray}});
                    for (_i = 0, _len = modelPopulation.length; _i < _len; _i++) {
                        populate = modelPopulation[_i];
                        tableName = populate[0];
                        fieldsName = populate[1];
                        if (fieldsName === '*') {
                            chaining.populate(tableName);
                        } else {
                            chaining.populate(tableName, fieldsName);
                        }
                    }
                    chaining.exec(function (error, docs) {
                        return callback(error, docs);
                    });
                } else {
                    MongooseModelClazz.find({'_id': {$in: idArray}}, function (error, doc) {
                        return callback(error, doc);
                    });
                }

            }
        };

        MongooseCrud.prototype.create = function (MongooseModelClazz, siteId, value, callback) {
            var me = this;
            if (siteId === '0' || siteId === 0) {

            } else {
                value.site = siteId;
            }

            async.waterfall([
                function (cb) {
                    MongooseModelClazz.create(value, function (error, doc) {
                        cb(error, doc);
                    })
                }, function (doc, cb) {
                    MongooseCrud.prototype.readOne(MongooseModelClazz, siteId, doc.id, function (err, result) {
                        cb(err, result);
                    })
                }
            ], function (err, result) {
                callback(err, result);
            })

        };

        MongooseCrud.prototype.update = function (MongooseModelClazz, siteId, id, value, callback) {


            var idArray = id.split(',');
            if (_.isArray(idArray) && idArray.length === 1) {

                async.waterfall([
                    function (cb) {
                        MongooseModelClazz.findByIdAndUpdate(idArray[0], value, function (error, doc) {
                            cb(error, doc);
                        })
                    }, function (doc, cb) {
                        MongooseCrud.prototype.readOne(MongooseModelClazz, siteId, doc.id, function (err, result) {
                            cb(err, result);
                        })
                    }
                ], function (err, result) {
                    callback(err, result);
                })
            } else { // Update mutil ID
                MongooseModelClazz.update({_id: {$in: idArray}}, {$set: value}, { multi: true }, function (err, result) {
                    callback(err, result);
                });
            }

        };

        MongooseCrud.prototype.delete = function (MongooseModelClazz, siteId, id, callback) {
            async.waterfall([
                function (cb) {
                    MongooseModelClazz.findById(id, function (error, doc) {
                        cb(error, doc);
                    });
                }, function (doc, cb) {
                    MongooseModelClazz.remove({
                        _id: id
                    }, function (error) {
                        cb(error, doc);
                    });
                }
            ], function (error, doc) {
                return callback(error, doc);
            });
        };

        MongooseCrud.prototype.deleteAll = function (MongooseModelClazz, siteId, callback) {
            var removeCondition;
            removeCondition = null;
            if (siteId === '0' || siteId === 0) {
                removeCondition = {};
            } else {
                removeCondition = {
                    site: siteId
                };
            }
            async.waterfall([
                function (cb) {
                    MongooseModelClazz.remove(removeCondition, function (error) {
                        cb(null, error);
                    });
                }
            ], function (error, doc) {
                return callback(error, doc);
            });
        };

        return MongooseCrud;

    })(BaseCrud);

    exports.MongooseCrud = MongooseCrud;

}).call(this);

//# sourceMappingURL=mongoose-crud.map
