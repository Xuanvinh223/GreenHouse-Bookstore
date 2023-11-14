app.controller("cartController", cartController);

function cartController($http, $scope, cartAPI, CartService, $filter) {
    const username = localStorage.getItem("username");
    const tokenGHN = '7a77199f-6293-11ee-af43-6ead57e9219a';
    const shopIdGHN = 4586990;
    const provinceCodeGH = 220;
    const districtCodeGH = 1574;
    const wardCodeGH = 550307;

    $scope.listCartItem = [];
    $scope.listCartItemSelected = [];

    $scope.listVouchersOriginal = [];
    $scope.listVouchersMappingCategories = [];
    $scope.listVouchersMappingProducts = [];
    $scope.eligibleVouchers = [];
    $scope.relatedVouchers = [];

    $scope.listNormalVouchers = [];
    $scope.listShippingVouchers = [];
    $scope.listPaymentVouchers = [];

    $scope.numViewNormalVouchers = 2;
    $scope.numViewShippingVouchers = 2;
    $scope.numViewPaymentVouchers = 2;

    $scope.voucherApplied = {
        normalVoucherApplied: null,
        shippingVoucherApplied: null,
        paymentVoucherApplied: null
    }

    $scope.listProductCategory = [];

    $scope.listProvince = [];
    $scope.listDistrict = [];
    $scope.listWard = [];

    $scope.address = {};
    $scope.errors = {};
    $scope.selectedAddress = null;
    $scope.confirmAddress = null;

    $scope.checkAll = false;
    $scope.isEdit = false;

    // GHN - START

    $scope.provinceGHN = [];
    $scope.districtGHN = [];
    $scope.wardGHN = [];

    $scope.toDistrict = {};
    $scope.toWard = {};

    $scope.shippingFee = 0;
    $scope.availableServicesGHN = [];
    // GHN - END

    $scope.totalBillAmount = 0;
    $scope.totalBillDiscountAmount = 0;

    function getCart() {
        CartService.getCart(username)
            .then(function (response) {
                console.log("Danh sách giỏ hàng: ", response);
                $scope.listCartItem = response.listCart;
            })
            .catch(function (error) {
                console.log('error', 'Lỗi trong quá trình gửi dữ liệu lên server: ' + error);
            });
    }

    function getProductCategory() {
        var url = `${cartAPI}/getProductCategory`;
        $http.get(url)
            .then(function (response) {
                $scope.listProductCategory = response.data.listProductCategory;
                console.log("Danh sách sản phẩm đã phân loại: ", $scope.listProductCategory);
            })
            .catch(function (error) {
                console.error('Lỗi kết nối đến API: ' + error);
            });
    }


    function getVoucherByUsername(username) {
        var url = `${cartAPI}/getVoucher?username=${username}`;
        $http.get(url)
            .then(function (response) {
                if (response.data.listVouchers) {
                    angular.forEach(response.data.listVouchers, function (voucher) {
                        voucher.moreAmount = voucher.minimumPurchaseAmount;
                        voucher.moreAmountPercents = 0;
                        $scope.listVouchersOriginal.push(voucher);
                    })
                }
                $scope.listVouchersMappingCategories = response.data.listVouchersMappingCategories;
                $scope.listVouchersMappingProducts = response.data.listVouchersMappingProducts;

                angular.forEach($scope.listVouchersOriginal, v => {
                    if (voucherIsEligible(v)) {
                        if (v.voucherType == "Sản phẩm" || v.voucherType == "Loại sản phẩm") {
                            $scope.listNormalVouchers.push(v);
                        } else if (v.voucherType == "Ship") {
                            $scope.listShippingVouchers.push(v);
                        } else if (v.voucherType == "Hóa đơn") {
                            $scope.listPaymentVouchers.push(v);
                        }
                    }
                })
                console.log("Danh sách vouchers: ", $scope.listVouchersOriginal);

                console.log("VOUCHER OF ", username);
                console.log("-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-");
                console.log("Danh mục vouchers: ", $scope.listVouchersMappingCategories);
                console.log("Sản phẩm vouchers: ", $scope.listVouchersMappingProducts);

                console.log("------------------------------------------------");
                console.log("Voucher type = Sản phẩm / Loại sản phẩm", $scope.listNormalVouchers);
                console.log("Voucher type = Ship", $scope.listShippingVouchers);
                console.log("Voucher type = Hóa đơn", $scope.listPaymentVouchers);
                console.log("-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-");
            })
            .catch(function (error) {
                console.error('Lỗi kết nối đến API: ' + error);
            });
    }

    // ===========================================================================================
    function getListFilterVoucher(listCartItemSelected) {
        if (listCartItemSelected) {
            var listVoucher = [];
            angular.forEach($scope.listVouchersOriginal, function (voucher) {
                voucher.moreAmount = voucher.minimumPurchaseAmount;
                voucher.moreAmountPercents = 0;
                listVoucher.push(voucher);
            })
            $scope.listVouchersOriginal = listVoucher;
        }
        if ($scope.listVouchersOriginal && $scope.listVouchersOriginal.length > 0) {
            $scope.eligibleVouchers = [];
            $scope.relatedVouchers = [];

            angular.forEach($scope.listVouchersOriginal, function (voucher) {
                var isRelated = false;
                var isEligible = false;
                // Kiểm tra xem mã voucher đáp ứng các tiêu chí sử dụng
                $scope.totalAmount = 0;

                isEligible = voucherIsEligible(voucher);

                if (isEligible) {
                    angular.forEach(listCartItemSelected, function (selectedCartItem) {
                        if (voucherIsRelatedToProduct(voucher, selectedCartItem) || voucherIsRelatedToCategory(voucher, selectedCartItem)) {
                            isRelated = true;
                        }
                    });
                }

                if (isRelated && isEligible) {
                    if (voucher.moreAmountPercents < 100 && voucher.moreAmountPercents >= 0) {
                        $scope.relatedVouchers.push(voucher);
                    } else {
                        $scope.eligibleVouchers.push(voucher);
                    }
                }
            });
            console.log("===============================");
            console.log("Danh sách voucher gợi ý ( liên quan ): ", $scope.relatedVouchers);
            console.log("Danh sách voucher đủ điều kiện: ", $scope.eligibleVouchers);
            console.log("===============================");
        }
    };
    // ----------------------------------------------
    function voucherIsRelatedToProduct(voucher, cartItem) {
        var isRelated = false;
        var amount = 0;

        angular.forEach($scope.listVouchersMappingProducts, function (vmp) {
            if (vmp.voucherId == voucher.voucherId && vmp.productDetailId == cartItem.productDetail.productDetailId) {
                isRelated = true;
                amount += cartItem.amount;
            }
        })
        if (isRelated) {
            $scope.totalAmount += amount;
            voucher.moreAmount = voucher.minimumPurchaseAmount - $scope.totalAmount;
            voucher.moreAmountPercents = 100 - (((voucher.minimumPurchaseAmount - $scope.totalAmount) / voucher.minimumPurchaseAmount) * 100).toFixed(2);
        }
        return isRelated;
    }

    function voucherIsRelatedToCategory(voucher, cartItem) {
        var isRelated = false;
        var amount = 0;

        angular.forEach($scope.listProductCategory, function (pc) {
            if (pc.product.productId === cartItem.productDetail.product.productId) {

                angular.forEach($scope.listVouchersMappingCategories, function (vmc) {
                    if (vmc.voucherId === voucher.voucherId && vmc.categoryId === pc.category.categoryId) {
                        isRelated = true;
                        amount += cartItem.amount;
                    }
                })
            }
        })
        if (isRelated) {
            $scope.totalAmount += amount;
            voucher.moreAmount = voucher.minimumPurchaseAmount - $scope.totalAmount;
            voucher.moreAmountPercents = 100 - (((voucher.minimumPurchaseAmount - $scope.totalAmount) / voucher.minimumPurchaseAmount) * 100).toFixed(2);
        }
        return isRelated;
    }

    function voucherIsEligible(voucher) {
        var currentDate = $filter('date')(new Date(), 'yyyy-MM-dd hh-mm-ss');
        var startDate = $filter('date')(voucher.startDate, 'yyyy-MM-dd hh-mm-ss');
        var endDate = $filter('date')(voucher.endDate, 'yyyy-MM-dd hh-mm-ss');
        return (
            voucher.status &&
            startDate <= currentDate &&
            endDate >= currentDate
        );
    }

    function calculateTotalAmount(selectedProducts) {
        var totalAmount = 0;
        angular.forEach(selectedProducts, function (product) {
            totalAmount += product.priceDiscount * product.quantity;
        });
        return totalAmount;
    }

    $scope.isEligibleVoucherPopup = function (voucher) {
        if (voucher) {
            return $scope.eligibleVouchers.some(function (v) {
                return v.voucherId === voucher.voucherId;
            });
        } else {
            return false;
        }
    }


    $scope.isAppliedVoucher = function (voucher) {
        return Object.values($scope.voucherApplied).some(v => v && v.voucherId === voucher.voucherId);
    }

    // ===========================================================================================

    //==============================================================
    $scope.subtractQuantity = function (index) {
        if ($scope.listCartItem[index].quantity > 1) {
            $scope.listCartItem[index].quantity--;
            $scope.updateQuantity(index);
        }
    }

    $scope.addQuantity = function (index) {
        if ($scope.listCartItem[index].quantity < 999) {
            $scope.listCartItem[index].quantity++;
            $scope.updateQuantity(index);
        }
    }

    $scope.updateQuantity = function (index) {
        var cartId = $scope.listCartItem[index].cartId;
        var quantity = $scope.listCartItem[index].quantity;

        CartService.updateQuantity(cartId, quantity)
            .then(function (response) {
                $scope.listCartItemSelected.find(function (item) {
                    if (item.cartId === response.cart.cartId) {
                        response.cart.checked = item.checked
                    }
                });
                $scope.listCartItem[index] = response.cart;
                if (response.status == 'error') {
                    $scope.showNotification(response.status, response.message);
                }
            })
            .catch(function (error) {
                console.log('error', 'Lỗi trong quá trình gửi dữ liệu lên server: ' + error);
            })
    }

    //----------------------------------------------------------------
    $scope.removeFromCart = function (index) {
        Swal.fire({
            title: "Xóa sản phẩm?",
            text: "Bạn có muốn xóa sản phẩm khỏi giỏ hàng.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Xác nhận",
            cancelButtonText: "Hủy",
        }).then((result) => {
            if (result.isConfirmed) {
                CartService.removeCartItem($scope.listCartItem[index].cartId);
                $scope.listCartItem.splice(index, 1);
            }
        });

    }
    //==============================================================================================

    $scope.toggleCheckAll = function () {
        angular.forEach($scope.listCartItem, function (cart) {
            cart.checked = $scope.checkAll;
        });
    };

    $scope.$watch('listCartItem', function (newListCart, oldListCart) {
        $scope.listCartItemSelected = [];
        $scope.checkAll = true;

        angular.forEach(newListCart, function (cart) {
            if (!cart.checked) {
                $scope.checkAll = false;
            } else {
                $scope.listCartItemSelected.push(cart);
            }
        });
        getListFilterVoucher($scope.listCartItemSelected);
        $scope.totalBillAmount = calculateTotalAmount($scope.listCartItemSelected);

    }, true);
    //==============================================================================================
    //==============================================================================================
    $scope.applyVoucher = function (voucher) {
        if (voucher.totalQuantity - voucher.usedQuantity > 0) {
            const voucherAppliedId = voucher.voucherId;


            const isNormalVoucherApplied = $scope.listNormalVouchers.some(e => e.voucherId === voucherAppliedId);
            const isShippedVoucherApplied = $scope.listShippingVouchers.some(e => e.voucherId === voucherAppliedId);
            const isPaymentVoucherApplied = $scope.listPaymentVouchers.some(e => e.voucherId === voucherAppliedId);

            if (isNormalVoucherApplied) {
                $scope.voucherApplied.normalVoucherApplied = voucher;
            } else if (isShippedVoucherApplied) {
                $scope.voucherApplied.shippingVoucherApplied = voucher;
            } else if (isPaymentVoucherApplied) {
                $scope.voucherApplied.paymentVoucherApplied = voucher;
            }

            $scope.totalBillDiscountAmount = calculateTotalDiscountAmount();

            console.log("Voucher đã áp dụng: ", $scope.voucherApplied);
        } else {
            Swal.fire({
                title: "Mã giảm đã hết",
                text: "Mã giảm giá bạn chọn đã hết.",
                icon: "info",
            })
        }

    }

    function calculateTotalDiscountAmount() {
        let totalAmount = $scope.totalBillAmount + $scope.shippingFee;
        if ($scope.voucherApplied.normalVoucherApplied) {
            totalAmount = totalAmount - $scope.getDiscountAmount($scope.voucherApplied.normalVoucherApplied);
        } else if ($scope.voucherApplied.paymentVoucherApplied) {
            totalAmount = totalAmount - $scope.getDiscountAmount($scope.voucherApplied.paymentVoucherApplied);
        }
        return totalAmount;
    }

    $scope.getDiscountAmount = function (voucher) {
        let ship = false;
        if ($scope.listShippingVouchers.includes(voucher)) {
            ship = true;
        }
        if (ship) {

        } else {
            if (voucher.discountType == "Phần trăm") {
                return Math.round((voucher.discountPercentage / 100) * $scope.totalBillAmount);
            } else if (voucher.discountType == "Giảm giá cố định") {
                return voucher.discountAmount;
            }
        }
    }

    $scope.toggleVoucherApplied = function (voucher) {
        if ($scope.voucherApplied.normalVoucherApplied && $scope.voucherApplied.normalVoucherApplied.voucherId === voucher.voucherId) {
            $scope.voucherApplied.normalVoucherApplied = null;
        } else if ($scope.voucherApplied.shippingVoucherApplied && $scope.voucherApplied.shippingVoucherApplied.voucherId === voucher.voucherId) {
            $scope.voucherApplied.shippingVoucherApplied = null;
        } else if ($scope.voucherApplied.paymentVoucherApplied && $scope.voucherApplied.paymentVoucherApplied.voucherId === voucher.voucherId) {
            $scope.voucherApplied.paymentVoucherApplied = null;
        }
        console.log($scope.voucherApplied);
    }


    //----------------------------------------------------------------

    $scope.$watch('listNormalVouchers', function (newListCart, oldListCart) {
        $scope.listNormalVouchers.sort(function (a, b) {

            if (a.moreAmount <= 0 && b.moreAmount > 0) {
                return -1;
            } else if (a.moreAmount > 0 && b.moreAmount <= 0) {
                return 1;
            }

            if (a.maximumDiscountAmount > b.maximumDiscountAmount) {
                return -1;
            } else if (a.maximumDiscountAmount < b.maximumDiscountAmount) {
                return 1;
            }

            if (a.minimumPurchaseAmount < b.minimumPurchaseAmount) {
                return -1;
            } else if (a.minimumPurchaseAmount > b.minimumPurchaseAmount) {
                return 1;
            }

            if (a.discountAmount > b.discountAmount) {
                return -1;
            } else if (a.discountAmount < b.discountAmount) {
                return 1;
            }

            return 0;
        });

    }, true);

    $scope.$watch('listShippingVouchers', function (newListCart, oldListCart) {
        $scope.listShippingVouchers.sort(function (a, b) {
            if (a.moreAmount <= 0 && b.moreAmount > 0) {
                return -1;
            } else if (a.moreAmount > 0 && b.moreAmount <= 0) {
                return 1;
            }

            if (a.maximumDiscountAmount > b.maximumDiscountAmount) {
                return -1;
            } else if (a.maximumDiscountAmount < b.maximumDiscountAmount) {
                return 1;
            }

            if (a.minimumPurchaseAmount < b.minimumPurchaseAmount) {
                return -1;
            } else if (a.minimumPurchaseAmount > b.minimumPurchaseAmount) {
                return 1;
            }

            if (a.discountAmount > b.discountAmount) {
                return -1;
            } else if (a.discountAmount < b.discountAmount) {
                return 1;
            }

            return 0;
        });

    }, true);

    $scope.$watch('listPaymentVouchers', function (newListCart, oldListCart) {
        $scope.listPaymentVouchers.sort(function (a, b) {
            if (a.moreAmount <= 0 && b.moreAmount > 0) {
                return -1;
            } else if (a.moreAmount > 0 && b.moreAmount <= 0) {
                return 1;
            }

            if (a.maximumDiscountAmount > b.maximumDiscountAmount) {
                return -1;
            } else if (a.maximumDiscountAmount < b.maximumDiscountAmount) {
                return 1;
            }

            if (a.minimumPurchaseAmount < b.minimumPurchaseAmount) {
                return -1;
            } else if (a.minimumPurchaseAmount > b.minimumPurchaseAmount) {
                return 1;
            }

            if (a.discountAmount > b.discountAmount) {
                return -1;
            } else if (a.discountAmount < b.discountAmount) {
                return 1;
            }

            return 0;
        });

    }, true);
    //--------------------------------------------
    $scope.openEventCartPopup = function () {
        angular.element(document.querySelector('.background-popup')).addClass('background-behind-popup');
        var popup = angular.element(document.querySelector('#popup-loading-event-cart'));
        popup.css('display', 'block');
    };

    $scope.closeEventCartPopup = function () {
        var popup = angular.element(document.querySelector('#popup-loading-event-cart'));
        popup.css('display', 'none');
        angular.element(document.querySelector('.background-popup')).removeClass('background-behind-popup');
    };
    //--------------------------------------------
    $scope.showVoucherDetail = function (voucher) {
        $scope.vDetail = voucher;
        $scope.openEventCartPopup();

        angular.element(document.querySelector('#popup-loading-event-cart')).addClass('popup-loading-event-cart_hasbottom');

        var popup = angular.element(document.querySelector('#popup-loading-event-cart .popup-loading-event-cart-info'));
        popup.css('display', 'none');

        var popupDetail = angular.element(document.querySelector('#popup-loading-event-cart .popup-loading-event-cart-detail'));
        popupDetail.css('display', 'block');

        var popupDetail = angular.element(document.querySelector('#popup-loading-event-cart .popup-loading-event-cart-bottom'));
        popupDetail.css('display', 'block');
    }

    $scope.closeVoucherDetail = function () {
        angular.element(document.querySelector('#popup-loading-event-cart')).removeClass('popup-loading-event-cart_hasbottom');

        var popup = angular.element(document.querySelector('#popup-loading-event-cart .popup-loading-event-cart-info'));
        popup.css('display', 'block');

        var popupDetail = angular.element(document.querySelector('#popup-loading-event-cart .popup-loading-event-cart-detail'));
        popupDetail.css('display', 'none');

        var popupDetail = angular.element(document.querySelector('#popup-loading-event-cart .popup-loading-event-cart-bottom'));
        popupDetail.css('display', 'none');

        $scope.closeEventCartPopup();
    }

    $scope.backPopupVoucher = function () {
        $scope.closeVoucherDetail();
        $scope.openEventCartPopup();

    }
    //--------------------------------------------

    $scope.viewMoreNormalVouchers = function () {
        $scope.numViewNormalVouchers = $scope.listNormalVouchers.length;
    }

    $scope.viewMoreShippingVouchers = function () {
        $scope.numViewShippingVouchers = $scope.listShippingVouchers.length;
    }

    $scope.viewMorePaymentVouchers = function () {
        $scope.numViewPaymentVouchers = $scope.listPaymentVouchers.length;
    }

    $scope.viewLessNormalVouchers = function () {
        $scope.numViewNormalVouchers = 2;
    }

    $scope.viewLessShippingVouchers = function () {
        $scope.numViewShippingVouchers = 2;
    }

    $scope.viewLessPaymentVouchers = function () {
        $scope.numViewPaymentVouchers = 2;
    }
    //==============================================================================================
    //==============================================================================================

    $scope.splitString = function (string, keySplit) {
        if (string && keySplit) {
            return string.split(keySplit);
        } else {
            return null;
        }
    }

    $scope.getNameTypeOfVoucher = function (voucher) {
        if ($scope.listNormalVouchers.includes(voucher)) {
            return "MÃ GIẢM GIÁ";
        } else if ($scope.listShippingVouchers.includes(voucher)) {
            return "MÃ VẬN CHUYỂN";
        } else if ($scope.listPaymentVouchers.includes(voucher)) {
            return "ƯU ĐÃI THANH TOÁN";
        } else {
            return "";
        }
    }
    //=========[PROVINCE]===================[PROVINCE]==========================[PROVINCE]======================[PROVINCE]==================================
    function getProvince() {
        var url = "https://provinces.open-api.vn/api/?depth=3";

        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status == 200) {
                $scope.listProvince = JSON.parse(xhr.responseText);
                console.log('Danh sách quận/huyện:', $scope.listProvince);
            }
        };
        xhr.send();
    }

    $scope.getListDistrict = function () {
        var provinceCodeSelected = $scope.selectedProvinceCode;
        var selectedProvince = $scope.listProvince.find(function (province) {
            return province.code === provinceCodeSelected;
        });
        if (selectedProvince) {
            $scope.listDistrict = selectedProvince.districts;
        } else {
            $scope.listDistrict = [];
        }
    };

    $scope.getListWard = function () {
        var districtCodeSelected = $scope.selectedDistrictCode;
        var selectedDistrict = $scope.listDistrict.find(function (district) {
            return district.code === districtCodeSelected;
        });
        if (selectedDistrict) {
            $scope.listWard = selectedDistrict.wards;
        } else {
            $scope.listWard = [];
        }
    };

    // --------------------------------------------------------------------------------------------------------------------------------
    function getListAddress(username) {
        var url = `http://localhost:8081/customer/rest/address/${username}`;
        $http
            .get(url)
            .then(function (resp) {
                if (resp.data.listAddress) {
                    $scope.listAddress = resp.data.listAddress;
                    console.log("Danh Sách Địa Chỉ", $scope.listAddress);
                    $scope.selectAddress($scope.listAddress[0]);
                } else {
                    $scope.listAddress = [];
                    console.log("Không tìm thấy địa chỉ cho người dùng này hoặc danh sách rỗng.");
                }
            })
            .catch(function (error) {
                console.log("Error", error);
            });
    }

    $scope.selectAddress = function (address) {
        if (address) {
            $scope.confirmAddress = address;
            $scope.selectedAddress = address;
        }
    }

    $scope.checkErrors = function () {
        $scope.errors = {};

        // Kiểm tra các điều kiện cho trường fullname
        if ($scope.address.fullname == null) {
            $scope.errors.fullname = 'Vui lòng nhập họ và tên';
        } else if ($scope.address.fullname.length < 10) {
            $scope.errors.fullname = 'Họ và tên phải có ít nhất 10 ký tự';
        }

        var reg = /^(0|\+84)(\s|\.)?((3[2-9])|(5[689])|(7[06-9])|(8[1-689])|(9[0-46-9]))(\d)(\s|\.)?(\d{3})(\s|\.)?(\d{3})$/;
        // Kiểm tra các điều kiện cho trường phone
        if (!$scope.address.phone) {
            $scope.errors.phone = 'Vui lòng nhập số điện thoại';
        } else if (!reg.test($scope.address.phone)) {
            $scope.errors.phone = 'Số điện thoại không đúng định dạng ';
        }

        // Kiểm tra các điều kiện cho trường province
        if (!$scope.selectedProvinceCode) {
            $scope.errors.province = 'Vui lòng chọn tỉnh/thành phố';
        }

        // Kiểm tra các điều kiện cho trường district
        if (!$scope.selectedDistrictCode) {
            $scope.errors.district = 'Vui lòng chọn quận/huyện';
        }

        // Kiểm tra các điều kiện cho trường ward
        if (!$scope.selectedWardCode) {
            $scope.errors.ward = 'Vui lòng chọn xã/phường';
        }

        // Kiểm tra các điều kiện cho trường adr (địa chỉ cụ thể)
        if (!$scope.address.adr) {
            $scope.errors.adr = 'Vui lòng nhập địa chỉ cụ thể';
        }

        // Kiểm tra nếu có bất kỳ lỗi nào xuất hiện
        var hasErrors = Object.keys($scope.errors).length > 0;
        return !hasErrors;
    };

    $scope.saveAddress = function () {
        var check = $scope.checkErrors();
        if (check) {
            // Lấy tên của tỉnh, huyện và xã dựa trên mã code đã chọn
            var selectedProvince = $scope.listProvince.find(function (province) {
                return province.code === $scope.selectedProvinceCode;
            });

            var selectedDistrict = $scope.listDistrict.find(function (district) {
                return district.code === $scope.selectedDistrictCode;
            });

            var selectedWard = $scope.listWard.find(function (ward) {
                return ward.code === $scope.selectedWardCode;
            });

            // Tạo một đối tượng Address từ dữ liệu nhập vào, bao gồm tên của tỉnh, huyện, xã và địa chỉ cụ thể
            var newAddress = {
                id: $scope.address.id | null,
                fullname: $scope.address.fullname,
                phone: $scope.address.phone,
                address: $scope.address.adr + ", " + selectedWard.name + ", " + selectedDistrict.name + ", " + selectedProvince.name,
                username: username
            };

            var url = `http://localhost:8081/customer/rest/profile_address`;
            $scope.showLoading();
            $http.post(url, newAddress)
                .then(function (resp) {
                    $scope.hideLoading();
                    getListAddress(username);
                    $scope.closeModalCreateAddress();

                    Swal.fire({
                        title: "Thêm địa chỉ",
                        text: "Thêm địa chỉ mới thành công.",
                        icon: "success",
                    })
                })
                .catch(function (error) {
                    console.error("Lỗi khi lưu địa chỉ:", error);
                });
        }

    };
    //----------------------------------------------------------------
    $scope.openModalCreateAddress = function () {
        $("#chooseAddressModal").modal('hide');
        $("#createAddressModal").modal('show');
    };

    $scope.closeModalCreateAddress = function () {
        $("#createAddressModal").modal('hide');
        $("#chooseAddressModal").modal('show');
    };

    //=========[PROVINCE]===================[PROVINCE]==========================[PROVINCE]======================[PROVINCE]==================================

    //=========[API GHN]===================[API GHN]==========================[API GHN]======================[API GHN]==================================

    // Hàm để lấy mã tỉnh GHN
    function getProvinceCodeGHN() {
        var apiUrl = "https://online-gateway.ghn.vn/shiip/public-api/master-data/province";

        var requestConfig = {
            headers: {
                'Token': tokenGHN,
                'Content-Type': 'application/json',
            }
        };

        return $http.post(apiUrl, {}, requestConfig)
            .then(function (response) {
                $scope.provinceGHN = response.data;
            })
            .catch(function (error) {
                console.error("Lỗi khi gọi API lấy danh sách tỉnh thành GHN:", error);
                throw error;
            });
    }

    // Hàm để lấy mã quận/huyện GHN
    function getDistrictCodeGHN(provinceId) {
        var apiUrl = "https://online-gateway.ghn.vn/shiip/public-api/master-data/district";

        var requestConfig = {
            headers: {
                'Token': tokenGHN,
                'Content-Type': 'application/json',
            }
        };

        var requestData = {
            province_id: provinceId
        };

        return $http.post(apiUrl, requestData, requestConfig)
            .then(function (response) {
                return response.data;
            })
            .catch(function (error) {
                console.error("Lỗi khi gọi API lấy danh sách quận huyện GHN:", error);
                throw error;
            });
    }

    // Hàm để lấy mã phường/xã theo quận/huyện GHN
    function getWardCodeGHN(districtId) {
        var apiUrl = "https://online-gateway.ghn.vn/shiip/public-api/master-data/ward?district_id";

        var requestConfig = {
            headers: {
                'Token': tokenGHN,
                'Content-Type': 'application/json',
            }
        };

        var requestData = {
            district_id: districtId
        }

        return $http.post(apiUrl, requestData, requestConfig)
            .then(function (response) {
                return response.data;
            })
            .catch(function (error) {
                console.error("Lỗi khi gọi API lấy danh sách phường xã GHN:", error);
                throw error;
            });
    }

    function getToDistrictAndToWard(selectedAddress) {
        var address = tachDiaChi(selectedAddress.address);
        return getProvinceCodeGHN()
            .then(function () {
                return transProvinceNameToProvinceGHN(address.tinhThanh);
            })
            .then(function (province) {
                return getDistrictCodeGHN(province.ProvinceID).then(function (resp) {
                    $scope.districtGHN = resp;
                });
            })
            .then(function () {
                return $scope.toDistrict = transDistrictNameToDistrictGHN(address.quanHuyen);
            })
            .then(function (district) {
                return getWardCodeGHN(district.DistrictID).then(function (resp) {
                    $scope.wardGHN = resp;
                });
            })
            .then(function () {
                return $scope.toWard = transWardNameToWardGHN(address.xaPhuong);
            })
    }

    // Hàm để tính phí vận chuyển
    function calculateShippingFee(listCartItemSelected, availableServiceData) {
        var apiUrl = "https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/fee";

        var to_district = $scope.toDistrict;
        var to_ward = $scope.toWard;
        var total_weight = 0;

        // Kiểm tra xem dữ liệu dịch vụ có tồn tại không
        if (availableServiceData && availableServiceData.length > 0) {
            var service_id = availableServiceData[0].service_id;
            var service_type_id = availableServiceData[0].service_type_id;

            angular.forEach(listCartItemSelected, function (item) {
                total_weight += item.quantity * item.productDetail.weight;
            });

            var requestData = {
                to_district_id: to_district.DistrictID,
                to_ward_code: to_ward.WardCode,
                weight: total_weight,
                service_id: service_id,
                service_type_id: service_type_id,
            };


            var requestConfig = {
                headers: {
                    'Token': tokenGHN,
                    'ShopId': shopIdGHN,
                    'Content-Type': 'application/json',
                }
            };

            // Kiểm tra xem có đủ dữ liệu để gọi API không
            if (to_district && to_ward && total_weight > 0) {
                $http.post(apiUrl, requestData, requestConfig).then(function (response) {
                    var data = response.data.data;
                    $scope.shippingFee = data.total;
                })
                    .catch(function (error) {
                        console.error("Lỗi khi gọi API tính phí đơn hàng:", error);
                    });
            }
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Xin lỗi',
                text: 'Giao hàng nhanh chưa có mặt tại nơi của bạn',
            });
        }
    }

    // Hàm để lấy dịch vụ vận chuyển
    function getAvailableServiceGHN() {
        var apiUrl = "https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/available-services";
        if ($scope.toDistrict) {
            var to_district = $scope.toDistrict;
            var requestData = {
                "shop_id": shopIdGHN,
                "from_district": districtCodeGH,
                "to_district": to_district.DistrictID
            };
            var requestConfig = {
                headers: {
                    'Token': tokenGHN,
                    'Content-Type': 'application/json',
                }
            };

            return $http.post(apiUrl, requestData, requestConfig)
                .then(function (response) {
                    return response.data.data;
                })
                .catch(function (error) {
                    console.error("Lỗi khi gọi API xem dịch vụ:", error);
                    throw error;
                });
        }
    }

    // Hàm chuyển đổi tỉnh thành GHN
    function transProvinceNameToProvinceGHN(provinceName) {
        try {
            var provinceData = $scope.provinceGHN;
            var matchedProvince = provinceData.data.find(province => {
                return province.NameExtension.includes(provinceName) || province.ProvinceName == provinceName;
            });
            return matchedProvince || null;
        } catch (error) {
            console.error("Lỗi khi chuyển đổi tỉnh thành GHN:", error);
            throw error;
        }
    }

    // Hàm chuyển đổi quận huyện GHN
    function transDistrictNameToDistrictGHN(districtName) {
        try {
            var districtData = $scope.districtGHN;

            var matchedDistrict = districtData.data.find(district => {
                return (district.NameExtension.includes(districtName) || district.DistrictName == districtName);
            });
            return matchedDistrict || null;
        } catch (error) {
            console.error("Lỗi khi chuyển đổi quận huyện GHN:", error);
            throw error;
        }
    }

    // Hàm chuyển đổi phường xã GHN
    function transWardNameToWardGHN(wardName) {
        try {
            var wardData = $scope.wardGHN;

            var matchedWard = wardData.data.find(ward => {
                return (ward.NameExtension.includes(wardName) || ward.WardName == wardName);
            });
            return matchedWard || null;
        } catch (error) {
            console.error("Lỗi khi chuyển đổi phường xã GHN:", error);
            throw error;
        }
    }

    // Hàm tách địa chỉ
    function tachDiaChi(diaChi) {
        var result = {};

        var parts = diaChi.split(', ');

        result.tinhThanh = parts.pop();
        result.quanHuyen = parts.pop();
        result.xaPhuong = parts.pop();

        return result;
    }


    $scope.$watchGroup(['listCartItemSelected', 'selectedAddress'], function (newValues, oldValues) {
        var bothValuesExist = $scope.listCartItemSelected && $scope.selectedAddress;

        if (bothValuesExist) {
            $scope.showLoading();

            getToDistrictAndToWard($scope.selectedAddress)
                .then(function () {
                    return getAvailableServiceGHN();
                })
                .then(function (availableServiceData) {
                    return calculateShippingFee($scope.listCartItemSelected, availableServiceData);
                })
                .then(function () {
                    $scope.hideLoading();
                })
                .catch(function (error) {
                    console.error("Lỗi:", error);
                    $scope.hideLoading();
                });
        }
    });



    //=========[API GHN]===================[API GHN]==========================[API GHN]======================[API GHN]==================================

    //=========[CHECKOUT]===================[CHECKOUT]==========================[CHECKOUT]======================[CHECKOUT]==================================

    $scope.checkout = function () {
        var data = {
            customer: username,

        }
    }
    //=========[CHECKOUT]===================[CHECKOUT]==========================[CHECKOUT]======================[CHECKOUT]==================================

    function init() {
        getProvince();
        getProvinceCodeGHN();
        getCart();
        getProductCategory();
        getVoucherByUsername(username);
        getListAddress(username);
    }

    init();
}