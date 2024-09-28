"use client";
import React, { useState, useEffect } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { UserData } from "@/app/func/funcs";
import {chatUrl} from "@/app/api/config";

const ChatPage = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState<string>("");
  const [receiver, setReceiver] = useState<string>("");
  const [client, setClient] = useState<Client | null>(null);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    UserData().then((data) => {
      setUserEmail(data.email);
    });
  }, []);

  useEffect(() => {
    if (!userEmail) return;

    const socket = new SockJS(`${chatUrl}`);
    const stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
        console.log("Connected");

        stompClient.subscribe('/topic/messages', (message) => {
          if (message.body) {
            const newMessage = JSON.parse(message.body);
            console.log("Public message received:", newMessage);
            setMessages(prevMessages => [...prevMessages, `${newMessage.from}: ${newMessage.content}`]);
          }
        });

        stompClient.subscribe(`/user/${userEmail}/private`, (message) => {
          if (message.body) {
            const newMessage = JSON.parse(message.body);
            console.log("Private message received:", newMessage);
            setMessages(prevMessages => [...prevMessages, `Private from ${newMessage.from} to ${newMessage.to}: ${newMessage.content}`]);
          } else {
            console.log("Received empty private message");
          }
        });
      },
      onStompError: (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
        console.error('Additional details: ' + frame.body);
      }
    });

    stompClient.activate();
    setClient(stompClient);

    return () => {
      if (stompClient) stompClient.deactivate();
    };
  }, [userEmail]);

  const sendMessage = () => {
    if (client && client.connected) {
      const message = { content: input, from: userEmail };
      client.publish({ destination: "/app/sendMessage", body: JSON.stringify(message) });
      setInput("");
    }
  };

  const sendPrivateMessage = () => {
    if (client && client.connected && receiver) {
      const message = { content: input, from: userEmail, to: receiver };
      client.publish({ destination: "/app/privateMessage", body: JSON.stringify(message) });
      console.log("Private message sent:", message);
      setInput("");
    }
  };

  return (
    <div>
      <div>
        {messages.map((msg, index) => (
          <div key={index}>{msg}</div>
        ))}
      </div>
      <input
        className="border-2 border-gray-300"
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button onClick={sendMessage}>Send</button>

      <div>
        <input
          className="border-2 border-gray-300"
          type="text"
          placeholder="Enter receiver email"
          value={receiver}
          onChange={(e) => setReceiver(e.target.value)}
        />
        <button onClick={sendPrivateMessage}>Send Private Message</button>
      </div>
    </div>
  );
};

export default ChatPage;