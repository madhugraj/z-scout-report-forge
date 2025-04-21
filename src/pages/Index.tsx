
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import LandingPage from '@/components/LandingPage';

const Index = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to landing page component
    navigate('/', { replace: true });
  }, [navigate]);
  
  return <LandingPage />;
};

export default Index;
