package com.signIn.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.shared_dto.mode.Worker;
import com.signIn.mapper.SqlMapper;
import com.signIn.mode.Location;

@Service
public class UserLoginServiceImpl implements UserLoginService {

	@Autowired
	SqlMapper sql;
	
	@Override
	public ResponseEntity<?> checkToken() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public Worker userLogin(String name, String password,String idcard) {
		return sql.userLogin(name, password,idcard);
	}

	@Override
	public Location getLocation() {

		return sql.getLocation();
	}

}
