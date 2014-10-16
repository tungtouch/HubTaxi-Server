(function () {
    var BaseParams, Params, Utils, _,
        __bind = function ( fn, me ) {
            return function () {
                return fn.apply(me, arguments);
            };
        },
        __hasProp = {}.hasOwnProperty,
        __extends = function ( child, parent ) {
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

    _ = require('underscore');

    Utils = require('../utils/utils').Utils;

    BaseParams = require('./params-base').BaseParams;

    Params = (function ( _super ) {
        __extends(Params, _super);

        function Params() {
            this.getConditionFromArray = __bind(this.getConditionFromArray, this);
            this.getConditionFromString = __bind(this.getConditionFromString, this);
            this.getLimit = __bind(this.getLimit, this);
            this.getOffset = __bind(this.getOffset, this);
            this.getGroup = __bind(this.getGroup, this);
            this.getSort = __bind(this.getSort, this);
            this.getQuery = __bind(this.getQuery, this);
            this.getFilter = __bind(this.getFilter, this);
            this.getField = __bind(this.getField, this);
            return Params.__super__.constructor.apply(this, arguments);
        }

        Params.prototype.getFilter = function () {
            var el, elements, els, filter, _i, _len;
            filter = this.req.query.filter;
            elements = [];
            if (filter != null) {
                Utils.logInfo('Filter defined: ', filter);
                if (_.isString(filter)) {
                    els = this.getConditionFromString(filter);

                    for (_i = 0, _len = els.length; _i < _len; _i++) {
                        el = els[_i];
                        elements.push(el);
                    }
                } else if (_.isArray(filter)) {
                    elements = this.getConditionFromArray(filter);
                }
            }
            return elements;
        };

        Params.prototype.getQuery = function () {
            var query;
            query = this.req.query.query;
            return query;
        };

        Params.prototype.getSort = function () {
            var mapSort, sort, sortArr;
            sort = this.req.query.sort;
            mapSort = [];
            if (sort != null) {
                Utils.logInfo('Sort defined: ', sort);
                if (_.isString(sort)) {
                    sortArr = JSON.parse(sort);
                    if (_.isArray(sortArr)) {
                        mapSort = sortArr.map(function ( item ) {
                            return {
                                field: item.property,
                                dir: item.direction
                            };
                        });
                    }
                }
                Utils.logInfo('Sort output: ', mapSort);
            }
            return mapSort;
        };

        Params.prototype.getGroup = function () {
            var group, groupArr, mapGroup;
            group = this.req.query.group;
            console.log('Params.prototype.getGroup', group);
            mapGroup = [];
            if (group != null) {
                if (_.isString(group)) {
                    groupArr = JSON.parse(group);
                    if (_.isArray(groupArr)) {
                        mapGroup = groupArr.map(function ( item ) {
                            return {
                                group: item.field
                            };
                        });
                    }
                }
            }
            return mapGroup;
        };

        Params.prototype.getOffset = function () {
            return this.req.query.start;
        };
        Params.prototype.getField = function () {
            return this.req.query.field;
        };

        Params.prototype.getLimit = function () {
            return this.req.query.limit;
        };


        Params.prototype.getMutilQuery = function () {
            return (this.req.query.mg) ? this.req.query.mg : false;
        };

        Params.prototype.getConditionFromString = function ( filter ) {
            var element, elements, item, items, _i, _len;
            elements = [];
            items = JSON.parse(filter);
            if (_.isArray(items)) {
                for (_i = 0, _len = items.length; _i < _len; _i++) {
                    item = items[_i];
                    element = {
                        field: item.property,
                        value: item.value,
                        type: item.type || '',
                        cmp: item.comparison || 'eq'
                    };
                    elements.push(element);
                }
            }
            return elements;
        };

        Params.prototype.getConditionFromArray = function ( filter ) {
            var el, element, elements, els, item, _i, _j, _len, _len1;
            elements = [];
            for (_i = 0, _len = filter.length; _i < _len; _i++) {
                item = filter[_i];
                if (_.isString(item)) {
                    els = this.getConditionFromString(item);
                    for (_j = 0, _len1 = els.length; _j < _len1; _j++) {
                        el = els[_j];
                        elements.push(el);
                    }
                } else if (_.isObject(item)) {
                    element = {
                        field: item.field,
                        value: item.data.value,
                        type: item.data.type,
                        cmp: item.data.comparison
                    };
                    elements.push(element);
                }
            }
            return elements;
        };



        return Params;

    })(BaseParams);

    exports.Params = Params;

}).call(this);

//# sourceMappingURL=params.map
