import React from 'react';
import { useLocation } from 'react-router-dom';
import InternRating from '../components/rating/InternRating';

const InternRatingPage = () => {
  const location = useLocation();

  return <InternRating refreshKey={location.pathname} />;
};

export default InternRatingPage;
