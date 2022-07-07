package com.chat;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin
@RestController
@RequestMapping("/")
public class Controller {
	
	@GetMapping("/getTotalUsers")
	public Integer getTotalUser() {
		return ClientManager.waitingUsers.size()+ClientManager.connectedUsers.size();
	}
	
}
