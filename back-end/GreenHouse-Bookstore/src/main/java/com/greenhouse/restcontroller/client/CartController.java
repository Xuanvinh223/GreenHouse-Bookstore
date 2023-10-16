package com.greenhouse.restcontroller.client;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.greenhouse.dto.client.CartDTO;
import com.greenhouse.model.Accounts;
import com.greenhouse.model.Carts;
import com.greenhouse.model.Product_Detail;
import com.greenhouse.repository.AccountRepository;
import com.greenhouse.repository.CartsRepository;
import com.greenhouse.repository.ProductDetailRepository;

@RestController
@RequestMapping("/customer/rest/cart")
public class CartController {

    @Autowired
    private CartsRepository cartsRepository;
    @Autowired
    private AccountRepository accountRepository;
    @Autowired
    private ProductDetailRepository productDetailRepository;

    @PostMapping("/add")
    public ResponseEntity<Map<String, Object>> addToCart(@RequestBody CartDTO data) {
        Map<String, Object> response = new HashMap<>();
        String status = "error";
        String message = "Lỗi API thêm sản phẩm vào giỏ hàng";

        try {
            Accounts accounts = accountRepository.findById(data.getUsername()).orElse(null);
            Product_Detail productDetail = productDetailRepository.findById(data.getProductDetailId()).orElse(null);

            if (accounts != null && productDetail != null) {
                Carts duplicate = cartsRepository.findCartsByUsernameAndProductDetailIdAndStatus(
                        accounts.getUsername(), productDetail.getProductDetailId(), true);

                int quantity = data.getQuantity();
                Double price = productDetail.getPrice();
                Double priceDiscount = productDetail.getPriceDiscount();
                Double amount = quantity * (priceDiscount > 0 ? priceDiscount : price);
                System.out.println(productDetail.getQuantityInStock() - quantity);

                if (productDetail.getQuantityInStock() - quantity >= 0) {
                    if (duplicate != null) {
                        int newQuantity = duplicate.getQuantity() + quantity;
                        amount = newQuantity * (priceDiscount > 0 ? priceDiscount : price);

                        duplicate.setQuantity(newQuantity);
                        duplicate.setAmount(amount);
                        cartsRepository.save(duplicate);
                    } else {
                        Carts cart = new Carts();

                        cart.setAccount(accounts);
                        cart.setProductDetail(productDetail);

                        cart.setQuantity(quantity);
                        cart.setPrice(price);
                        cart.setPriceDiscount(priceDiscount);
                        cart.setAmount(amount);
                        cart.setStatus(true);

                        cartsRepository.save(cart);
                    }
                    status = "success";
                    message = "Đã thêm sản phẩm [" + productDetail.getProduct().getProductName() + "] vào giỏ hàng";
                } else {
                    status = "error";
                    message = "Sản phẩm [" + productDetail.getProduct().getProductName() + "] chỉ còn: ["
                            + productDetail.getQuantityInStock() + "]";
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        response.put("status", status);
        response.put("message", message);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/getCart")
    public ResponseEntity<Map<String, Object>> getCart(@RequestParam String username) {
        Map<String, Object> response = new HashMap<>();
        String status = "error";
        String message = "Lỗi API lấy dữ liệu của giỏ hàng";

        List<Carts> listCart = new ArrayList<>();
        try {
            listCart = cartsRepository.findByAccountIdAndStatusOrderByCreatedDateDesc(username, true);
            status = "success";
            message = "Lấy dữ liệu giỏ hàng của người dùng: [" + username + "] thành công";
        } catch (Exception e) {
            System.out.println(e);
        }

        response.put("listCart", listCart);
        response.put("status", status);
        response.put("message", message);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/updateQuantity")
    public ResponseEntity<Map<String, Object>> updateQuantity(@RequestBody Map<String, Object> data) {
        Map<String, Object> response = new HashMap<>();
        String status = "";
        String message = "";

        int cartId = Integer.valueOf(data.get("cartId").toString());

        Carts cart = new Carts();
        cart = cartsRepository.findById(cartId).get();

        if (cart != null) {
            if (data.get("quantity").toString().matches("^[0-9]+$")) {
                int quantity = Integer.valueOf(data.get("quantity").toString());
                int quantityInStock = cart.getProductDetail().getQuantityInStock();

                if (quantityInStock - quantity > 0) {
                    Double price = cart.getPrice();
                    Double priceDiscount = cart.getPriceDiscount();
                    Double amount = quantity * (priceDiscount > 0 ? priceDiscount : price);

                    cart.setQuantity(quantity);
                    cart.setAmount(amount);
                    cartsRepository.save(cart);

                    status = "success";
                    message = "Cập nhật thông tin sản phẩm [" + cart.getProductDetail().getProduct().getProductName()
                            + "] trong giỏ hàng thành công";
                } else {
                    status = "error";
                    message = "Sản phẩm [" + cart.getProductDetail().getProduct().getProductName()
                            + "] còn: " + cart.getProductDetail().getQuantityInStock();
                }
            }
        }

        response.put("cart", cart);
        response.put("status", status);
        response.put("message", message);

        return ResponseEntity.ok(response);
    }

}