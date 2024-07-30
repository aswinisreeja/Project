// src/components/Shared/Navbar.js
import React from 'react';
import { Link } from 'react-router-dom';
import { Menu } from 'antd';

const Navbar = () => {
  return (
    <Menu mode="horizontal">
      <Menu.Item><Link to="/dashboard">Dashboard</Link></Menu.Item>
      <Menu.Item><Link to="/login">Login</Link></Menu.Item>
      <Menu.Item><Link to="/register">Register</Link></Menu.Item>
    </Menu>
  );
};

export default Navbar;
