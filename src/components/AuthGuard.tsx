import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import getDeviceToken from '@/lib/deviceToken';
import { cachedUserCheck } from '@/lib/apiCache';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  const navigate = useNavigate();
  const [isAuth, setIsAuth] = useState<boolean | null>(null);

  useEffect(() => {
    const check = async () => {
      const savedUser = localStorage.getItem('chessUser');
      if (!savedUser) {
        navigate('/', { replace: true });
        return;
      }

      try {
        const userData = JSON.parse(savedUser);
        const rawId = userData.email || userData.name || 'anonymous';
        const userId = 'u_' + rawId.replace(/[^a-zA-Z0-9@._-]/g, '').substring(0, 60);
        const dt = getDeviceToken();
        const data = await cachedUserCheck(userId, dt);

        if (data.exists && data.session_valid !== false) {
          setIsAuth(true);
        } else {
          localStorage.removeItem('chessUser');
          navigate('/', { replace: true });
        }
      } catch {
        setIsAuth(true);
      }
    };
    check();
  }, [navigate]);

  if (isAuth === null) return null;
  return <>{children}</>;
};

export default AuthGuard;