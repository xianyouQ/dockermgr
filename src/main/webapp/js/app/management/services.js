app.controller('ManageMentServicesCtrl', ['$scope', '$http', '$filter','$modal','$q','$interval','myCache',function($scope, $http, $filter,$modal,$q,$interval,myCache) {
  function isObjectValueEqual(a, b) {
   if(a.id === b.id){
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
  
  $scope.mainbuses = [] ;
  $scope.services = new Map();
  $scope.roles = [] ;
  $scope.idcs = [];
  $scope.filter = new Map();
  $scope.count = [];
  $scope.RoleUsers = [];
  $scope.padderSelect='conf';
 //$scope.$watch('services',null,true);

    $http.get('/api/baserole').then(function (resp) {
      if (resp.data.status ){
        angular.forEach(resp.data.data,function(role){
          if(role.crossService == true) {
            $scope.roles.push(role);
          }
        });
      }
      else {
        toaster.pop("error","get auth error",resp.data.info);
      } 
  });

  $scope.initData = function(){
    var serviceCount = myCache.getCount();
    console.log(serviceCount);
    if(serviceCount == null){
      return;
    }
    for(var i = 0 ;i < serviceCount ; i++)
    {
      $scope.count.push(i);
      $scope.filter[i]="";
    }
    var tmpservices = myCache.getServices();
    if(tmpservices == null){
      return;
    }
    angular.forEach(tmpservices,function(service){
      var codeSplit = service.code.split("-")
      if(codeSplit.length != serviceCount){
        console.log("invaild service:",service)
        return true
      }
      var tempService = {code:""};
      angular.forEach(codeSplit,function(item,index){        
        if($scope.services[index] == undefined) {
          $scope.services[index] = [];
        }
        if(tempService.code == "") {
          tempService.code = item
        } else {
          tempService.code = tempService.code + "-" + item
        }

        if(!$scope.services[index].contains(tempService) && index < $scope.count.length - 1) {        
          var newService = {code:""};
          newService.code = tempService.code;
          $scope.services[index].push(newService)
        }
      });
    });
    $scope.services[$scope.count.length - 1] = tmpservices;
    $scope.idcs = myCache.getIdcs();
    if($scope.idcs == null){
      return;
    }
  }
  var timer = function(){
    return $q(function(resolve,reject){
      myCache.fresh();
      var count = 0;
      var wait = $interval(function() {
        if(myCache.dataOk() == true){
          resolve();
          $interval.cancel(wait);
        }
        else {
          count = count + 1;
          if (count > 5){
            reject("timeout");
            $interval.cancel(wait);
          }
        }
      },200);
    })
  }
  timer().then(function(){
     $scope.initData();
  },function(){
  });
  $scope.isShow = function(idx) {
    if (idx < 0 ){
      return false;
    }
    if(idx == 0 && ($scope.filter[idx] == undefined||$scope.filter[idx].length == 0)) {
      return true
    } else if (idx > 0 && $scope.filter[idx] == undefined) {
      return false
    }
    else if ($scope.filter[idx].length == 0 && $scope.filter[idx-1].length > 0) {
      return true
    } 
    return false
  };


  $scope.ConfShow = function() {
    if($scope.selectedService == undefined){
      return false;
    }
    var codeSplit = $scope.selectedService.code.split("-")
    if(codeSplit.length == $scope.count.length){
      return true
    }
    return false
  }
  $scope.selectService = function(item,idx){
    if (idx == $scope.count.length - 1) {
      $scope.selectedService = item;
      console.log(item);
      console.log($scope.services);
      $http.get("/api/roleuser/"+$scope.selectedService.id).then(function(resp){
        $scope.RoleUsers = resp.data.data;
        angular.forEach($scope.RoleUsers,function(roleUser,index){
            angular.forEach($scope.roles,function(innerRole,index){
                if( innerRole.id == roleUser.baseRoleId) {
                    roleUser.baseRole = innerRole;
                }
            });
        });
      });
      return
    } 
    angular.forEach($scope.services, function(item) {
      item.selected = false;
    });
    $scope.selectedService = item;
    $scope.selectedService.selected = true;
    var serviceSplit = $scope.selectedService.code.split("-")
    $scope.filter[idx] = serviceSplit[idx];
  };

  $scope.returnUpper = function(idx) {
    $scope.filter[idx-1] = "";
  }
  $scope.commitService = function() {
     $http.post('/api/service',$scope.selectedService).then(function(response) {
          if (response.data.status){
            $scope.selectedService = response.data.data
          }
          if  (!response.data.status ) {
            $scope.formError = response.data.info;
          }
        }, function(x) {
        console.log('Server Error')
      });
  };
  $scope.createService = function() {
        var modalInstance = $modal.open({
        templateUrl: 'addServiceModalContent.html',
        controller: 'addServiceModalInstanceCtrl',
        size: 'lg',
        resolve: {
          count: function () {
            return $scope.count;
          }
        }
      });
      modalInstance.result.then(function (newService) {
        //$scope.selectedService = newService;
         var codeSplit = newService.code.split("-")
         var tempService = {code:""};
        angular.forEach(codeSplit,function(item,index){
              if($scope.services[index] == undefined) {
                $scope.services[index] = [];
              }
              if(tempService.code == "") {
                tempService.code = item;
              } else {
                tempService.code = tempService.code + "-" + item
              }
              if(!$scope.services[index].contains(tempService) && index < $scope.count.length - 1) {
                var newTempService = {code:""};
                newTempService.code = tempService.code;
                $scope.services[index].push(newTempService)
              }
            });
             $scope.services[$scope.count.length - 1].push(newService);
      }, function () {
        //log error
      });
  }
  $scope.deleteService = function(item) {
      var modalInstance = $modal.open({
        templateUrl: 'delConfirmModalContent.html',
        controller: 'delConfirmModalInstanceCtrl',
        size: 'lg',
        resolve: {
          selectedService: function () {
            return item;
          }
        }
      });
       modalInstance.result.then(function (delService) {
      $scope.services[$scope.count.length -1].remove(delService);
       }, function () {
        //log error
      });
  }

  $scope.addUser = function() {
      var modalInstance = $modal.open({
        templateUrl: 'addAuthModalContent.html',
        controller: 'addAuthModalInstanceCtrl',
        size: 'lg',
        resolve: {
          roles: function () {
            return $scope.roles;
          },
          service: function() {
            return $scope.selectedService;
          },
          othsusers: function() {
            return $scope.Users;
          }
        }
      });
       modalInstance.result.then(function (Users) {
         $scope.Users.push(Users);
       }, function () {
        //log error
      });
  };
  $scope.delUserAuth = function(delUser,baseRole) {
      var modalInstance = $modal.open({
        templateUrl: 'delUserAuthConfirmModalContent.html',
        controller: 'delUserAuthConfirmModalInstanceCtrl',
        size: 'lg',
        resolve: {
          delUser: function () {
            return delUser;
          },
          serviceAuth: function(){
            return serviceAuth;
          },
          service: function(){
            return $scope.selectedService;
          }
        }
      });
       modalInstance.result.then(function (delUser) {
      $scope.Users.remove(delUser);
       }, function () {
        //log error
      });
  };
}]);
  app.controller('addServiceModalInstanceCtrl', ['$scope', '$modalInstance','$http','count',function($scope, $modalInstance,$http,$count) {
   
    $scope.newService = {"name":"","code":"","id":0};
    $scope.formError = null;
    $scope.ok = function () {
      $scope.formError = null;
      if ($scope.newService.name == "" || $scope.newService.code == ""){
        return
      }
      var codeSplit = $scope.newService.code.split("-")
      if (codeSplit.length != $count.length) {
        $scope.formError = "invaild Service code";
        return
      } 
     $http.post('/api/service',$scope.newService).then(function(response) {
          if (response.data.status){
            $scope.newService = response.data.data
            $modalInstance.close($scope.newService);
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

  app.controller('delUserAuthConfirmModalInstanceCtrl', ['$scope', '$modalInstance','$http','delUser','serviceAuth',function($scope, $modalInstance,$http,$delUser,$baseRole,$service) {
   
    $scope.formError = null;
    $scope.confirm="delete User's auth?";
    $scope.ok = function () {
      $scope.formError = null;
     $http.delete('/api/roleuser',{users:[$delUser],service:$service,baseRole:$baseRole}).then(function(response) {
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


  app.controller('delConfirmModalInstanceCtrl', ['$scope', '$modalInstance','$http','selectedService',function($scope, $modalInstance,$http,$selectedService) {
   
    $scope.formError = null;
    $scope.confirm="delete service?";
    $scope.ok = function () {
      $scope.formError = null;
     $http.delete('/api/service/' + $selectedService.id).then(function(response) {
          if (response.data.status){
            $modalInstance.close($selectedService);
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

    app.controller('addAuthModalInstanceCtrl', ['$scope', '$modalInstance','$http','roles','service','othsusers',function($scope, $modalInstance,$http,$roles,$service,$othsusers) {
    $scope.formError = null;
    $scope.Users = [];
    $scope.roles = $roles;
    $scope.selected = {
      Users:[],
      Role: {}
    };
    $http.get("/api/user").then(function(resp){
        if(resp.data.status) {
          angular.forEach(resp.data.data,function(item){
            var isSkip = false;
            angular.forEach($othsusers,function(inner){
              if (item.id == inner.user.id) {
                isSkip = true;
                return;
              }
            });
            if (isSkip == false) {
              $scope.Users.push(item);
            }
          })
        } 
        else {
          $scope.formError = resp.data.info;
        }
      });
    $scope.ok = function () {
      $scope.formError = null;
      $http.post('/api/roleuser',{users:$scope.selected.Users,service:$service,baseRole:$scope.selected.Role}).then(function(response) {
          if (response.data.status){
            $modalInstance.close($scope.selected.Users);
          }
          if  (!response.data.status ) {
            $scope.formError = response.data.info;
          }
        }, function(x) {
        console.log('Server Error')
      });
    };

    $scope.cancel = function () {
      console.log($scope.selected);
      console.log($scope.roles);
      $modalInstance.dismiss('cancel');
    };
  }]); 