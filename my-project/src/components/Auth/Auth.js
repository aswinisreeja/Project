import React, { useState } from 'react';
import axios from 'axios';
import { Button, Input, Form, Typography, Divider, notification } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const Auth = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const openNotificationWithIcon = (type, message, description) => {
    notification[type]({
      message: message,
      description: description,
    });
  };

  const handleSubmit = async () => {
    try {
      if (isRegistering) {
        await axios.post('http://localhost:3000/api/register', { email, password });
        navigate('/'); 
      } else {
        const response = await axios.post('http://localhost:3000/api/login', { email, password });
        localStorage.setItem('token', response.data.token);
        navigate('/dashboard'); 
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 409) {
          openNotificationWithIcon('error', 'Registration Failed', 'Username already exists.');
        } else if (error.response.status === 401) {
          openNotificationWithIcon('error', 'Login Failed', 'Invalid email or password.');
        } else {
          openNotificationWithIcon('error', 'Error', error.response.data.message);
        }
      } else {
        console.error('Failed to process request:', error);
        openNotificationWithIcon('error', 'Error', 'Something went wrong. Please try again.');
      }
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: 'auto', padding: '20px' }}>
      <Title level={2}>{isRegistering ? 'Register' : 'Login'}</Title>
      <Form onFinish={handleSubmit}>
        <Form.Item>
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Form.Item>
        <Form.Item>
          <Input.Password
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Item>
        <Button type="primary" htmlType="submit">
          {isRegistering ? 'Register' : 'Login'}
        </Button>
      </Form>
      <Divider />
      <Button type="link" onClick={() => setIsRegistering(!isRegistering)}>
        {isRegistering ? 'Already have an account? Login' : 'Don\'t have an account? Register'}
      </Button>
    </div>
  );
};

export default Auth;
