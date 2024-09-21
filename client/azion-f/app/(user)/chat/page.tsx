"use client";
import React, { useState, useEffect } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import axios from "axios";
import { UserData } from "@/app/func/funcs";
import { apiUrl } from "@/app/api/config";

const ChatPage = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState<string>("");
  const [receiver, setReceiver] = useState<string>("");

  useEffect(() => {
    UserData().then((data) => {
      axios.get(`${apiUrl}/chat/messages?user=${data.email}`)
        .then((response) => {
          setMessages(response.data.map((msg: any) => `${msg.sender}: ${msg.message}`));
        });

      const socket = new SockJS(`${apiUrl}/chat`);
      const client = new Client({
        webSocketFactory: () => socket,
        onConnect: () => {
          client.subscribe(`/user/queue/messages`, (message) => {
            setMessages((prevMessages) => [...prevMessages, message.body]);
          });
        },
      });

      client.activate();

      return () => {
        client.deactivate();
      };
    });
  }, []);

  const sendMessage = () => {
    const socket = new SockJS(`${apiUrl}/chat/sendMessage`);
    const client = new Client({
      webSocketFactory: () => socket,
    });

    client.onConnect = () => {
      UserData().then((data) => {
        client.publish({
          destination: "/app/sendMessage",
          body: JSON.stringify({ message: input, sender: data.email, receiver: receiver }),
        });
      });
    };

    client.activate();
    setInput("");
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
      <input
        className="border-2 border-gray-300"
        type="text"
        value={receiver}
        onChange={(e) => setReceiver(e.target.value)}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default ChatPage;