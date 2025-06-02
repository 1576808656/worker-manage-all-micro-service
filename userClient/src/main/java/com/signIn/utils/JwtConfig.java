package com.signIn.utils;

import java.util.Date;

import org.springframework.stereotype.Component;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtConfig {
    private static final String SECRET_KEY = "nmPhPo7Ju/xgis3fXUyerWKVh4TrdFszIbuSnCiz4Vg="; // 使用安全随机字符串
    private static final long EXPIRATION_TIME = 86400000; // 24小时（单位：毫秒）

    // 生成Token
    public String generateToken(String userId) {
        return Jwts.builder()
                .setSubject(userId) // 用户唯一标识（如用户ID）
                .setIssuedAt(new Date()) // 签发时间
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME)) // 过期时间
                .signWith(Keys.hmacShaKeyFor(SECRET_KEY.getBytes()), SignatureAlgorithm.HS256) // 签名算法
                .compact();
    }

    // 验证Token
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                .setSigningKey(SECRET_KEY.getBytes())
                .build()
                .parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

}
