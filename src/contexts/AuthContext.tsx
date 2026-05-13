import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authApi } from '../services/api';
import type { User, LoginRequest, RegistrationRequest, UpdateProfileRequest } from '../types';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (data: LoginRequest) => Promise<string>;
    register: (data: RegistrationRequest) => Promise<void>;
    logout: () => void;
    updateProfile: (data: UpdateProfileRequest) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const userData = await authApi.getMe();
                    setUser(userData);
                } catch (error) {
                    localStorage.removeItem('token');
                }
            }
            setIsLoading(false);
        };

        initAuth();
    }, []);

    const login = async (data: LoginRequest) => {
        const response = await authApi.login({
            email: data.email,
            password: data.password
        });
        localStorage.setItem('token', response.token);
        const me = await authApi.getMe();
        setUser(me);
        return response.token;
    };

    const register = async (data: RegistrationRequest) => {
        await authApi.register({
            ...data,
            deviceInfo: getDeviceInfo(),
        });
        await login({ email: data.email, password: data.password });
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    const updateProfile = async (data: UpdateProfileRequest) => {
        const updatedUser = await authApi.updateProfile(data);
        setUser(updatedUser);
    };

    const getDeviceInfo = () => {
        const ua = navigator.userAgent;
        let deviceType = 'Web';

        if (/Mobile|Android/i.test(ua)) {
            deviceType = 'Mobile';
        } else if (/Tablet|iPad/i.test(ua)) {
            deviceType = 'Tablet';
        }

        return `${deviceType} - ${ua}`;
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
