import React from 'react';
import axios from 'axios';
import { Form, Input, Button, message } from 'antd';

const EditProfile = ({ user, onProfileUpdate }) => {
  const [form] = Form.useForm();

  const handleSubmit = async (values) => {
    try {
      const response = await axios.put('http://localhost:3000/api/profile', values, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      message.success(response.data.message);
      onProfileUpdate(); 
    } catch (error) {
      console.error('Failed to update profile:', error);
      message.error('Failed to update profile');
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{ email: user.email }}
      onFinish={handleSubmit}
    >
      <Form.Item name="email" label="Email">
        <Input />
      </Form.Item>
      <Form.Item name="password" label="Password">
        <Input.Password />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit">Update Profile</Button>
      </Form.Item>
    </Form>
  );
};

export default EditProfile;

