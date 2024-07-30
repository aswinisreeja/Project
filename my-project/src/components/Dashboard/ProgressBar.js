
import React from 'react';
import { Progress, Card } from 'antd';

const ProgressBar = ({ totalIncome, totalExpenses, remainingIncome }) => {
  const percentage = totalIncome ? ((remainingIncome / totalIncome) * 100).toFixed(2) : 0;

  return (
    <Card title="Income Progress">
      <div>
        <h3>Total Income: ₹{totalIncome}</h3>
        <h3>Total Expenses: ₹{totalExpenses}</h3>
        <h3>Remaining Income: ₹{remainingIncome}</h3>
        <Progress percent={percentage} status="active" />
      </div>
    </Card>
  );
};

export default ProgressBar;
