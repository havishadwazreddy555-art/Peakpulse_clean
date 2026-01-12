import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

import { getApiUrl } from '../config';

export default function Login() {
    const [id, setId] = useState(''); // ID = Phone
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState(null);
    const { login } = useAuth();
    const navigate = useNavigate();

    // Check for "Remember Me" on mount
    React.useEffect(() => {
        const savedId = localStorage.getItem('remember_id');
        const savedPass = localStorage.getItem('remember_pass'); // Note: In production, never store plaintext passwords
        if (savedId && savedPass) {
            setId(savedId);
            setPassword(savedPass);
            setRememberMe(true);
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            const res = await fetch(getApiUrl('/api/auth/login'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, password }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            if (rememberMe) {
                localStorage.setItem('remember_id', id);
                localStorage.setItem('remember_pass', password);
            } else {
                localStorage.removeItem('remember_id');
                localStorage.removeItem('remember_pass');
            }

            login(data.token, data.user);
            navigate('/');
        } catch (err) {
            setError(err.message);
        }
    };

    const handleGuest = async () => {
        try {
            const res = await fetch(getApiUrl('/api/auth/guest'), { method: 'POST' });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            login(data.token, data.user);
            navigate('/');
        } catch (err) {
            setError('Guest login failed');
        }
    };

    return (
        <div className="flex items-center justify-center p-4" style={{
            minHeight: '100vh',
            background: 'radial-gradient(circle at top right, #0284c7 0%, transparent 40%), radial-gradient(circle at bottom left, #f59e0b 0%, transparent 40%)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '400px', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="flex flex-col items-center mb-6">
                    <img src="/logo.png" alt="App Logo" style={{ width: '100px', height: '100px', borderRadius: '50%', marginBottom: '1rem', boxShadow: '0 0 20px rgba(56, 189, 248, 0.5)' }} />
                    <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#fff' }}>PeakPulse</h1>
                    <p className="text-sm">Not all those who wander are lost.</p>
                </div>

                {error && <div className="text-red p-4" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '0.5rem', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="text-sm">ID (Phone No)</label>
                        <input
                            className="input"
                            type="text"
                            placeholder="Enter your registered phone"
                            value={id}
                            onChange={e => setId(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="text-sm">Password</label>
                        <input
                            className="input"
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="remember"
                            checked={rememberMe}
                            onChange={e => setRememberMe(e.target.checked)}
                        />
                        <label htmlFor="remember" className="text-sm cursor-pointer">Remember me</label>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ height: '3rem', fontSize: '1.1rem' }}>Login</button>

                    <div className="text-center">
                        <Link to="/forgot-password" style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: '0.9rem' }}>Forgot Password?</Link>
                    </div>
                </form>

                <div className="divider" style={{ margin: '1.5rem 0', height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>

                <div className="flex flex-col gap-3">
                    <Link to="/register" className="btn btn-outline text-center" style={{ textDecoration: 'none' }}>Register New Account</Link>
                    <button onClick={handleGuest} className="btn btn-ghost" style={{ fontSize: '0.9rem', opacity: 0.8 }}>Continue as Guest</button>
                </div>
            </div>
        </div>
    );
}
