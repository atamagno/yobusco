'use strict';

// Messages controller
angular.module('messages').controller('MessagesController',
	function($scope, $rootScope, $state, $stateParams, Authentication, Messages, MessageSearch, ServiceSuppliers, $uibModal, Alerts, UserSearch) {
		$scope.authentication = Authentication;
		$scope.alerts = Alerts;

		$scope.itemsPerPage = 6;
		$scope.maxPages = 5;
		$scope.showList = false;

		if (!$scope.authentication.user) $state.go('home');

		$scope.initCreateScreen = function() {

			$scope.isServiceSupplier = $scope.authentication.user.roles.indexOf('servicesupplier') != -1;
			if (!$scope.isServiceSupplier) {
				$scope.selectedServiceSupplier = undefined;
				ServiceSuppliers.query().$promise.then(function(servicesuppliers) {
					$scope.servicesuppliers = servicesuppliers;
				});
			}
		};

		$scope.openCreateMessageModal = function () {

			var modalInstance = $uibModal.open({
				templateUrl: 'createMessageModal',
				controller: 'CreateMessageModalInstanceCtrl'
			});

			modalInstance.result.then(function () {
				if ($scope.addToConversation) {
					$scope.addMessage();
				} else {
					$scope.create();
				}
			});
		};

		// Create new Message
		$scope.create = function() {

			if (!$scope.content) {
				Alerts.show('danger','El mensaje no puede estar vacio.');
				return;
			}

			if ($scope.isServiceSupplier) {
				if ($scope.selectedUserName) {
					UserSearch.get({
						userName: $scope.selectedUserName
					}).$promise.then(function (user) {
							if (user._id) {

								saveMessage(user._id);
							}
							else {
								Alerts.show('danger','El nombre de usuario no existe.');
							}
						});
				}
				else
				{
					Alerts.show('danger','Debes ingresar un nombre de usuario.');
				}
			}
			else {

				if (($scope.selectedServiceSupplier && $scope.selectedServiceSupplier._id) || ($scope.userId != '')) {

					saveMessage($scope.selectedServiceSupplier.user._id);

				} else {
					Alerts.show('danger','Debes seleccionar un destinatario');
				}
			}
		};

		function saveMessage(userId) {

			// Create new Message object
			var message = new Messages ({
				content: $scope.content,
				from: $scope.authentication.user._id,
				to: userId
			});

			// Redirect after save
			message.$save(function(response) {
				Alerts.show('success','Mensaje enviado exitosamente');

				$state.go('messages.list', {
					condition: 'sent',
					currentPage: 1,
					itemsPerPage: $scope.itemsPerPage
				});
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
				Alerts.show('danger', $scope.error);
			});
		};

		// Add a message to an existing conversation
		$scope.addMessage = function() {

			if (!$scope.content) {
				Alerts.show('danger','El mensaje no puede estar vacio.');
				return;
			}

			var toUser = $scope.conversation.user1._id != $scope.authentication.user._id ?
						 $scope.conversation.user1._id : $scope.conversation.user2._id;

			// Create new Message object
			var message = new Messages ({
				conversationId: $scope.conversation._id,
				content: this.content,
				from: $scope.authentication.user._id,
				to: toUser
			});

			message.$save(function(response) {
				$scope.content = '',
				//$scope.conversation.messages.push(message);
				$scope.conversation = response;
				Alerts.show('success','Mensaje enviado exitosamente');
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
				Alerts.show('danger', $scope.error);
			});
		};

		// Find a list of Messages
		$scope.find = function() {

			$scope.showList = false;
			$scope.currentPage = $stateParams.currentPage;

			$scope.messagesCondition = $stateParams.condition;
			$scope.messageListTitle = 'Todos los mensajes';
			$scope.messageConditionLabel = '.';
			switch ($scope.messagesCondition) {
				case 'archived':
					$scope.messageListTitle = 'Mensajes archivados';
					$scope.messageConditionLabel = ' archivado.';
					break;
				case 'received':
					$scope.messageListTitle = 'Bandeja de entrada';
					$scope.messageConditionLabel = '.';
					break;
			}

			MessageSearch.messagesByUser.query({
				currentPage: $stateParams.currentPage,
				itemsPerPage: $scope.itemsPerPage,
				userId: $scope.authentication.user._id,
				condition: $scope.messagesCondition
			}).$promise.then(function (response) {
					$scope.currentPage = $stateParams.currentPage;
					$scope.totalItems = response.totalItems;
					$scope.conversations = response.conversations;
					markUnread();
					$scope.showList = $scope.totalItems > 0;
			});
		};

		function markUnread() {

			$scope.conversations.forEach(function(conversation) {
				var unreadMessages = conversation.messages.filter(filterUnread)
				conversation.unread = unreadMessages.length;
			});
		};

		function filterUnread(message) {
			return (($scope.authentication.user._id == message.to) && !message.read);
		};

		$scope.navigateToResults = function() {
			$state.go('messages.list', {
				condition: $scope.messagesCondition,
				currentPage: $scope.currentPage,
				itemsPerPage: $scope.itemsPerPage
			});
		};

		// Find existing Message
		$scope.findOne = function() {
			$scope.addToConversation = true;

			Messages.get({
				conversationId: $stateParams.conversationId
			}).$promise.then(function(conversation) {
				$scope.conversation = conversation;

				$scope.toUser = conversation.user1._id != $scope.authentication.user._id ?
								conversation.user1 : conversation.user2;

				$scope.archived = ($scope.authentication.user._id == conversation.user1Archived) ||
									($scope.authentication.user._id == conversation.user2Archived);

				MessageSearch.unreadMessages.query({
					userId: $scope.authentication.user._id
				}).$promise.then(function (response) {
					$rootScope.$broadcast('updateUnread', response.unreadCount);
				});
			});
		};

		$scope.openArchiveConversationModal = function () {

			var modalInstance = $uibModal.open({
				templateUrl: 'archiveConversationModal',
				controller: 'ArchiveConversationModalInstanceCtrl'
			});

			modalInstance.result.then(function () {
				$scope.archiveConversation();
			});
		};

		$scope.archiveConversation = function() {

			if ($scope.authentication.user._id == $scope.conversation.user1._id) {
				$scope.conversation.user1Archived = $scope.authentication.user._id;
			} else {
				$scope.conversation.user2Archived = $scope.authentication.user._id;
			}

			$scope.conversation.$update(function() {
				Alerts.show('success','Conversacion archivada exitosamente');
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
				Alerts.show('danger',$scope.error);
			});
		}
	});

angular.module('messages').controller('CreateMessageModalInstanceCtrl',
	function ($scope, $uibModalInstance) {

		$scope.ok = function () {
			$uibModalInstance.close();
		};

		$scope.cancel = function () {
			$uibModalInstance.dismiss('cancel');
		};
	});

angular.module('messages').controller('ArchiveConversationModalInstanceCtrl',
	function ($scope, $uibModalInstance) {

		$scope.ok = function () {
			$uibModalInstance.close();
		};

		$scope.cancel = function () {
			$uibModalInstance.dismiss('cancel');
		};
	});