package com.greenhouse.controller.client;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import com.greenhouse.model.Accounts;
import com.greenhouse.model.Authorities;
import com.greenhouse.model.Product_Images;
import com.greenhouse.repository.AccountRepository;
import com.greenhouse.repository.AuthoritiesRepository;
import com.greenhouse.repository.Product_ImagesRepository;
import com.greenhouse.util.JwtUtil;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Controller
public class Maincontroller {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    AccountRepository accountRepository;

    @Autowired
    private Product_ImagesRepository productImagesReps;

    @Autowired
    private AuthoritiesRepository authoritiesRepository;

    @GetMapping(value = "/index")
    public String index() {
        return "client/layouts/home";
    }

    @GetMapping(value = "/contact")
    public String contact() {
        return "client/layouts/contact";
    }

    @GetMapping(value = "/voucher")
    public String voucher() {
        return "client/layouts/voucher";
    }

    @GetMapping(value = "/flash-sale")
    public String flashSale() {
        return "client/layouts/flash-sale";
    }

    @GetMapping(value = "/product")
    public String product() {
        return "client/layouts/product";
    }

    @GetMapping(value = "/product-details")
    public String productDetails(Model m, @RequestParam("id") Integer id) {
        List<Product_Images> productImages = productImagesReps.findByProductDetail_ProductDetailId(id);
        m.addAttribute("productImages", productImages);
        return "client/layouts/product-details";
    }

    @GetMapping(value = "/account")
    public String account() {
        return "client/layouts/account-doashboad";
    }

    @GetMapping(value = "/account/notification")
    public String account_Notify() {
        return "client/layouts/account-notify";
    }

    @GetMapping(value = "/account/address")
    public String account_Address() {
        return "client/layouts/account-address";
    }

    @GetMapping(value = "/account/info")
    public String account_Info() {
        return "client/layouts/account-info";
    }

    @GetMapping(value = "/account/order")
    public String account_Order() {
        return "client/layouts/account-order";
    }

    @GetMapping(value = "/account/review")
    public String account_Review() {
        return "client/layouts/account-review";
    }

    @GetMapping(value = "/account/review-detail")
    public String Review_Detail() {
        return "client/layouts/review-detail";
    }

    @GetMapping(value = "/account/voucher")
    public String account_Voucher() {
        return "client/layouts/account-voucher";
    }

    @GetMapping(value = "/cart")
    public String cart() {
        return "client/layouts/cart";
    }

    @GetMapping(value = "/checkout")
    public String checkout() {
        return "client/layouts/checkout";
    }

    @GetMapping(value = "/checkout-complete")
    public String checkoutComplete() {
        return "client/layouts/checkout-complete";
    }

    @GetMapping(value = "/login")
    public String login() {
        // Kiểm tra xem người dùng đã đăng nhập chưa
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()
                && !authentication.getName().equals("anonymousUser")) {
            // Nếu đã đăng nhập, chuyển hướng đến trang khác, ví dụ trang chính
            return "redirect:/index";
        }
        // Nếu chưa đăng nhập, hiển thị trang đăng nhập
        return "client/layouts/login";
    }

    @GetMapping(value = "/resgister")
    public String signin() {
        return "client/layouts/signin";
    }

    @GetMapping(value = "/forgot-password")
    public String forgotPasswrod() {
        return "client/layouts/forgot-password";
    }

    @GetMapping(value = "/change-password")
    public String changePassword() {
        return "client/layouts/change-password";
    }

    @GetMapping("/404")
    public String accessDenied() {
        return "client/layouts/404"; // Chuyển hướng đến trang 403
    }

    @GetMapping("/login-processing")
    public String loginProcessing(HttpServletResponse response) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        // Trích xuất thông tin người dùng từ đối tượng Authentication
        String username = authentication.getName();
        Accounts accounts = accountRepository.findByUsername(username);
        setCookie(response, username, accounts);
        return "redirect:/index";
    }

    @GetMapping("/login-error")
    public String loginError(RedirectAttributes redirectAttributes) {
        redirectAttributes.addFlashAttribute("loginMessage", "Sai tài khoản hoặc mật khẩu");
        return "redirect:/login";
    }

    @GetMapping("/google-processing")
    public String googleProcessing(OAuth2AuthenticationToken authenticationToken, HttpServletRequest request,
                                   HttpServletResponse response) {
        // Lấy thông tin tài khoản Google đã đăng nhập từ authenticationToken
        OAuth2User oauth2User = authenticationToken.getPrincipal();
        Accounts accounts = new Accounts();
        Authorities authorities = new Authorities();
        String username = oauth2User.getAttribute("sub");
        String fullname = oauth2User.getAttribute("name");
        String image = oauth2User.getAttribute("picture");
        String email = oauth2User.getAttribute("email");

        Accounts existAccountEmail = accountRepository.findByEmail(email);

        if (existAccountEmail == null) {
            accounts.setUsername(username);
            accounts.setPassword(new BCryptPasswordEncoder().encode(username));
            accounts.setFullname(fullname);
            accounts.setImage(image);
            accounts.setEmail(email);
            accounts.setActive(true);
            accountRepository.save(accounts);

            if (authoritiesRepository.findByUsername(username).isEmpty()) {
                authorities.setUsername(accounts.getUsername());
                authorities.setRoleId(3);
                authoritiesRepository.save(authorities);
            }

            setCookie(response, username, accounts);
        } else {
            setCookie(response, existAccountEmail.getUsername(), existAccountEmail);
        }

        return "redirect:/index";

    }

    private void setCookie(HttpServletResponse response, String username, Accounts account) {

        List<Authorities> listAuthorities = authoritiesRepository.findByUsername(username);

        List<GrantedAuthority> authoritiesList = listAuthorities.stream()
                .map(authority -> new SimpleGrantedAuthority("ROLE_" + authority.getRole().getRole()))
                .collect(Collectors.toList());

        UserDetails user = new User(username, account.getPassword(), authoritiesList);

        Authentication newAuthentication = new UsernamePasswordAuthenticationToken(user, null,
                user.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(newAuthentication);

        final String jwt = jwtUtil.generateToken(account, authoritiesList);

        Cookie cookie = new Cookie("token", jwt);
        cookie.setMaxAge(3600);
        cookie.setPath("/");
        response.addCookie(cookie);
    }
}
