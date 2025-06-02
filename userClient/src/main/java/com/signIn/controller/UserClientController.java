package com.signIn.controller;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.shared_dto.mode.Worker;
import com.signIn.feignClient.FeignClientConfig;
import com.signIn.mode.Location;
import com.signIn.service.UserLoginService;
import com.signIn.utils.JwtConfig;

import io.swagger.v3.oas.annotations.Operation;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.ws.rs.core.HttpHeaders;

@Controller
public class UserClientController {

	@Autowired
	JwtConfig jwt;
	
	@Autowired
	UserLoginService service;
	
	@Autowired
	FeignClientConfig feign;
	
	@GetMapping("/userLoginHTML")
	public String login() {
		return "login";
	}
	
	@GetMapping("/signIn")
	public String indexHTML() {
		return "signIn";
	}
	
	@PostMapping("/api/checkSignIn")
	public ResponseEntity<Map<String,Object>> checkSignIn(@RequestBody Map<String ,String> signIn){
		Map<String,Object> response = new HashMap<>();
		boolean res = feign.checkSignIn(signIn.get("name"),signIn.get("idcard"));
		response.put("ifSignIn", (Boolean)res);
		return ResponseEntity.ok(response);
	}
	
	@GetMapping("/getLocation")
	public ResponseEntity<Location> getLocation(){
		Location location = service.getLocation();
		return ResponseEntity.ok(location);
	}
	
	@PostMapping("/api/userLogin")
	@Operation(summary = "userLogin", description = "根据账号密码验证员工身份")
	public ResponseEntity<Map<String, Object>> userLogin(HttpServletResponse response, @RequestBody Worker worker) {
		Map<String, Object> res = new HashMap<>();

		try {
			Worker ret = service.userLogin(worker.getName(), worker.getPassword(),worker.getIdcard());
			if (ret != null) {
				// 登录成功
				String userId = ret.getPid() + "";
				String token = jwt.generateToken(userId); // 设置HttpOnly Cookie
				ResponseCookie cookie = ResponseCookie.from("userClientToken", token)
													  .httpOnly(true)
													  .secure(false) // 开发环境允许
													  .path("/") // 全局路径有效
													  //.sameSite("None") // 允许跨站点携带 Cookie
													  .maxAge(8640).build();
				response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
				res.put("code", 200);
				res.put("message", "登录成功");
				res.put("token", token);
				res.put("data", Map.of("userId", ret.getPid(), "username", ret.getName()));
				return ResponseEntity.ok(res);
			} else {
				// 用户名或密码错误
				res.put("code", 401);
				res.put("message", "用户名或密码错误");
				return ResponseEntity.status(401).body(res);
			}
		} catch (Exception e) {
			// 服务器内部错误
			res.put("code", 500);
			res.put("message", "服务器异常：" + e.getMessage());
			System.out.print("message" + "服务器异常：" + e.getMessage());
			return ResponseEntity.status(500).body(res);
		}
	}
	
	@PostMapping("/api/validateToken")
	public ResponseEntity<Boolean> validateToken(HttpServletRequest request){
		Cookie[] cookies = request.getCookies();
	    if (cookies == null) {
	    	System.out.print("没有cookie\n");
	        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
	    }
	    String token = Arrays.stream(cookies)
	            			 .filter(c -> "userClientToken".equals(c.getName()))
	            			 .map(Cookie::getValue)
	            			 .findFirst()
	            			 .orElse(null);
	    System.out.print("cookie验证\n");
	    if (token == null || !jwt.validateToken(token)) {
	        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
	    }
	    System.out.print("token有效\n");
		return ResponseEntity.ok().build();
	}
}
