import React from 'react';
import { useNavigate } from 'react-router-dom';
import { NewProductForm } from '../components/products/NewProductForm';

const NewProductPage: React.FC = () => {
  const navigate = useNavigate();

  return <NewProductForm variant="page" onBack={() => navigate('/products')} />;
};

export default NewProductPage;
