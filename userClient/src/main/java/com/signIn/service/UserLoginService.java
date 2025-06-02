package com.signIn.service;

import org.springframework.http.ResponseEntity;

import com.shared_dto.mode.Worker;
import com.signIn.mode.Location;

public interface UserLoginService {

	public ResponseEntity<?>checkToken();
	
	public Worker userLogin(String name,String password,String idcard);
	
	public Location getLocation();
}
