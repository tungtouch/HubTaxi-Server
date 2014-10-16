/**
 * Directly from fnakstad
 * https://github.com/fnakstad/angular-client-side-auth/blob/master/client/js/routingConfig.js
 */

(function (exports) {

    var config = {

        /* List all the roles you wish to use in the app
         * You have a max of 31 before the bit shift pushes the accompanying integer out of
         * the memory footprint for an integer
         */
        roles: [
            'anon', //1
            'user',  // 2
            'taxi',
            'manager',
            'admin',
            'root'
        ],

        /*
         Build out all the access levels you want referencing the roles listed above
         You can use the "*" symbol to represent access to all roles
         */
        accessLevels: {
            'anon': ['anon'],
            'user': ['user'],
            'taxi': ['taxi'],
            'manager': ['manager'],
            'admin': ['admin'],
            'root': ['root']
        }

    };

    /*
     Method to build a distinct bit mask for each role
     It starts off with "1" and shifts the bit to the left for each element in the
     roles array parameter
     */
    function buildRoles(roles) {

        var bitMask = "01";
        var userRoles = {};

        for (var role in roles) {
            var intCode = parseInt(bitMask, 2); //
            userRoles[roles[role]] = {
                bitMask: intCode,
                title: roles[role]
            };
            bitMask = (intCode << 1).toString(2);
        }

        return userRoles;
    }

    /*
     This method builds access level bit masks based on the accessLevelDeclaration parameter which must
     contain an array for each access level containing the allowed user roles.
     */
    function buildAccessLevels(accessLevelDeclarations, userRoles) {

        var accessLevels = {},
            resultBitMask,
            role;
        for (var level in accessLevelDeclarations) {

            if (typeof accessLevelDeclarations[level] === 'string') {
                if (accessLevelDeclarations[level] === '*') {

                    resultBitMask = '';

                    for (role in userRoles) {
                        resultBitMask += "1";
                    }
                    //accessLevels[level] = parseInt(resultBitMask, 2);
                    accessLevels[level] = {
                        bitMask: parseInt(resultBitMask, 2),
                        title: accessLevelDeclarations[level]
                    };
                }
                else {
                    console.log("Access Control Error: Could not parse '" + accessLevelDeclarations[level] + "' as access definition for level '" + level + "'");
                }
            }
            else {

                resultBitMask = 0;
                for (role in accessLevelDeclarations[level]) {
                    if (userRoles.hasOwnProperty(accessLevelDeclarations[level][role])) {
                        resultBitMask = resultBitMask | userRoles[accessLevelDeclarations[level][role]].bitMask;
                    }
                    else {
                        console.log("Access Control Error: Could not find role '" + accessLevelDeclarations[level][role] + "' in registered roles while building access for '" + level + "'");
                    }
                }
                accessLevels[level] = {
                    bitMask: resultBitMask,
                    title: accessLevelDeclarations[level][role]
                };
            }
        }

        return accessLevels;
    }


    exports.userRoles = buildRoles(config.roles);
    exports.accessLevels = buildAccessLevels(config.accessLevels, exports.userRoles);

    exports.userCan =
    {
        read: {
            Users: exports.accessLevels.anon,
            Drivers: exports.accessLevels.anon,
            Likes: exports.accessLevels.anon,
            Messages: exports.accessLevels.anon,
            TaxiCompany: exports.accessLevels.anon,
            RouteHistories: exports.accessLevels.anon,
            Bookmarks: exports.accessLevels.anon,
            DriverTypes: exports.accessLevels.anon,
            Managers: exports.accessLevels.anon,
            MyTaxi: exports.accessLevels.anon,
            MessageRelation: exports.accessLevels.anon,
            Reports: exports.accessLevels.anon

        },
        readOne: {
            Users: exports.accessLevels.user,
            Drivers: exports.accessLevels.anon,
            Likes: exports.accessLevels.anon,
            Messages: exports.accessLevels.anon,
            TaxiCompany: exports.accessLevels.anon,
            RouteHistories: exports.accessLevels.anon,
            Bookmarks: exports.accessLevels.anon,
            DriverTypes: exports.accessLevels.anon,
            Managers: exports.accessLevels.anon,
            MyTaxi: exports.accessLevels.anon,
            MessageRelation: exports.accessLevels.anon,
            Reports: exports.accessLevels.anon

        },
        create: {
            Users: exports.accessLevels.manager,
            Drivers: exports.accessLevels.anon,
            Likes: exports.accessLevels.anon,
            Messages: exports.accessLevels.anon,
            TaxiCompany: exports.accessLevels.anon,
            RouteHistories: exports.accessLevels.anon,
            Bookmarks: exports.accessLevels.anon,
            DriverTypes: exports.accessLevels.anon,
            Managers: exports.accessLevels.anon,
            MyTaxi: exports.accessLevels.anon,
            MessageRelation: exports.accessLevels.anon,
            Reports: exports.accessLevels.anon
        },
        update: {
            Users: exports.accessLevels.anon,
            Drivers: exports.accessLevels.manager,
            Likes: exports.accessLevels.manager,
            Messages: exports.accessLevels.manager,
            TaxiCompany: exports.accessLevels.manager,
            RouteHistories: exports.accessLevels.anon,
            Bookmarks: exports.accessLevels.anon,
            DriverTypes: exports.accessLevels.anon,
            Managers: exports.accessLevels.anon,
            MyTaxi: exports.accessLevels.anon,
            MessageRelation: exports.accessLevels.anon,
            Reports: exports.accessLevels.anon
        },
        delete: {
            Users: exports.accessLevels.manager,
            Drivers: exports.accessLevels.manager,
            Likes: exports.accessLevels.manager,
            Messages: exports.accessLevels.manager,
            TaxiCompany: exports.accessLevels.manager,
            RouteHistories: exports.accessLevels.manager,
            Bookmarks: exports.accessLevels.anon,
            DriverTypes: exports.accessLevels.anon,
            Managers: exports.accessLevels.anon,
            MyTaxi: exports.accessLevels.anon,
            MessageRelation: exports.accessLevels.anon,
            Reports: exports.accessLevels.anon
        },
        deleteAll: {
            Users: exports.accessLevels.root,
            Drivers: exports.accessLevels.root,
            Likes: exports.accessLevels.root,
            Messages: exports.accessLevels.root,
            TaxiCompany: exports.accessLevels.root,
            RouteHistories: exports.accessLevels.root,
            Bookmarks: exports.accessLevels.root,
            Managers: exports.accessLevels.root,
            MyTaxi: exports.accessLevels.root,
            MessageRelation: exports.accessLevels.root,
            Reports: exports.accessLevels.root
        }
    };

})(typeof exports === 'undefined' ? this : exports);


