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

    var controllerId = 'userSectorRatingListController';
    angular.module('main')
        .controller(controllerId, ['userSectorRatingService', 'logger', userSectorRatingListController]);

    function userSectorRatingListController(userSectorRatingService, logger) {

        logger = logger.forSource(controllerId);
        var logError = logger.logError;
        var logSuccess = logger.logSuccess;

        var vm = this;
        vm.deleteUserSectorRating = deleteUserSectorRating;
        vm.userSectorRatingSet = [];

        initialize();

        function initialize() {
            getUserSectorRatingSet();
        };

        function deleteUserSectorRating(userSectorRating) {
            userSectorRatingService.deleteUserSectorRating(userSectorRating);

            userSectorRatingService.saveChanges()
                .then(function () {
                    vm.userSectorRatingSet.splice(vm.userSectorRatingSet.indexOf(userSectorRating), 1);
                    logSuccess("Hooray we saved", null, true);
                })
                .catch(function (error) {
                    logError("Boooo, we failed: " + error.message, null, true);
                    // Todo: more sophisticated recovery. 
                    // Here we just blew it all away and start over
                    // refresh();
                })
        };

        function getUserSectorRatingSet() {
            userSectorRatingService.getUserSectorRatingSet().then(function (data) {
                vm.userSectorRatingSet = data;
            });
        }
    };
})();
