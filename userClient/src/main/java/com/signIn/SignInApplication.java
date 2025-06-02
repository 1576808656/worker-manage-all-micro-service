package com.signIn;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class SignInApplication {

	public static void main(String[] args) {
		SpringApplication.run(SignInApplication.class, args);
	}

}
