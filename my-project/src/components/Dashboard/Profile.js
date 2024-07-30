import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Input, Typography, Button } from 'antd';
import ProgressBar from './ProgressBar'; 

const { Title } = Typography;

const Profile = () => {
  const [profile, setProfile] = useState({});
  const [totalIncome, setTotalIncome] = useState(0);
  const [remainingIncome, setRemainingIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/profile', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setProfile(response.data);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      }
    };

    fetchProfile();
    const storedTotalIncome = localStorage.getItem('Income');
    if (storedTotalIncome) {
      setTotalIncome(Number(storedTotalIncome));
    }
  }, []);


  useEffect(() => {
    const fetchIncome = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/income', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const income = response.data.income; 
        setTotalIncome(income);
        setRemainingIncome(income - totalExpenses); 
      } catch (error) {
        console.error('Failed to fetch income:', error);
      }
    };

    fetchIncome();
  }, [totalExpenses])

  const handleIncomeChange = (e) => {
    const income = Number(e.target.value);
    setTotalIncome(income);
    setRemainingIncome(income - totalExpenses);
  };

  const handleReset = () => {
    setTotalIncome(0);
    setRemainingIncome(0);
    setTotalExpenses(0);
    localStorage.removeItem('totalIncome');
  };

  const calculateTotalExpenses = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/expenses', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const total = response.data.expenses.reduce((acc, expense) => acc + expense.amount, 0);
      setTotalExpenses(total);
      setRemainingIncome(totalIncome - total);
    } catch (error) {
      console.error('Failed to fetch expenses:', error);
    }
  };

  return (
    <div>
      <Title level={2}>Welcome, {profile.name}</Title>
      <div>
        <h3>Total Income:</h3>
        <Input
          type="number"
          placeholder="Enter total income"
          value={totalIncome}
          onChange={handleIncomeChange}
        />
      </div>
      
      <ProgressBar 
        totalIncome={totalIncome} 
        totalExpenses={totalExpenses} 
        remainingIncome={remainingIncome} 
      /> 
      
      <Button onClick={handleReset} type="primary" danger style={{ marginTop: '20px', marginRight: '10px', marginBottom: '20px' }}>
        Reset
      </Button>

      <Button onClick={calculateTotalExpenses} type="primary" style={{ marginTop: '20px' }}>
        Calculate Total Expenses
      </Button>
    </div>
  );
};

export default Profile;


