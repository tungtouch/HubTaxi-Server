
(function () {
    var _, User, Utils, async, hash, jwt, serverConfig, userRoles;

    jwt = require('jwt-simple');

    async = require('async');

    _ = require('underscore');

    hash = require('../utils/pass').hash;

    serverConfig = require('../config/init').serverConfig;

    Utils = require('../utils/utils').Utils;

    userRoles = require('../user/routing-config').userRoles;

    User = (function () {
        function User() {
        }

        User.dbProvider = null;

        User.cacheTokens = [];

        User.getUser = function (siteId, name, callback) {
            var findConditions;
            findConditions = null;
            if (siteId === 0 || siteId === '0') {
                findConditions = {
                    username: name
                };
            } else {
                findConditions = {
                    site: siteId,
                    username: name
                };
            }
            Utils.logInfo(findConditions);
            User.dbProvider.Users.findOne(findConditions, function (err, user) {
                callback(err, user);
            });
        };

        User.getUserDevice = function (deviceId, table, cb) {
            var findConditions;

            findConditions = {
                deviceId: deviceId
            };

            User.dbProvider[table].findOne(findConditions, function (err, user) {
                cb(err, user);
            });
        };


        User.getDriver = function (siteId, name, callback) {
            var findConditions;
            findConditions = null;

            findConditions = {
                username: name
            };

            Utils.logInfo(findConditions);

            var chaning = User.dbProvider.Drivers.findOne(findConditions);
            var populateQuery = [
                {path: 'company', select: 'companyName hotline price nextKmPrice'},
                {path: 'type', select: 'seatNum carMarker'}
            ];

            chaning.populate(populateQuery);
            chaning.exec(function (err, user) {
                callback(err, user);
            })
        };

        User.sendMessageRegister = function (userInfo, cb) {
            var messageInfo = {};
            messageInfo.title = 'Chào mừng bạn đến với cộng đồng Nodejs Việt Nam';
            messageInfo.message = "Bạn vừa đăng ký thành công tài khoản trên blog của Nodejs.VN với tài khoản : " + userInfo.username + ". Bạn có thể vào mục quản lý tài khoản để cập nhập thông tin của mình";
            messageInfo.user = userInfo.id;
            messageInfo.state = 0;
            messageInfo.messageAt = new Date();
            User.dbProvider.MessageUsers.create(messageInfo, function (err, result) {
                cb(err, result);
            })
        };

        /*
         User.getFbUser = function ( name, callback ) {
         User.dbProvider.FbUsers.findOne({
         username: name
         }, function ( err, user ) {
         callback(err, user);
         });
         };

         User.getFbUserById = function ( id, callback ) {
         User.dbProvider.FbUsers.findOne({
         fbId: id
         }, function ( err, user ) {
         callback(err, user);
         });
         };

         User.createSite = function ( site, callback ) {
         User.dbProvider.Site.create(site, function ( error, doc ) {
         callback(error, doc);
         });
         };

         User.updateSite = function ( siteId, value, callback ) {
         User.dbProvider.Site.findByIdAndUpdate(siteId, value, function ( error, doc ) {
         return callback(error, doc);
         });
         };
         */
        User.saveUser = function (user, callback) {
            User.dbProvider.Users.create(user, function (error, doc) {
                callback(error, doc);
            });
        };

        User.updateUser = function (userId, user) {
            console.log('userId', userId);
            console.log('user', user);

            /*User.dbProvider.Users.findByIdAndUpdate(userId, user, function (err, result) {
             callback(err, result);
             })*/
        };

        User.saveDriver = function (user, callback) {
            User.dbProvider.Drivers.create(user, function (error, doc) {
                callback(error, doc);
            });
        };

        User.updateUser = function (user, callback) {
            var id;
            id = user._id;
            delete user._id;
            User.dbProvider.Users.findByIdAndUpdate(id, user, function (error, doc) {
                callback(error, doc);
            });
        };

        User.authenticate = function (siteId, userName, passWord, callback) {
            var user;
            Utils.logInfo('Authenticating starting...');
            Utils.logInfo('siteId: ', siteId);
            Utils.logInfo('username: ', userName);
            Utils.logInfo('password: ', passWord);
            if (userName === 'anon') {
                user = {};
                user.site = siteId;
                user.id = '0';
                user.name = userName;
                user.fullname = 'Anonymous User';
                user.role = 'anon';
                callback(null, user);
            } else {
                async.waterfall([
                    function (cb) {
                        User.getUser(siteId, userName, function (error, user) {
                            cb(error, user);
                        });
                    }, function (user, cb) {
                        var errMsg;
                        if (user) {

                            hash(passWord, user.salt, function (err, hash) {
                                cb(err, user, hash);
                            });
                        } else {
                            errMsg = 'LOGIN.ERROR.USERNAME';
                            cb(errMsg, null);
                            Utils.logInfo('Authenticating', 'error', errMsg);
                        }
                    }, function (user, hash, cb) {
                        var errMsg;
                        if (hash === user.hash) {
                            user.password = passWord;
                            cb(null, user);
                        } else {
                            errMsg = 'LOGIN.ERROR.PASSWORD';
                            cb(errMsg, null);
                        }
                    }
                ], function (error, result) {
                    callback(error, result);
                });
            }
        };


        User.authenticateDriver = function (siteId, userName, passWord, callback) {
            var user;
            Utils.logInfo('Authenticating starting...');
            Utils.logInfo('siteId: ', siteId);
            Utils.logInfo('username: ', userName);
            Utils.logInfo('password: ', passWord);
            if (userName === 'anon') {
                user = {};
                user.site = siteId;
                user.id = '0';
                user.name = userName;
                user.fullname = 'Anonymous User';
                user.role = 'anon';
                callback(null, user);
            } else {
                async.waterfall([
                    function (cb) {
                        User.getDriver(siteId, userName.toLowerCase(), function (error, user) {
                            cb(error, user);
                        });
                    }, function (user, cb) {
                        var errMsg;
                        if (user) {

                            hash(passWord, user.salt, function (err, hash) {
                                cb(err, user, hash);
                            });
                        } else {
                            errMsg = 'LOGIN.ERROR.USERNAME';
                            cb(errMsg, null);
                            Utils.logInfo('Authenticating', 'error', errMsg);
                        }
                    }, function (user, hash, cb) {
                        var errMsg;
                        if (hash === user.hash) {
                            user.password = passWord;
                            cb(null, user);
                        } else {
                            errMsg = 'LOGIN.ERROR.PASSWORD';
                            cb(errMsg, null);
                        }
                    }
                ], function (error, result) {
                    callback(error, result);
                });
            }
        };


        User.authenticateSuccess = function (req, res) {
            var client_ip, expired_date, token, user;
            expired_date = new Date();
            expired_date.setMinutes(expired_date.getMinutes() + 6 * 60);
            client_ip = Utils.getClientIp(req);
            user = {};
            user.site = req.user.site;
            user.id = req.user.id;
            user.name = req.user.username;
            user.avatar = req.user.avatar;
            user.fullname = req.user.fullname;
            user.role = userRoles[req.user.role];
            user.expired = expired_date;
            user.ip = client_ip;
            token = jwt.encode(user, serverConfig._tokenScrete);

            //console.log('authenticateSucess', 'cacheTokens', user, req.user);

            User.cacheTokens.push(token);

            res.send({
                user: user,
                token: token
            }, 200);
        };


        User.managerAuthenticateSuccess = function (req, res) {
            var client_ip, expired_date, token, user;
            expired_date = new Date();
            expired_date.setMinutes(expired_date.getMinutes() + 6 * 60);
            client_ip = Utils.getClientIp(req);
            user = {};
            user.site = req.user.site;
            user.id = req.user.id;
            user.name = req.user.username;
            user.avatar = req.user.avatar;
            user.fullname = req.user.fullname;
            user.role = userRoles[req.user.role];
            user.expired = expired_date;
            user.ip = client_ip;
            token = jwt.encode(user, serverConfig._tokenScrete);

            //console.log('authenticateSucess', 'cacheTokens', user, req.user);

            User.cacheTokens.push(token);

            res.send({
                user: user,
                token: token
            }, 200);
        };

        User.driverAuthenticateSuccess = function (req, res) {
            var client_ip, expired_date, token, user;
            expired_date = new Date();
            expired_date.setMinutes(expired_date.getMinutes() + 6 * 60);
            client_ip = Utils.getClientIp(req);
            user = {};
            user.site = req.user.site;
            user.id = req.user.id;
            user.name = req.user.username;
            user.avatar = req.user.avatar;
            user.company = req.user.company;
            user.type = req.user.type;
            user.fullname = req.user.fullname;
            user.bio = req.user.bio;
            user.role = userRoles[req.user.role];
            user.expired = expired_date;
            user.ip = client_ip;
            token = jwt.encode(user, serverConfig._tokenScrete);
            User.cacheTokens.push(token);
            res.send({
                user: user,
                token: token
            }, 200);
        };

        User.logout = function (req, res) {
            var ip, token;
            token = req.headers['authorization'] || req.query.token;
            ip = Utils.getClientIp(req);
            User.verifyToken(token, ip, function (error, user) {
                var foundToken, index, item, _i, _len, _ref;
                if (user) {
                    index = 0;
                    foundToken = null;
                    _ref = User.cacheTokens;
                    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                        item = _ref[_i];
                        if (item === token) {
                            foundToken = index;
                        }
                        index++;
                    }
                    if (foundToken) {
                        User.cacheTokens.splice(foundToken, 1);
                    }
                    res.send({
                        success: true
                    });
                } else {
                    res.send({
                        success: false,
                        message: error
                    });
                }
            });
        };

        User.authenticateFb = function (accessToken, refreshToken, profile, done) {
            User.getFbUserById({
                fbId: profile.id
            }, function (err, oldUser) {
                var newUser;
                if (oldUser) {
                    done(null, oldUser);
                } else {
                    newUser = new this.dbProvider.FbUsers({
                        fbId: profile.id,
                        email: profile.emails[0].value,
                        name: profile.displayName
                    }).save(function (err, newUser) {
                            if (err) {
                                throw err;
                            }
                            done(null, newUser);
                        });
                }
            });
        };

        User.registerCustomer = function (req, res) { // Update userInfo

            var userId, userName, password, deviceId, fullname, phone, birthday, location;
            userName = req.body.username;
            password = req.body.password;
            deviceId = req.body.deviceId;
            fullname = req.body.fullname;
            phone = req.body.phone;
            /*birthday = req.body.birthday;*/
            /*location = req.body.location;*/
            userId = req.body.userId;
            var ret = {
                success: false,
                message: null,
                data: {}
            };


            async.waterfall([
                function (cb) {
                    hash(password, function (err, salt, hash) {
                        cb(err, salt, hash);
                    });
                },
                function (salt, hash, cb) {
                    User.getUserDevice(deviceId, 'Users', function (err, result) {

                        if (result) {
                            Utils.logInfo('registerCustomer', ' result ', result);
                            if (result.username == result.deviceId) {
                                cb(null, salt, hash, result);
                            } else {
                                cb('REGISTER.ERR.REGISTED', salt, hash, result);
                            }
                        } else {
                            cb('REGISTER.ERR.DEVICE', salt, hash);
                        }
                    });
                },
                function (salt, hash, user, cb) {

                    User.getUser(null, userName, function (err, result) {
                        if (!result) {
                            cb(null, salt, hash, user);
                        } else {
                            console.log('getUser', 'err', err);
                            cb('REGISTER.ERR.USERNAME', salt, hash);
                        }
                    });
                },
                function (salt, hash, user, cb) {
                    console.log('getUserInfo', user);
                    if (user.id == userId) {
                        cb(null, salt, hash);
                    } else {
                        cb('REGISTER.ERR.USERID', salt, hash);
                    }
                },
                function (salt, hash, cb) {
                    //console.log('step END');
                    var user;
                    user = {
                        username: userName,
                        deviceId: deviceId,
                        fullname: fullname,
                        phone: phone,
                        /*birthday: birthday,
                         location: location,*/
                        salt: salt,
                        hash: hash
                    };
                    Utils.logInfo('user: ', user);

                    User.dbProvider.Users.findByIdAndUpdate(userId, user, function (err, result) {
                        cb(err, result);
                    });

                    /*User.saveUser(user, function (error, result) {
                     cb(error, result);
                     });*/
                }], function (error, result) {
                var msg;
                if (error) {

                    ret.message = error;
                } else {
                    ret.message = 'REGISTER.SUCCESS';
                    ret.success = true;
                    ret.data = result;
                }
                res.send(ret, 200);
            });
        };


        User.register = function (req, res) {
            var password, userName, deviceId;
            userName = req.body.username;
            password = req.body.password;
            deviceId = req.body.deviceId;

            var ret = {
                success: false,
                message: null,
                data: {}
            };
            async.waterfall([
                function (cb) {
                    hash(password, function (err, salt, hash) {
                        cb(err, salt, hash);
                    });
                },
                function (salt, hash, cb) {
                    User.getUserDevice(deviceId, 'Users', function (err, result) {
                        if (!result) {
                            cb(null, salt, hash);
                        } else {
                            cb('REGISTER.ERR.DEVICE', salt, hash);
                        }
                    })
                },
                function (salt, hash, cb) {

                    User.getUser(null, userName, function (err, result) {
                        if (!result) {
                            cb(null, salt, hash);
                        } else {
                            cb('REGISTER.ERR.USERNAME', salt, hash);
                        }
                    });
                },
                function (salt, hash, cb) {
                    var user;
                    user = {
                        username: userName,
                        deviceId: deviceId,
                        salt: salt,
                        hash: hash

                    };
                    Utils.logInfo('user: ', user);
                    User.saveUser(user, function (error, result) {
                        cb(error, result);
                    });
                }], function (error, result) {
                var msg;
                if (error) {
                    console.log('-- *. REGISTER false', error);
                    ret.message = error;
                } else {
                    console.log('-- *. REGISTER success', result);
                    ret.message = 'REGISTER.SUCCESS';
                    ret.success = true;
                    ret.data = result;
                }
                res.send(ret, 200);
            });
        };


        User.registerDriver = function (req, res) {
            var password, userName, deviceId, company, driverType, fullname;
            userName = req.body.username.toLowerCase();
            fullname = req.body.fullname;
            password = req.body.password;
            deviceId = req.body.deviceId;
            company = req.body.company;
            driverType = req.body.type;
            var ret = {
                success: false,
                message: null,
                data: {}
            };
            async.waterfall([
                function (cb) {
                    hash(password, function (err, salt, hash) {
                        cb(err, salt, hash);
                    });
                },
                function (salt, hash, cb) {
                    User.getUserDevice(deviceId, 'Drivers', function (err, result) {
                        if (!result) {
                            cb(null, salt, hash);
                        } else {
                            cb('REGISTER.ERR.DEVICE', salt, hash);
                        }
                    })
                }
                , function (salt, hash, cb) {

                    User.getDriver(null, userName, function (err, result) {
                        if (!result) {
                            cb(null, salt, hash);
                        } else {
                            cb('REGISTER.ERR.USERNAME', salt, hash);
                        }
                    });
                }, function (salt, hash, cb) {
                    var user;
                    user = {
                        username: userName,
                        company: company,
                        type: driverType,
                        fullname: fullname,
                        salt: salt,
                        hash: hash
                    };
                    Utils.logInfo('user: ', user);
                    User.saveDriver(user, function (error, result) {
                        cb(error, result);
                    });
                }
            ], function (error, result) {
                var msg;
                if (error) {
                    ret.message = error;
                } else {
                    ret.message = 'REGISTER.SUCCESS';
                    ret.success = true;
                    ret.data = result;
                }
                res.send(ret, 200);
            });
        };


        User.registerManager = function (req, res) {
            var password, userName, deviceId, company, driverType, fullname;
            userName = req.body.username.toLowerCase();
            fullname = req.body.fullname;
            password = req.body.password;
            /*deviceId = req.body.deviceId;
             company = req.body.company;
             driverType = req.body.type;*/
            var ret = {
                success: false,
                message: null,
                data: {}
            };
            async.waterfall([
                function (cb) {
                    hash(password, function (err, salt, hash) {
                        cb(err, salt, hash);
                    });
                }
                , function (salt, hash, cb) {
                    User.dbProvider.Managers.findOne({username: userName}, function (err, user) {
                        if (!user) {
                            cb(null, salt, hash);
                        } else {
                            cb('REGISTER.ERR.USERNAME', salt, hash);
                        }

                    });

                }, function (salt, hash, cb) {
                    var user;
                    user = {
                        username: userName,
                        fullname: fullname,
                        salt: salt,
                        hash: hash
                    };
                    Utils.logInfo('user: ', user);
                    User.dbProvider.Managers.create(user, function (error, doc) {
                        cb(error, doc);
                    });
                }
            ], function (error, result) {
                var msg;
                if (error) {
                    ret.message = error;
                } else {
                    ret.message = 'REGISTER.SUCCESS';
                    ret.success = true;
                    ret.data = result;
                }
                res.send(ret, 200);
            });
        };


        User.managerLogin = function (siteId, userName, passWord, callback) {

            console.log(userName, passWord);
            var user;
            Utils.logInfo('Authenticating Manager starting...');

            if (userName === 'anon') {
                user = {};
                user.site = siteId;
                user.id = '0';
                user.name = userName;
                user.fullname = 'Anonymous User';
                user.role = 'anon';
                callback(null, user);
            } else {
                async.waterfall([
                    function (cb) {
                        User.dbProvider.Managers.findOne({username: userName}, function (err, user) {
                            cb(err, user);
                        });
                    }, function (user, cb) {
                        var errMsg;
                        if (user) {

                            hash(passWord, user.salt, function (err, hash) {
                                cb(err, user, hash);
                            });
                        } else {
                            errMsg = 'LOGIN.ERROR.USERNAME';
                            cb(errMsg, null);
                            Utils.logInfo('Authenticating', 'error', errMsg);
                        }
                    }, function (user, hash, cb) {
                        var errMsg;
                        if (hash === user.hash) {
                            user.password = passWord;
                            cb(null, user);
                        } else {
                            errMsg = 'LOGIN.ERROR.PASSWORD';
                            cb(errMsg, null);
                        }
                    }
                ], function (error, result) {
                    callback(error, result);
                });
            }
        };


        User.registerSite = function (req, res) {
            var adminData, siteData;
            siteData = {};
            siteData.name = req.body.siteName || 'DefaultNewSite';
            siteData.description = req.body.siteDescription;
            siteData.logoUrl = req.body.siteLogoUrl;
            siteData.address = req.body.siteAddress;
            siteData.telephone = req.body.siteTelephone;
            siteData.totalTable = req.body.siteTotalTable;
            adminData = {};
            adminData.username = req.body.adminName || siteData.name + 'Admin';
            adminData.fullname = req.body.adminFullName || 'Site Admin';
            adminData.password = req.body.adminPassword || '123456';
            adminData.role = 'admin';
            async.waterfall([
                function (cb) {
                    Utils.logInfo('newSite: ', siteData);
                    User.createSite(siteData, function (error, result) {
                        cb(error, result);
                    });
                }, function (newSite, cb) {
                    hash(adminData.password, function (err, salt, hash) {
                        cb(err, newSite, salt, hash);
                    });
                }, function (newSite, salt, hash, cb) {
                    adminData.site = newSite.id;
                    adminData.salt = salt;
                    adminData.hash = hash;
                    User.saveUser(adminData, function (error, siteAdmin) {
                        cb(error, newSite, siteAdmin);
                    });
                }, function (newSite, siteAdmin, cb) {
                    var adminId, siteId;
                    siteId = newSite.id;
                    adminId = siteAdmin.id;
                    User.updateSite(siteId, {
                        admin: adminId
                    }, function (error, updatedSite) {
                        cb(error, updatedSite, siteAdmin);
                    });
                }
            ], function (error, newSite, siteAdmin) {
                var msg, success;
                success = false;
                if (error) {
                    success = false;
                    msg = error;
                } else {
                    success = true;
                    msg = 'Site registration was successed';
                }
                res.send({
                    success: success,
                    message: msg,
                    newSite: newSite,
                    siteAdmin: siteAdmin
                }, 200);
            });
        };

        User.verifyToken = function (token, ip, cb) {
            var e, errMsg, foundToken, item, user, _i, _len, _ref;
            Utils.logInfo('verifyToken...');
            Utils.logInfo("request_ip: ", ip);
            errMsg = '';
            user = null;
            console.log('verifyToken', token, ip, this.cacheTokens);
            if (!token || token == 'null') {

                /*
                 * Add by ThinhNV --- test
                 * */

                //errMsg = 'Token is null';
                user = {

                    fullname: 'Anonymous User',
                    role: { bitMask: 1, title: 'anon' }
                };

            } else {
                try {
                    foundToken = false;
                    _ref = this.cacheTokens;
                    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                        item = _ref[_i];
                        if (item === token) {
                            foundToken = true;
                        }
                    }
                    if (!foundToken) {
                        errMsg = 'Token is not found';

                    } else {

                        user = jwt.decode(token, serverConfig._tokenScrete);
                        if (user.ip === ip) {
                            if (new Date(user.expired) < new Date()) {
                                errMsg = 'Token was expired';
                            }
                        } else {
                            errMsg = 'Token has invalid ip address: ' + ip;
                        }
                    }
                } catch (_error) {
                    e = _error;
                    errMsg = 'Token decode eror: ' + e.toString();
                }
                Utils.logInfo('       [1] - Token decode is : ' + token);
            }
            if (errMsg === '') {
                cb(null, user);
                Utils.logInfo('verifyToken OK, user:', user);
            } else {
                cb(errMsg, false);
                Utils.logError(errMsg);
            }
        };

        User.restrictToken = function (token, ip, cb) {
            var e, errMsg, foundToken, item, user, _i, _len, _ref;
            Utils.logInfo('verifyToken...');
            Utils.logInfo("request_ip: ", ip);
            errMsg = '';
            user = null;

            if (!token || token == 'null') {

                /*
                 * Add by ThinhNV --- test
                 * */

                errMsg = 'Token is null';


            } else {
                try {
                    foundToken = false;
                    _ref = this.cacheTokens;
                    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                        item = _ref[_i];
                        if (item === token) {
                            foundToken = true;
                        }
                    }
                    if (!foundToken) {
                        errMsg = 'Token is not found';

                    } else {

                        user = jwt.decode(token, serverConfig._tokenScrete);
                        if (user.ip === ip) {
                            if (new Date(user.expired) < new Date()) {
                                errMsg = 'Token was expired';
                            }
                        } else {
                            errMsg = 'Token has invalid ip address: ' + ip;
                        }
                    }
                } catch (_error) {
                    e = _error;
                    errMsg = 'Token decode eror: ' + e.toString();
                }
            }
            if (errMsg === '') {
                cb(null, user);
                Utils.logInfo('verifyToken OK, user:', user);
            } else {
                cb(errMsg, false);
                Utils.logError(errMsg);
            }
        };




        User.validateToken = function (req, res) {
            var ip, token;
            token = req.headers['authorization'] || req.query.token;
            ip = Utils.getClientIp(req);
            User.verifyToken(token, ip, function (error, user) {
                if (user) {
                    res.send({
                        success: true,
                        user: user
                    });
                } else {
                    res.send({
                        success: false,
                        message: error
                    });
                }
            });
        };

        User.restrict = function (req, res, next) {
            var clientIp, token, domain, hostsApp;

            var hosts = {};

            /* component check domain App */
            domain = req.host;

            // connect database global get info App

            hostsApp =
            {
                'localhost': {
                    _db: "mongodb://admin:admin@ds063297.mongolab.com:63297/nodejsforumd",
                    _tokenScrete: "locahostToken",
                    _cookieSecret: "localhostCookie",
                    _sessionSecret: "localhostSession",
                    _active: true
                },
                'domain2.com': {
                    _db: "mongodb://admin:admin@ds063297.mongolab.com:63297/domain2",
                    _tokenScrete: "token1",
                    _cookieSecret: "cookie1",
                    _sessionSecret: "session1",
                    _active: true
                },
                'vsoft.vn': {
                    _db: "mongodb://admin:admin@ds063297.mongolab.com:63297/vsoft",
                    _tokenScrete: "token2",
                    _cookieSecret: "token2",
                    _sessionSecret: "token2",
                    _active: true
                },
                'nodejs.vn': {
                    _db: "mongodb://admin:admin@ds063297.mongolab.com:63297/nodejs",
                    _tokenScrete: "token3",
                    _cookieSecret: "cookie3",
                    _sessionSecret: "session3",
                    _active: true
                }
            };

            if (_.has(hostsApp, domain)) {
                serverConfig = hostsApp[domain];
                //console.log('[2] Server active config : ' , serverConfig);
                //next();
            } else {
                //console.log("[2] Server not active config");
            }

            token = req.headers['authorization'] || req.query.token;
            clientIp = Utils.getClientIp(req);

            User.verifyToken(token, clientIp, function (error, user) {
                if (user) {
                    req.loginUser = user;
                    next();
                } else {
                    res.send({
                        message: 'Unauthenticated',
                        error: error || ''
                    }, 401);
                }
            });
        };

        User.deserializeUser = function (id, done) {
            async.waterfall([
                function (cb) {
                    return User.getFbUser(id, function (err, user) {
                        return cb(err, user);
                    });
                }, function (user, cb) {
                    if (user) {
                        return cb(null, user);
                    } else {
                        return User.getUser(id, function (err, user) {
                            return cb(err, user);
                        });
                    }
                }
            ], function (error, result) {
                return done(error, result);
            });
        };

        User.authenticatedOrNot = function (req, res, next) {
            if (req.isAuthenticated()) {
                return next();
            } else {
                return res.redirect("/login");
            }
        };

        User.userExist = function (req, res, next) {
            return this.dbProvider.Users.count({
                username: req.body.username
            }, function (err, count) {
                if (count === 0) {
                    return next();
                } else {
                    return res.redirect("/singup");
                }
            });
        };

        return User;

    })();

    exports.User = User;

}).call(this);

//# sourceMappingURL=user.map
