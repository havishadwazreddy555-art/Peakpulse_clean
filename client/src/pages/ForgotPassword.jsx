import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getApiUrl } from '../config';

export default function ForgotPassword() {
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [step, setStep] = useState(1); // 1: Phone, 2: OTP/Reset
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);
    const navigate = useNavigate();

    const handleRequestOtp = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            const res = await fetch(getApiUrl('/api/auth/forgot-password'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone_number: phone })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setMessage(`Done! OTP sent to ${phone}. (Check console for demo code)`);
            if (data.otp_simulated) alert(`DEMO MODE: Your OTP is ${data.otp_simulated}`);
            setStep(2);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleReset = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            const res = await fetch(getApiUrl('/api/auth/reset-password'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone_number: phone, otp, new_password: newPassword })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            alert('Password changed successfully! You can now login.');
            navigate('/login');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="flex items-center justify-center p-4" style={{
            minHeight: '100vh',
            background: 'radial-gradient(circle at top right, #0284c7 0%, transparent 40%), radial-gradient(circle at bottom left, #f59e0b 0%, transparent 40%)',
        }}>
            <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '400px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <h2 className="text-center text-xl mb-6">Reset Password</h2>

                {error && <div className="text-red p-3 mb-4 rounded bg-opacity-10 bg-red-500 text-center">{error}</div>}
                {message && <div className="p-3 mb-4 rounded bg-opacity-10 bg-green-500 text-green-400 text-center">{message}</div>}

                {step === 1 && (
                    <form onSubmit={handleRequestOtp} className="flex flex-col gap-4">
                        <div>
                            <label className="text-sm mb-1 block">Registered Phone Number</label>
                            <input
                                className="input"
                                type="tel"
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                                required
                                placeholder="+1 234..."
                            />
                        </div>
                        <button type="submit" className="btn btn-primary w-full">Send OTP</button>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleReset} className="flex flex-col gap-4">
                        <div>
                            <label className="text-sm mb-1 block">Enter OTP</label>
                            <input
                                className="input"
                                type="text"
                                value={otp}
                                onChange={e => setOtp(e.target.value)}
                                required
                                placeholder="1234"
                            />
                        </div>
                        <div>
                            <label className="text-sm mb-1 block">New Password</label>
                            <input
                                className="input"
                                type="password"
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                required
                                placeholder="******"
                            />
                        </div>
                        <button type="submit" className="btn btn-primary w-full">Reset Password</button>
                        <button type="button" onClick={() => setStep(1)} className="btn btn-ghost w-full">Change Phone Number</button>
                    </form>
                )}

                <div className="mt-6 text-center">
                    <Link to="/login" style={{ color: 'var(--primary)' }}>Back to Login</Link>
                </div>
            </div>
        </div>
    );
}
