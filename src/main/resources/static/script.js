var headerHeight = document.getElementById('header').clientHeight
var footerHeight = document.getElementById('footer').clientHeight
var footerWidth = document.getElementById('footer').clientWidth
const messages = document.getElementById('messageBox');
const textbox = document.getElementById("textBox");
const stopB = document.getElementById("b1");
const sendB = document.getElementById("b2");
const startB = document.getElementById("b3");
const newB = document.getElementById("b4");
const constMsg = document.getElementById("constMsg");
const typing = document.getElementById("typing");
messages.style.marginTop = headerHeight + "px";
startState();
var closedBy;
var socket;

var html = document.documentElement;
var height = Math.max(  //  <---------------------------- entire document height
  html.clientHeight, html.scrollHeight, html.offsetHeight
);
var width = Math.max(  //  <---------------------------- entire document width
  html.clientWidth, html.scrollWidth, html.offsetWidth
);
if (width > 680) {
  messages.style.marginLeft = 25 + "%";
  messages.style.width = 50 + "%";
  messages.style.border = "2px solid grey";
  messages.style.borderRadius = "5px";
  textbox.style.width = 69 + "%"
} else {
  messages.style.width = 100 + "%";
  textbox.style.width =  68 + "%";
}
height = height - headerHeight - footerHeight;
messages.style.height = (height - 10) + "px";
console.log('entire document height: ' + height + 'px');
console.log('entire document width: ' + width + 'px');

stopB.style.height = footerHeight + "px";
newB.style.height = footerHeight + "px";
sendB.style.height = footerHeight + "px";
startB.style.height = footerHeight + "px";
textBox.style.width = footerWidth;

function appendMessage(value, fontStyle, textPos) {
  const message = document.createElement('p');
  const arrow = document.createElement('i');
  message.style.fontWeight = fontStyle;
  message.style.textAlign = textPos;
  const newMessage = document.createTextNode(value+" ");
  if(textPos === 'left'){
    arrow.classList.add('arrow')
    arrow.classList.add('right')
    message.appendChild(arrow);
    message.appendChild(newMessage)}
  if(textPos === 'right'){
    message.appendChild(newMessage)
    arrow.classList.add('arrow')
    arrow.classList.add('left')
    message.appendChild(arrow);
    if (width > 680) {
    message.append('\u00A0');
    }else{message.append('\u00A0\u00A0\u00A0');}
    }
  messages.appendChild(message);
}

function appendConstMessage(value, fontStyle, textPos) {
  constMsg.style.fontWeight = fontStyle;
  constMsg.style.textAlign = textPos;
  constMsg.innerHTML = value;
}

function getMessages() {
  let textt;
  if (width > 680) {
    textt = '\u00A0\u00A0' + textbox.value
  } else {
    textt = textbox.value
  }
  appendMessage(textt, "normal", "left");
  var data = JSON.stringify({
    'type': "msg",
    'value': textbox.value
  })
  socket.send(data);
  textBox.value = "";
  scrollToBottom();
}

function scrollToBottom() {
  messages.scrollTop = messages.scrollHeight;
}

textbox.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    event.preventDefault();
    sendB.click();
  }
});

function connectToStranger() {

  connectedState();

  if ("WebSocket" in window) {
    // Let us open a web socket
    var ws = new WebSocket("ws://freerandomchat.herokuapp.com/connect");
    socket = ws;

    ws.onopen = function () {

      // Web Socket is connected
    };

    ws.onmessage = function (evt) {
      const obj = JSON.parse(evt.data);
      if (obj.flag === 'start') {
        appendConstMessage(obj.msg + '\u00A0\u00A0\u00A0', "Bold", "left");
      }
      else if (obj.flag === 'typing') {
        if (obj.msg) {
          typing.style.visibility = 'visible'
        } else {
          typing.style.visibility = 'hidden'
        }
      }
      else if (obj.flag === 'disconnect') {
        socket.close();
        closedBy = false;
        startState();
      }
      else {
        appendMessage(obj.msg, "normal", "right");
      }
    };

    ws.onclose = function (env) {

      console.log(env);
      // websocket is closed.
      if (closedBy) {
        appendMessage("You have disconnected", "Bold", "center");
        startState();
      }
      else { appendMessage("Stranger has disconnected", "Bold", "center");}
      closedBy = false;
    };
  } else {

    // The browser doesn't support WebSocket
    alert("WebSocket NOT supported by your Browser!");
  }
}

stopB.onclick = function () {
  // Close the connection, if open.
  if (socket.readyState === WebSocket.OPEN) {
    var data = JSON.stringify({
      'type': "disconnect",
      'value': true
    })
    socket.send(data);
  }
  socket.close();
  closedBy = true;
}

newB.onclick = function () {
  clearBox();
  // create the connection
  connectToStranger();
}
sendB.onclick = function () {
  getMessages();
}
startB.onclick = function () {
  clearBox();
  // create the connection
  connectToStranger();
}

function isTyping() {
  var data = JSON.stringify({
    'type': "typing",
    'value': true
  })
  socket.send(data);
}

function notTyping() {
  var data = JSON.stringify({
    'type': "typing",
    'value': false
  })
  socket.send(data);
}

function startState() {
  sendB.style.visibility = 'hidden';
  stopB.style.visibility = 'hidden';
  newB.style.visibility = 'visible';
  typing.style.visibility = 'hidden';
  startB.style.visibility = 'visible';
  textbox.disabled = true;
}

function connectedState() {
  startB.style.visibility = 'hidden';
  sendB.style.visibility = 'visible';
  stopB.style.visibility = 'visible';
  newB.style.visibility = 'hidden';
  stopB.disabled = false;
  textbox.disabled = false;
}

function clearBox()
{
	messages.innerHTML = "";
	constMsg.innertHTML = "";
	messages.appendChild(constMsg);
	messages.appendChild(typing);
	
}