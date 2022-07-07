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
const userCount = document.getElementById("userCount");
messages.style.marginTop = headerHeight + "px";
startState();
var closedBy;
var socket;

getTotalUsers();
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
  stopB.style.width = "15%";
  newB.style.width = "15%";
  sendB.style.width = "15%";
  startB.style.width = "15%";
  textbox.style.left = "15.3%";
} else {
  messages.style.width = 100 + "%";
  textbox.style.width = 60 + "%";
  stopB.style.width = "18%";
  newB.style.width = "18%";
  sendB.style.width = "18%";
  startB.style.width = "18%";
  textbox.style.left = "19.3%";
}
height = height - headerHeight - footerHeight;
messages.style.height = (height - 10) + "px";
console.log('entire document height: ' + height + 'px');
console.log('entire document width: ' + width + 'px');

stopB.style.height = footerHeight + "px";
newB.style.height = footerHeight + "px";
sendB.style.height = footerHeight + "px";
startB.style.height = footerHeight + "px";
//textBox.style.width = footerWidth;

function appendMessage(value, fontStyle, textPos) {
  const message = document.createElement('p');
  const arrow = document.createElement('div');
  message.style.fontWeight = fontStyle;
  message.style.textAlign = textPos;
  const newMessage = document.createTextNode(value + " ");
  if (textPos === 'left') {
    arrow.classList.add('arrowRight')
    //arrow.classList.add('right')
    message.appendChild(arrow);
    if (width < 680) {
      message.append('\u00A0');
    }
    message.appendChild(newMessage)
  }
  else if (textPos === 'right') {
    message.appendChild(newMessage)
    arrow.classList.add('arrowLeft')
    //arrow.classList.add('left')
    message.appendChild(arrow);
    if (width > 680) {
      message.append('\u00A0');
    } else { message.append('\u00A0\u00A0\u00A0'); }
  } else { message.appendChild(newMessage) }
  messages.appendChild(message);
}

function appendConstMessage(value, fontStyle, textPos) {
  constMsg.style.fontWeight = fontStyle;
  constMsg.style.textAlign = textPos;
  if (value.trim() === "You are connected to stranger.") {
    sendB.disabled = false;
    textbox.disabled = false;
  }
  constMsg.innerHTML = value;
}

function getMessages() {
  if (textBox.value.trim() != "") {
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
    var ws = new WebSocket("wss://freerandomchat.herokuapp.com/connect");
    socket = ws;

    ws.onopen = function () {

      // Web Socket is connected
    };

    ws.onmessage = function (evt) {
      const obj = JSON.parse(evt.data);
      if (obj.flag === 'start') {
        appendConstMessage(obj.msg, "Bold", "left");
        userCount.innerHTML = "Total Users: " + obj.totalUser;
      }
      else if (obj.flag === 'typing') {
        if (obj.msg) {
          typing.style.visibility = 'visible'
        } else {
          typing.style.visibility = 'hidden'
        }
      }
      else if (obj.flag === 'disconnect') {
        userCount.innerHTML = "Total Users: " + obj.totalUser;
        socket.close();
        closedBy = false;
        startState();
      }
      else {
        appendMessage(obj.msg, "normal", "right");
        userCount.innerHTML = "Total Users: " + obj.totalUser;
      }
    };

    ws.onclose = function (env) {

      console.log(env);
      // websocket is closed.
      if (closedBy) {
        appendMessage("You have disconnected", "Bold", "center");
        startState();
      }
      else if (constMsg.innerHTML === "Searching for partner..." && !closedBy) {
        alert("Currently No user available Please try again later");
        appendConstMessage("Disconnected.", "Bold", "center");
        startState();
      }
      else { appendMessage("Stranger has disconnected", "Bold", "center"); }
      closedBy = false;
    };
  } else {

    // The browser doesn't support WebSocket
    alert("This site is not supported by your Browser! Please try using another browser or update your browser");
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
  closedBy = true;
  socket.close();
  getTotalUsers();
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
  textbox.value = "";
}

function connectedState() {
  startB.style.visibility = 'hidden';
  sendB.style.visibility = 'visible';
  stopB.style.visibility = 'visible';
  newB.style.visibility = 'hidden';
  stopB.disabled = false;
  sendB.disabled = true;
  textbox.disabled = true;
}

function clearBox() {
  messages.innerHTML = "";
  constMsg.innertHTML = "";
  messages.appendChild(constMsg);
  messages.appendChild(typing);

}

window.onbeforeunload = function () {
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

function getTotalUsers() {
  fetch('http://freerandomchat.herokuapp.com/getTotalUsers')
    .then(response => {
      return response.json();
    }).then(data => {
      userCount.innerHTML = "Total Users: " + data;
    })
}
