//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

(function () {
    'use strict';

    var controllerId = 'userLoginListController';
    angular.module('main')
        .controller(controllerId, ['userLoginFactory',
            'logger',
			userLoginListController]);

    function userLoginListController(userLoginFactory,
        logger) {
        logger = logger.forSource(controllerId);

        var vm = {};
        vm.deleteUserLogin = deleteUserLogin;
        vm.userLoginSet = [];

        initialize();

        function initialize() {
            getUserLoginSet();
        }

        function deleteUserLogin(userLogin) {
            userLoginFactory.deleteUserLogin(userLogin);

            userLoginFactory.saveChanges()
                .then(function () {
                    vm.userLoginSet.splice(vm.userLoginSet.indexOf(userLogin), 1);
                    logger.logSuccess("Hooray we saved", null, true);
                })
                .catch(function (error) {
                    logger.logError("Boooo, we failed: " + error.message, null, true);
                    // Todo: more sophisticated recovery. 
                    // Here we just blew it all away and start over
                    // refresh();
                });
        }

        function getUserLoginSet() {
            userLoginFactory.getUserLoginSet(false)
			    .then(function (data) {
                    vm.userLoginSet = data;
                });
        }
    }
})();
