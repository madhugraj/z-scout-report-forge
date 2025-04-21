
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import LandingPage from '@/components/LandingPage';

const Index = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Ensure we stay on the landing page without unnecessary redirects
    navigate('/', { replace: true });
  }, [navigate]);
  
  return <LandingPage />;
};

export default Index;
