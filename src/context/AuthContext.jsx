import { useState, useEffect } from "react";
import API from "../services/api";

import { AuthContext } from "./AuthContextValue";

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const checkUser = async () => {
        const start = Date.now();
        try {
            const res = await API.get("/auth/me");
            if (res.data.success) {
                setUser(res.data.user);
            } else {
                setUser(null);
            }
        } catch (err) {
            console.error(err);
            setUser(null);
        } finally {
            const elapsed = Date.now() - start;
            const minDelay = 3000;
            if (elapsed < minDelay) {
                await new Promise((resolve) =>
                    setTimeout(resolve, minDelay - elapsed),
                );
            }
            setLoading(false);
        }
    };

    useEffect(() => {
        queueMicrotask(checkUser);
    }, []);

    const register = async (userData) => {
        const res = await API.post("/auth/register", userData);
        if (res.data.success) {
            setUser(res.data.user);
            return res.data;
        }
        throw new Error(res.data.message || "Registration failed");
    };

    const login = async (email, password) => {
        const res = await API.post("/auth/login", { email, password });
        if (res.data.success) {
            setUser(res.data.user);
            return res.data;
        }
        throw new Error(res.data.message || "Login failed");
    };

    const logout = async () => {
        try {
            await API.post("/auth/logout");
        } catch (e) {
            console.error(e);
        }
        setUser(null);
    };

    const isExclusiveAdmin =
        user &&
        user.email?.toLowerCase() === "mohamed@gmail.com" &&
        user.role === "admin";

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                register,
                login,
                logout,
                isExclusiveAdmin,
                checkUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
