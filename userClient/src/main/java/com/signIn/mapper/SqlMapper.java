package com.signIn.mapper;

import java.util.List;

import org.apache.catalina.Manager;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import com.shared_dto.mode.Worker;
import com.signIn.mode.Location;

@Mapper
public interface SqlMapper {

    @Update("UPDATE personal_manage SET pid=#{pid},name=#{name}, age=#{age}, nationality=#{nationality}, idcard=#{idcard}, birthday=#{birthday}, college=#{college}, "
    		+ "address=#{address}, tele=#{tele}, job=#{job}, jobtime=#{jobtime}, photo=#{photo} where pid=#{pid}")
    int updateEmployees(Worker worker);

    @Select("SELECT * FROM manager WHERE account = #{account} AND password = #{password}")
    Manager login(String account, String password);
    
    @Select("SELECT * FROM personal_manage WHERE name= #{name}")
    List<Worker> getEmployees(String name);
    
    @Select("SELECT * FROM personal_manage WHERE name=#{name} AND password=#{password} AND idcard=#{idcard}")
    Worker userLogin(String name,String password,String idcard);
    
    @Select("SELECT * FROM personal_manage")
    List<Worker> selectAllEmployees();
    
	@Select("SELECT * FROM location")
	public Location getLocation();
}
