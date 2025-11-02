import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getCurrentUserAsync } from '../store/slices/authSlice';

const AuthInitializer = ({ children }) => {
  const dispatch = useDispatch();
  const { tokens, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (tokens.accessToken && !user) {
      dispatch(getCurrentUserAsync()).catch((error) => {
        console.warn('Failed to get current user:', error);
      });
    }
  }, [dispatch, tokens.accessToken, user]);

  return children;
};

export default AuthInitializer;

