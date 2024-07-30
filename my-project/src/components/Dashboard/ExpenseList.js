import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Button } from 'antd';

const ExpenseList = ({ onTotalExpenseChange }) => {
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/expenses', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setExpenses(response.data.expenses);
      } catch (error) {
        console.error('Failed to fetch expenses:', error);
      }
    };

    fetchExpenses();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/api/expenses/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setExpenses(expenses.filter(expense => expense.id !== id));
    } catch (error) {
      console.error('Failed to delete expense:', error);
    }
  };


  const columns = [
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (text) => new Date(text).toLocaleDateString(),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button onClick={() => handleDelete(record.id)} type="link" danger>
          Delete
        </Button>
      ),
    },
  ];

  return (
    <div>
   
      <Table
        dataSource={expenses}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default ExpenseList;
