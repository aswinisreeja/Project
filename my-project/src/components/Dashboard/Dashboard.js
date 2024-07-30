// src/components/Dashboard/Dashboard.js
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Layout, Menu, Avatar, Button, Typography } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import ExpenseList from './ExpenseList';
import ExpenseForm from './ExpenseForm';
import Profile from './Profile';
import EditProfile from '../Auth/Editprofile'; 

const { Header, Content, Sider } = Layout;
const { Title } = Typography;

const Dashboard = () => {
  const [user, setUser] = useState({});
  const [currentView, setCurrentView] = useState('profile'); 
  const navigate = useNavigate();

  const fetchUserProfile = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/profile', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      setUser(null); 
      navigate('/'); 
    }
  }, [navigate]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null); 
    navigate('/');
  };

  const handleMenuClick = (e) => {
    setCurrentView(e.key); 
  };

  const renderContent = () => {
    switch (currentView) {
      case 'expenses':
        return (
          <>
            <ExpenseForm />
            <ExpenseList />
          </>
        );
      case 'profile':
        return <Profile user={user} />;
      case 'edit-profile':
        return <EditProfile user={user} onProfileUpdate={fetchUserProfile} />; 
      default:
        return <ExpenseList />;
    }
  };

  
  const handleSendSummary = async () => {
    try {
      const response = await axios.post('http://localhost:3000/api/send-summary', {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      alert(response.data.message);
    } catch (error) {
      console.error('Failed to send summary:', error);
    }
  };

  const handleDownloadSummary = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/download-summary', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        responseType: 'blob', 
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'summary.pdf'); 
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Failed to download summary:', error);
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header className="header">
        <div className="logo" />
        <div style={{ float: 'right', display: 'flex', alignItems: 'center' }}>
          {user ? (
            <>
              <Avatar icon={<UserOutlined />} />
              <span style={{ marginLeft: '10px', color: '#1890ff' }}>{user.name}</span>
              <Button onClick={handleLogout} type="link" style={{ marginLeft: '20px' }}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button type="link" onClick={() => navigate('/')}>
                Login
              </Button>
              <Button type="link" onClick={() => navigate('/register')} style={{ marginLeft: '10px' }}>
                Register
              </Button>
            </>
          )}
        </div>
      </Header>
      <Layout>
        <Sider width={200} className="site-layout-background">
          <Menu
            mode="inline"
            defaultSelectedKeys={['profile']}
            style={{ height: '100%', borderRight: 0 }}
            onClick={handleMenuClick}
          >
            {user && <Menu.Item key="profile">Profile</Menu.Item>}
            {user && <Menu.Item key="edit-profile">Edit Profile</Menu.Item>}
            <Menu.Item key="dashboard">Dashboard</Menu.Item>
            <Menu.Item key="expenses">Expenses</Menu.Item>
          </Menu>
        </Sider>
        <Layout style={{ padding: '0 24px', minHeight: 280 }}>
          <Content style={{ padding: 24, margin: 0, minHeight: 280 }}>
            <Title level={2}>Expense Tracker</Title>
            {renderContent()}
            {currentView === 'dashboard' && (
              <div style={{ marginTop: '20px' }}>
                <Button onClick={handleSendSummary} type="primary" style={{ marginRight: '10px' }}>
                  Send Summary
                </Button>
                <Button onClick={handleDownloadSummary} type="primary">
                  Download Summary
                </Button>
              </div>
            )}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default Dashboard;
