import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { API_URL } from '../config/api';

const AuthContext = createContext(null);
const LOCAL_AUTH_USER_KEY = 'localMockAuthUser';
const isLocalAuthEnabled = import.meta.env.VITE_ENABLE_LOCAL_AUTH === 'true';

const getLocalAuthUser = () => {
    const rawUser = localStorage.getItem(LOCAL_AUTH_USER_KEY);
    if (!rawUser) return null;

    try {
        return JSON.parse(rawUser);
    } catch (error) {
        localStorage.removeItem(LOCAL_AUTH_USER_KEY);
        return null;
    }
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sessionExpired, setSessionExpired] = useState(false);
    const sessionExpiredRef = useRef(false);

    // Set default axios config
    axios.defaults.withCredentials = true;

    const handleSessionExpired = useCallback(() => {
        if (!sessionExpiredRef.current && user) {
            sessionExpiredRef.current = true;
            setUser(null);
            setSessionExpired(true);
        }
    }, [user]);

    const clearSessionExpired = useCallback(() => {
        setSessionExpired(false);
        sessionExpiredRef.current = false;
    }, []);

    // Listen for auth:expired custom event (from fetch/axios clients)
    useEffect(() => {
        const onExpired = () => handleSessionExpired();
        window.addEventListener('auth:expired', onExpired);
        return () => window.removeEventListener('auth:expired', onExpired);
    }, [handleSessionExpired]);

    const checkAuth = async () => {
        if (isLocalAuthEnabled) {
            setUser(getLocalAuthUser());
            setLoading(false);
            return;
        }

        try {
            const response = await axios.get(`${API_URL}/api/auth/check`);
            if (response.status === 200) {
                // response.data is { email, role, domain }
                setUser(response.data);
            }
        } catch (error) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const login = async (email, password) => {
        if (isLocalAuthEnabled) {
            if (email === 'admin' && password === 'joy') {
                const localUser = { email: 'admin', role: 'SYSOP', domain: 'local' };
                localStorage.setItem(LOCAL_AUTH_USER_KEY, JSON.stringify(localUser));
                setUser(localUser);
                return { success: true };
            }

            throw { message: 'Login failed. Please check your credentials.' };
        }

        try {
            const response = await axios.post(`${API_URL}/api/auth/login`, { email, password });
            await checkAuth();
            return { success: true };
        } catch (error) {
            console.error('Login failed', error);
            // 서버에서 반환한 에러 정보 전달
            if (error.response && error.response.data) {
                const data = error.response.data;
                // 서버가 문자열 또는 객체로 응답할 수 있음
                const message = typeof data === 'string' ? data : (data.message || 'Login failed');
                throw {
                    message,
                    locked: data.locked || false,
                    remaining: data.remaining
                };
            }
            throw { message: 'Login failed. Please check your credentials.' };
        }
    };

    const signup = async (email) => { // Removed password param
        try {
            await axios.post(`${API_URL}/api/auth/signup`, { email }); // Send only email
            return true;
        } catch (error) {
            console.error('Signup failed', error);
            throw error;
        }
    };

    const logout = async () => {
        if (isLocalAuthEnabled) {
            localStorage.removeItem(LOCAL_AUTH_USER_KEY);
            setUser(null);
            return;
        }

        try {
            await axios.post(`${API_URL}/api/auth/logout`);
            setUser(null);
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    const value = {
        user,
        loading,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'ADMIN' || user?.role === 'SYSOP' || user?.email === 'admin',
        isSysop: user?.role === 'SYSOP',
        sessionExpired,
        clearSessionExpired,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
