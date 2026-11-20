
import { createContext, useContext, useEffect, useState } from 'react';
import API from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check existing login when app starts
    useEffect(() => {
        const checkLogin = async () => {
            const token = localStorage.getItem('token');

            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const response = await API.get('/users/profile');
                setUser(response.data.user);
            } catch (error) {
                localStorage.removeItem('token');
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkLogin();
    }, []);

    // Register
    const register = async (name, email, password) => {
        const response = await API.post('/auth/register', {
            name,
            email,
            password,
        });

        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            setUser(response.data.user);
        }

        return response.data;
    };

    // Login
    const login = async (email, password) => {
        const response = await API.post('/auth/login', {
            email,
            password,
        });

        localStorage.setItem('token', response.data.token);
        setUser(response.data.user);

        return response.data;
    };

    // Logout
    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                register,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
