package com.chat;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.logging.*;

import org.json.JSONObject;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.WebSocketMessage;
import org.springframework.web.socket.WebSocketSession;

public class ClientManager implements WebSocketHandler {
	
	private static final Logger logger = Logger.getLogger(ClientManager.class.getName());
	
	static List<WebSocketSession> waitingUsers = new ArrayList<WebSocketSession>();
	
	static Map<WebSocketSession,WebSocketSession> connectedUsers = new HashMap<WebSocketSession, WebSocketSession>(); 

	@Override
	public void afterConnectionEstablished(WebSocketSession session) throws Exception {
		logger.log(Level.INFO, "In afterConnectionEstablished { session: "+session +" }");
		JSONObject msg = new JSONObject();
		if(waitingUsers.isEmpty()) {
			waitingUsers.add(session);
			msg.put("flag","start");
			msg.put("msg","Searching for partner...");
			msg.put("totalUser",waitingUsers.size() + connectedUsers.size());
			logger.log(Level.INFO, "In afterConnectionEstablished { waitingUsers At empty: "+waitingUsers +" }");
			session.sendMessage(new TextMessage(msg.toString()));
		}else {
		WebSocketSession user = waitingUsers.get(new Random().nextInt(waitingUsers.size()));
		connectedUsers.put(session, user);
		connectedUsers.put(user, session);
		waitingUsers.remove(user);
		msg.put("flag","start");
		msg.put("msg","You are connected to stranger.");
		msg.put("totalUser",waitingUsers.size() + connectedUsers.size());
		logger.log(Level.INFO, "In afterConnectionEstablished { waitingUsers At connected: "+waitingUsers+", connected Users:"  +connectedUsers+" }");
		user.sendMessage(new TextMessage(msg.toString()));
		session.sendMessage(new TextMessage(msg.toString()));
		}
	}

	@Override
	public void handleMessage(WebSocketSession session, WebSocketMessage<?> message) throws Exception {
		
		//logger.log(Level.INFO, "In handleMessage{ session: "+session+", messsage: "+message+" }");
		JSONObject msg = new JSONObject();
		String payload = (String) message.getPayload();
		JSONObject receivedMsg = new JSONObject(payload);
		Object value = receivedMsg.get("type");
		WebSocketSession friend = connectedUsers.get(session);
		//logger.log(Level.INFO, "In handleMessage{ friend: "+friend+" }");
		if(null != friend) {
		if(value.equals("typing")) {
			msg.put("flag","typing");
			msg.put("msg",receivedMsg.get("value"));
			friend.sendMessage(new TextMessage(msg.toString()));}
		else if(value.equals("disconnect")){
			if(waitingUsers.contains(session)) {
				waitingUsers.remove(session);
				waitingUsers.remove(friend);
			}
			if(connectedUsers.containsKey(session)) {
				connectedUsers.remove(session);
				connectedUsers.remove(friend);
			}
			msg.put("flag","disconnect");
			msg.put("msg",receivedMsg.get("value"));
			msg.put("totalUser",waitingUsers.size() + connectedUsers.size());
			friend.sendMessage(new TextMessage(msg.toString()));
		}
		else {
		msg.put("flag","msg");
		msg.put("msg",receivedMsg.get("value"));
		msg.put("totalUser",waitingUsers.size() + connectedUsers.size());
		friend.sendMessage(new TextMessage(msg.toString()));}	
	}}

	@Override
	public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
		// TODO Auto-generated method stub
		
	}

	@Override
	public void afterConnectionClosed(WebSocketSession session, CloseStatus closeStatus) throws Exception {
		if(waitingUsers.contains(session)) {
			waitingUsers.remove(session);			
		}
		if(connectedUsers.containsKey(session)) {
			connectedUsers.remove(session);			
		}
		logger.log(Level.INFO, "OnClosed: "+waitingUsers+" session: "+session);
		logger.log(Level.INFO, "OnClosed: "+connectedUsers);
	}

	@Override
	public boolean supportsPartialMessages() {
		// TODO Auto-generated method stub
		return false;
	}
	

}
