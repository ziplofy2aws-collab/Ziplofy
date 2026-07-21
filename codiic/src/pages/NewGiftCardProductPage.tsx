import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import GiftCardProductForm from '../components/products/GiftCardProductForm';

const NewGiftCardProductPage: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = useCallback(() => {
    navigate('/products/gift-cards');
  }, [navigate]);

  const handleSuccess = useCallback(() => {
    navigate('/products/gift-cards');
  }, [navigate]);

  return (
    <GiftCardProductForm
      onBack={handleBack}
      onSuccess={handleSuccess}
    />
  );
};

export default NewGiftCardProductPage;
