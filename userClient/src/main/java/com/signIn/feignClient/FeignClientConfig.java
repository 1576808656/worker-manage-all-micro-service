package com.signIn.feignClient;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient("workTime")
public interface FeignClientConfig {
	@PostMapping("/time/checkSignIn")
	public boolean checkSignIn(@RequestParam("name") String name,@RequestParam("idcard")String idcard);
}
