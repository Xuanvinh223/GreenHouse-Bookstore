const app = angular.module("myApp", ["ngRoute"]);
    
app.config(function($routeProvider, $locationProvider) {
  $routeProvider
    .when("/index.html", {
      templateUrl: "page/home.html",
    })
    .when("/lienhe", {
      templateUrl: "page/contact.html",
    })
    .when("/taikhoan", {
      templateUrl: "page/account.html",
      controller: "accountController"
    })
    .when("/flash-sale", {
      templateUrl: "page/flash-sale.html",
    })
    .when("/giohang", {
      templateUrl: "page/cart.html",
    })
    .when("/thanhtoan", {
      templateUrl: "page/checkout.html",
    })
    .when("/tttc", {
      templateUrl: "page/order-complete.html",
    })
    .when("/voucher", {
      templateUrl: "page/voucher.html",
    })
    .when("/sanpham", {
      templateUrl: "page/shop-grid-left-sidebar.html",
    })
    .when("/sanphamchitiet", {
      templateUrl: "page/product-details-variable.html",
    })
    .otherwise({
      redirectTo: "/index.html"
    });
});

app.run(function ($rootScope, $http, $templateCache) {
    var jsFiles = ['js/custom.js', 'js/code.js']; // Danh sách các tệp JavaScript
  
    function loadAndAppendScript(jsFile) {
      return $http.get(jsFile)
        .then(function (response) {
          $templateCache.put(jsFile, response.data);
          var scriptElement = document.createElement('script');
          scriptElement.innerHTML = $templateCache.get(jsFile);
          document.body.appendChild(scriptElement);
          return Promise.resolve();
        });
    }
  
    $rootScope.$on('$viewContentLoaded', function () {
      Promise.all(jsFiles.map(loadAndAppendScript));
    });
  });
  
