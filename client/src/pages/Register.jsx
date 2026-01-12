import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

import { getApiUrl } from '../config';

export default function Register() {
    const [formData, setFormData] = useState({ name: '', phone_number: '', password: '', language: 'en' });
    const [error, setError] = useState(null);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            const res = await fetch(getApiUrl('/api/auth/register'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            login(data.token, data.user);
            navigate('/');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="flex items-center justify-center p-4" style={{
            minHeight: '100vh',
            background: 'radial-gradient(circle at top right, #0284c7 0%, transparent 40%), radial-gradient(circle at bottom left, #f59e0b 0%, transparent 40%)',
            position: 'relative',
        }}>
            <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '400px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', fontSize: '1.5rem', color: '#fff' }}>Create Account</h2>

                {error && <div className="text-red p-4" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '0.5rem', marginBottom: '1rem' }}>{error}</div>}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="text-sm">Full Name</label>
                        <input className="input" type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required placeholder="John Doe" />
                    </div>
                    <div>
                        <label className="text-sm">Phone Number (ID)</label>
                        <input className="input" type="tel" value={formData.phone_number} onChange={e => setFormData({ ...formData, phone_number: e.target.value })} required placeholder="+1 234..." />
                    </div>
                    <div>
                        <label className="text-sm">Password</label>
                        <input className="input" type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} required />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Register</button>
                </form>

                <div className="mt-6 text-center">
                    <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Already have an account? Login</Link>
                </div>
            </div>
        </div>
    );
}
