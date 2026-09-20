import { useAuthStore } from '../store/authStore';

export const useAuth = () => {
  const { user, isAuthenticated, isLoading, logout } = useAuthStore();
  
  return {
    user,
    isAuthenticated,
    isLoading,
    logout,
    isAdmin: user?.role === 'ADMIN'
  };
};
