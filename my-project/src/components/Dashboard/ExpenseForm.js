import axios from 'axios';
import { Form, Input, Button, DatePicker, Select, message } from 'antd';

const { Option } = Select;

const ExpenseForm = ({ onAddExpense }) => {
  const [form] = Form.useForm();

  const handleFinish = async (values) => {
    try {
      const response = await axios.post('http://localhost:3000/api/expenses', {
        ...values,
        date: values.date.format('YYYY-MM-DD'), 
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      message.success('Expense added successfully');
      form.resetFields();
      onAddExpense(response.data); // Call the callback with the new expense
    } catch (error) {
      console.error('Failed to add expense:', error);
      
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      style={{ marginBottom: '24px' }}
    >
      <Form.Item name="amount" label="Amount" rules={[{ required: true, message: 'Please input the amount!' }]}>
        <Input type="number" />
      </Form.Item>
      <Form.Item name="category" label="Category" rules={[{ required: true, message: 'Please select a category!' }]}>
        <Select>
          <Option value="Food">Food</Option>
          <Option value="Transport">Transport</Option>
          <Option value="Entertainment">Entertainment</Option>
          <Option value="Costumes">Costumes</Option>
          <Option value="Other">Other</Option>
        </Select>
      </Form.Item>
      <Form.Item name="date" label="Date" rules={[{ required: true, message: 'Please select the date!' }]}>
        <DatePicker format="YYYY-MM-DD" />
      </Form.Item>
      <Form.Item name="description" label="Description">
        <Input.TextArea rows={4} />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit">Add Expense</Button>
      </Form.Item>
    </Form>
  );
};

export default ExpenseForm;

