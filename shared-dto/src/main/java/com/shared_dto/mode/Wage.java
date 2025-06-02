package com.shared_dto.mode;

import java.io.Serializable;

public class Wage implements Serializable {

	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	private int pid;
	private int baseSalary;
	private int allowance;
	private int overtimeSalary;
	private int socialPay;
	private int performance;	//绩效
	public int getPid() {
		return pid;
	}
	public void setPid(int pid) {
		this.pid = pid;
	}
	public int getBaseSalary() {
		return baseSalary;
	}
	public void setBaseSalary(int baseSalary) {
		this.baseSalary = baseSalary;
	}
	public int getAllowance() {
		return allowance;
	}
	public void setAllowance(int allowance) {
		this.allowance = allowance;
	}
	public int getOvertimeSalary() {
		return overtimeSalary;
	}
	public void setOvertimeSalary(int overtimeSalary) {
		this.overtimeSalary = overtimeSalary;
	}
	public int getSocialPay() {
		return socialPay;
	}
	public void setSocialPay(int socialPay) {
		this.socialPay = socialPay;
	}
	public int getPerformance() {
		return performance;
	}
	public void setPerformance(int performance) {
		this.performance = performance;
	}
}
