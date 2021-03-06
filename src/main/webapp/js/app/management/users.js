app.controller('ManageMentUsersCtrl', ['$scope', '$http', '$filter','$modal',function($scope, $http, $filter,$modal) { 
  function isObjectValueEqual(a, b) {
   if(a.Id === b.Id){
     return true;
   } 
   else {
     return false;
   }
}

  Array.prototype.contains = function(obj) {
    var i = this.length;
    while (i--) {
        if (isObjectValueEqual(this[i],obj)) {
            return true;
        }
    }
    return false;
 }

 Array.prototype.remove=function(obj){ 
  for(var i =0;i <this.length;i++){ 
    var temp = this[i]; 
    if(!isNaN(obj)){ 
      temp=i; 
    } 
    if(isObjectValueEqual(temp,obj)){ 
      for(var j = i;j <this.length;j++){ 
        this[j]=this[j+1]; 
        } 
      this.length = this.length-1; 
      } 
  } 
  }

  $scope.users = [];
  $scope.roles = [];
  $scope.userFilter = "";
  $scope.selectedUser = undefined;
  $http.get("/api/user").then(function(resp){
    if (resp.data.status )
    {
      $scope.users = resp.data.data;
    }
    else {
        toaster.pop("error","get user error",resp.data.info);
    }
  });
    $http.get('/api/baserole').then(function (resp) {
      if (resp.data.status ){
        $scope.roles = resp.data.data;
      }
      else {
        toaster.pop("error","get auth error",resp.data.info);
      } 
  });
  $scope.addUser = function() {
      var modalInstance = $modal.open({
        templateUrl: 'addUserModalContent.html',
        controller: 'addUserModalInstanceCtrl',
        size: 'lg'
      });
 
      modalInstance.result.then(function (newUser) {
        $scope.users.push(newUser);
      }, function () {
        //log error
      });
  };
  $scope.selectUser = function(item) {
    $scope.selectedUser = item;
  };
  $scope.isSystem = function() {
    var result = false;
    if ($scope.selectedUser == undefined) {
      return false;
    }
    angular.forEach($scope.selectedUser.ServiceAuths,function(item){
      if (item.Name == "SYSTEM") {
        result = true;
        return;
      }
    });
    return result;
  };
  $scope.commitSystem = function($event) {
    var checkbox = $event.target;  
    var checked = checkbox.checked;
    var systemRole = undefined;
    if(checked != $scope.isSystem() && checked == true) {
      angular.forEach($scope.roles,function(item){
        if(item.Name == "SYSTEM"){
          systemRole = item;
        }
      });
      var selectedUsers =[];
      selectedUsers.push($scope.selectedUser);
      $http.post("/api/auth/new",{Users:selectedUsers,Role:systemRole}).then(function(resp){
        if(resp.data.status) {
          console.log("success")
        }
        else {
          $scope.formError = resp.data.info
        }
      });     
    }
      
  };
  $scope.commitPassWdReset = function($event){
    var checkbox = $event.target;  
    var checked = checkbox.checked;
    if(checked == true) {
      $http.get("/api/user/"+$scope.selectedUser.id + "/reset").then(function(resp){
        if(resp.data.status) {
          console.log("success")
          $scope.selectedUser.resetdisabled = true;
        }
        else {
          $scope.formError = resp.data.info
        }
      });
    }
  };
  $scope.deleteUser = function(delUser) {
      var modalInstance = $modal.open({
        templateUrl: 'delUserConfirmModalContent.html',
        controller: 'delUserConfirmModalInstanceCtrl',
        size: 'lg',
        resolve: {
          delUser: function () {
            return delUser;
          }
        }
      });
       modalInstance.result.then(function (delUser) {
        $scope.users.remove(delUser);
       }, function () {
        //log error
      });
  }
}]);

  app.controller('addUserModalInstanceCtrl', ['$scope', '$modalInstance','$http',function($scope, $modalInstance,$http) {
    $scope.newUser={};
    $scope.ok = function () {
      if ($scope.newUser.Username == ""){
        
      }
      else {
        $http.post('api/user',$scope.newUser).then(function(resp){
          if ( !resp.data.status ) {
            $scope.formError = resp.data.info;
          }else{
            $modalInstance.close(resp.data.data);
          }
        }, function(x) {
          $scope.formError = 'Server Error';
        });
      }
    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
  }])
  ; 

    app.controller('delUserConfirmModalInstanceCtrl', ['$scope', '$modalInstance','$http','delUser',function($scope, $modalInstance,$http,$delUser) {
   
    $scope.formError = null;
    $scope.confirm="delete user?";
    $scope.ok = function () {
      $scope.formError = null;
     $http.delete('/api/auth/user?Id='+$delUser.Id).then(function(response) {
          if (response.data.status){
            $modalInstance.close($delUser);
          }
          if  (!response.data.status ) {
            $scope.formError = response.data.info;
          }
        }, function(x) {
        console.log('Server Error')
      });
    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
  }]); 
