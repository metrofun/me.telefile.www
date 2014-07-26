var Rx = require('rx'),
    FileTransmitter = require('./FileTransmitter.js'),
    FileReceiver = require('./FileReceiver.js');

angular.module('app', [])
    .controller('KeyFormCtrl', ['$scope', '$timeout', function ($scope, $timeout) {
        var subject = new Rx.Subject();

        subject.filter(Boolean).distinctUntilChanged().subscribe(function (pin) {
            var fileReceiver = new FileReceiver(pin);

            fileReceiver.getProgress().subscribe(function (data) {
                console.log(data);
            });
        });

        $scope.keydown = function (e) {
            if (e.keyCode === 27) {
                $scope.cancel();
            } else {
                $timeout(function () {
                    subject.onNext($scope.pin);
                });
            }
        };
        $scope.cancel = function () {
            $scope.pin = '';
            $scope.showInput = false;
            $scope.KeyForm.$setPristine();
        };
    }])
    .controller('SendCtrl', ['$scope', '$element', function ($scope, $element) {
        $element.find('input').bind('change', function (e) {
            var file = e.target.files[0],
                fileTransmitter = new FileTransmitter(file);

            fileTransmitter.send();
        });
    }])
    .directive('tfAutofocus', [function () {
        return function (scope, element) {
            scope.$watch(function () {
                return element.hasClass('ng-hide');
            }, function (isHidden) {
                if (!isHidden) {
                    element[0].focus();
                }
            });
        };
    }]);
