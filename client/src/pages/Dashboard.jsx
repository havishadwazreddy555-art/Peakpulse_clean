import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import ActivityForm from '../components/ActivityForm';
import ActivityList from '../components/ActivityList';
import { Plane, Wind, Waves, Footprints, Umbrella } from 'lucide-react';

import { getApiUrl } from '../config';

export default function Dashboard() {
    const { user, logout } = useAuth();
    const { t } = useTranslation();
    const [activities, setActivities] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [selectedSport, setSelectedSport] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchActivities = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(getApiUrl('/api/activities'), {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setActivities(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchActivities();
    }, []);

    const handleSave = async (activity) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(getApiUrl('/api/activities'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(activity)
            });
            if (res.ok) {
                setShowForm(false);
                fetchActivities();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure?')) return;
        try {
            const token = localStorage.getItem('token');
            await fetch(getApiUrl(`/api/activities/${id}`), {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchActivities();
        } catch (err) {
            console.error(err);
        }
    };

    const handleReset = async () => {
        if (!window.confirm('Reset all demo data?')) return;
        try {
            const token = localStorage.getItem('token');
            await fetch(getApiUrl('/api/admin/reset-demo'), {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchActivities();
            alert('Data reset.');
        } catch (err) {
            console.error(err);
        }
    };

    const handleExport = () => {
        const headers = ['Date', 'Time', 'Sport', 'Location', 'Distance (km)', 'Height (m)', 'Depth (m)', 'Notes'];
        const csvContent = [
            headers.join(','),
            ...activities.map(act => [
                act.date,
                act.time,
                act.sport_type,
                `"${act.location || ''}"`,
                act.distance,
                act.height || '',
                act.depth || '',
                `"${act.notes || ''}"`
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `activities_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="p-4">
            <header className="flex justify-between items-center" style={{ marginBottom: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="flex items-center gap-4">
                    <img src="/logo.png" alt="Logo" style={{ width: '50px', height: '50px', borderRadius: '50%' }} />
                    <h1>PeakPulse <span style={{ fontSize: '0.8em', opacity: 0.7, fontWeight: 400 }}>| Welcome, {user?.username}</span></h1>
                </div>
                <div className="flex gap-4">
                    <button onClick={handleReset} className="btn btn-outline">{t('adminReset')}</button>
                    <button onClick={logout} className="btn btn-outline">{t('logout')}</button>
                </div>
            </header>

            {/* Stats removed as per user request */}

            {/* Activity Selection Area */}
            {!showForm && (
                <div style={{ marginTop: '3rem' }}>
                    <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ color: 'var(--primary)' }}>+</span> {t('addActivity')}
                    </h2>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '1.5rem'
                    }}>
                        <button
                            onClick={() => { setSelectedSport('skydiving'); setShowForm(true); }}
                            className="card flex flex-col items-center justify-center gap-4 btn-outline"
                            style={{ height: '180px', border: '1px solid rgba(14, 165, 233, 0.3)', background: 'rgba(14, 165, 233, 0.05)', transition: 'transform 0.2s', cursor: 'pointer' }}
                        >
                            <img
                                src="/skydiving_logo.jpg"
                                alt="Skydiving"
                                className="animate-float"
                                style={{ width: '80px', height: '80px', objectFit: 'contain', filter: 'drop-shadow(0 0 15px rgba(56, 189, 248, 0.6))', borderRadius: '50%' }}
                            />
                            <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>Skydiving</span>
                        </button>

                        <button
                            onClick={() => { setSelectedSport('indoor_skydiving'); setShowForm(true); }}
                            className="card flex flex-col items-center justify-center gap-4 btn-outline"
                            style={{ height: '180px', border: '1px solid rgba(168, 85, 247, 0.3)', background: 'rgba(168, 85, 247, 0.05)', transition: 'transform 0.2s', cursor: 'pointer' }}
                        >
                            <img
                                src="/indoor_skydiving_logo.png"
                                alt="Indoor Skydiving"
                                className="animate-float"
                                style={{ width: '80px', height: '80px', objectFit: 'contain', filter: 'drop-shadow(0 0 15px rgba(168, 85, 247, 0.6))', borderRadius: '12px' }}
                            />
                            <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>Indoor Skydiving</span>
                        </button>

                        <button
                            onClick={() => { setSelectedSport('scuba_diving'); setShowForm(true); }}
                            className="card flex flex-col items-center justify-center gap-4 btn-outline"
                            style={{ height: '180px', border: '1px solid rgba(6, 182, 212, 0.3)', background: 'rgba(6, 182, 212, 0.05)', transition: 'transform 0.2s', cursor: 'pointer' }}
                        >
                            <img
                                src="/scuba_diving_icon.png"
                                alt="Scuba Diving"
                                className="animate-float"
                                style={{ width: '80px', height: '80px', objectFit: 'contain', filter: 'drop-shadow(0 0 15px rgba(6, 182, 212, 0.6))' }}
                            />
                            <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>Scuba Diving</span>
                        </button>

                        <button
                            onClick={() => { setSelectedSport('running'); setShowForm(true); }}
                            className="card flex flex-col items-center justify-center gap-4 btn-outline"
                            style={{ height: '180px', border: '1px solid rgba(34, 197, 94, 0.3)', background: 'rgba(34, 197, 94, 0.05)', transition: 'transform 0.2s', cursor: 'pointer' }}
                        >
                            <Footprints size={48} color="#22c55e" />
                            <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>Running</span>
                        </button>
                    </div>
                </div>
            )}

            <div style={{ marginTop: '3rem' }} className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-4">
                    <h2>{t('activities')}</h2>
                    <button onClick={handleExport} className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>Export CSV</button>
                </div>
            </div>

            {showForm && (
                <div style={{ marginBottom: '2rem' }}>
                    <ActivityForm
                        initialSport={selectedSport}
                        onSave={handleSave}
                        onCancel={() => { setShowForm(false); setSelectedSport(null); }}
                    />
                </div>
            )}

            {loading ? <div>Loading...</div> : <ActivityList activities={activities} onDelete={handleDelete} />}
        </div>
    );
}
