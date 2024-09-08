"use client";
import { useState } from 'react';
import axios, { AxiosResponse } from 'axios';
import Link from 'next/link';
import { apiUrl } from "@/app/api/config";

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    axios.put(`${apiUrl}/auth/forgot-password`, { email }, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(function (response: AxiosResponse) {
      setMessage(response.data);
    })
    .catch(function (error: any) {
      if (error.response && error.response.status === 401) {
        setMessage('Unauthorized: Please check your credentials.');
      } else {
        setMessage('Error sending password reset email');
      }
    });
  };

  return (
    <div>
      <h1>Forgot Password</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <button type="submit">Send Reset Link</button>
      </form>
      {message && <p>{message}</p>}
      <Link href="/login">Back to Login</Link>
    </div>
  );
};

export default ForgotPassword;