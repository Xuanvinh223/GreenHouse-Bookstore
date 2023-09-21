app.controller('brandController', brandController);

function brandController($scope, $http) {
    $scope.brand = [];
    $scope.newBrand = {};
    $scope.editingBrand = null;
    $scope.isEditing = false;

    // Hàm để lấy danh sách thuongw hieu
    $scope.getBrand = function () {
        $http
            .get("/api/brand")
            .then(function (response) {
                $scope.brand = response.data;
            })
            .catch(function (error) {
                console.error("Lỗi khi lấy danh sách thương hiệu:", error);
            });
    };

    // Hàm để sao chép thông tin thuong hieu vào biến editingBrand và bật chế độ chỉnh sửa
    $scope.editBrand = function (brand) {
        $scope.editingBrand = angular.copy(brand);
        $scope.isEditing = true;
    };

    // Hàm để lưu thuongw hieu (thêm mới hoặc cập nhật)
    $scope.saveBrand = function () {
        if ($scope.editingBrand) {
            // Nếu đang chỉnh sửa, gọi hàm cập nhật thương hiệu ở đây
            $http
                .put("/api/brand/" + $scope.editingBrand.brandId, $scope.editingBrand)
                .then(function () {
                    // Sau khi cập nhật thành công, làm mới danh sách thương hiệu và đặt lại form
                    $scope.getBrand();
                    $scope.resetForm();
                })
                .catch(function (error) {
                    console.error("Lỗi khi cập nhật thương hiệu:", error);
                });
        } else {
            // Nếu thêm mới, gọi hàm thêm tác giả mới ở đây
            $http
                .post("/api/brand", $scope.newBrand)
                .then(function () {
                    // Sau khi thêm thành công, làm mới danh sách tác giả và đặt lại form
                    $scope.getBrand();
                    $scope.resetForm();
                })
                .catch(function (error) {
                    console.error("Lỗi khi thêm thương hiệu:", error);
                });
        }
    };

    // Hàm để hủy bỏ chế độ chỉnh sửa và đặt lại form
    $scope.cancelEdit = function () {
        $scope.isEditing = false;
        $scope.editingBrand = null;
    };

    // Hàm để đặt lại form
    $scope.resetForm = function () {
        $scope.isEditing = false;
        $scope.editingBrand = null;
        $scope.newBrand = {};
    };

    $scope.getBrand();
}
