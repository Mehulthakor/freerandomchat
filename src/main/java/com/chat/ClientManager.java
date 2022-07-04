package com.chat;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

import org.json.JSONObject;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.WebSocketMessage;
import org.springframework.web.socket.WebSocketSession;

public class ClientManager implements WebSocketHandler {
	
	static List<WebSocketSession> waitingUsers = new ArrayList<WebSocketSession>();
	
	static Map<WebSocketSession,WebSocketSession> connectedUsers = new HashMap<WebSocketSession, WebSocketSession>(); 

	@Override
	public void afterConnectionEstablished(WebSocketSession session) throws Exception {
		JSONObject msg = new JSONObject();
		if(waitingUsers.isEmpty()) {
			waitingUsers.add(session);
			msg.put("flag","start");
			msg.put("msg","Searching for partner...");
			session.sendMessage(new TextMessage(msg.toString()));
		}else {
		WebSocketSession user = waitingUsers.get(new Random().nextInt(waitingUsers.size()));
		connectedUsers.put(session, user);
		connectedUsers.put(user, session);
		waitingUsers.remove(user);
		msg.put("flag","start");
		msg.put("msg","You are connected to stranger.");
		user.sendMessage(new TextMessage(msg.toString()));
		session.sendMessage(new TextMessage(msg.toString()));
		}
	}

	@Override
	public void handleMessage(WebSocketSession session, WebSocketMessage<?> message) throws Exception {
		JSONObject msg = new JSONObject();
		String payload = (String) message.getPayload();
		JSONObject receivedMsg = new JSONObject(payload);
		Object value = receivedMsg.get("type");
		WebSocketSession friend = connectedUsers.get(session);
		if(null != friend) {
		if(value.equals("typing")) {
			msg.put("flag","typing");
			msg.put("msg",receivedMsg.get("value"));
			friend.sendMessage(new TextMessage(msg.toString()));}
		else if(value.equals("disconnect")){
			msg.put("flag","disconnect");
			msg.put("msg",receivedMsg.get("value"));
			friend.sendMessage(new TextMessage(msg.toString()));
		}
		else {
		msg.put("flag","msg");
		msg.put("msg",receivedMsg.get("value"));
		friend.sendMessage(new TextMessage(msg.toString()));}	
	}}

	@Override
	public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
		// TODO Auto-generated method stub
		
	}

	@Override
	public void afterConnectionClosed(WebSocketSession session, CloseStatus closeStatus) throws Exception {
		waitingUsers.remove(session);
		connectedUsers.remove(session);
		System.out.println("OnClosed "+waitingUsers);
	}

	@Override
	public boolean supportsPartialMessages() {
		// TODO Auto-generated method stub
		return false;
	}
	

}
