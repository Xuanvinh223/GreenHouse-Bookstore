package com.greenhouse.dto;

import java.util.Date;

import lombok.Data;

@Data
public class SignupDTO {

	private String username;
	private String fullname;
	private String password;
	private String email;
	private String gender;
	private Date birthday;
	private String phone;
	private String image;
	private Date createdAt;
	private Date deletedAt;
	private String deletedBy;
	private boolean active;

}
