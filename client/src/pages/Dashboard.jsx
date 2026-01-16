import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import ActivityForm from '../components/ActivityForm';
import ActivityList from '../components/ActivityList';
import { Plane, Wind, Waves, Footprints, Umbrella, AlertTriangle } from 'lucide-react';

import { getApiUrl } from '../config';

export default function Dashboard() {
    const { user, logout } = useAuth();
    const { t } = useTranslation();
    const [activities, setActivities] = useState([]);
    const [selectedSport, setSelectedSport] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false); // New state for saving loader

    // Delete Modal State
    const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null });

    // Disclaimer Modal State - Show on load
    const [showDisclaimer, setShowDisclaimer] = useState(true);

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
        setIsSaving(true);
        // Minimum loading time of 2s to show the cool animation
        const minLoadTime = new Promise(resolve => setTimeout(resolve, 2000));

        try {
            const token = localStorage.getItem('token');
            const [res] = await Promise.all([
                fetch(getApiUrl('/api/activities'), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(activity)
                }),
                minLoadTime
            ]);

            if (res.ok) {
                setShowForm(false);
                fetchActivities();
            } else {
                const errData = await res.json();
                alert(`Error saving activity: ${errData.error || 'Unknown error'}`);
                console.error("Save failed:", errData);
            }
        } catch (err) {
            console.error(err);
            alert("Network error: Failed to save activity. Please check your connection.");
        } finally {
            setIsSaving(false);
        }
    };

    // Trigger Modal
    const handleDeleteClick = (id) => {
        setDeleteConfirm({ show: true, id });
    };

    // Confirm Delete Action
    const confirmDelete = async () => {
        if (!deleteConfirm.id) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(getApiUrl(`/api/activities/${deleteConfirm.id}`), {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                fetchActivities();
            } else {
                const errData = await res.json();
                alert(`Error deleting activity: ${errData.error || 'Unknown error'}`);
            }
        } catch (err) {
            console.error(err);
            alert("Network error: Failed to delete activity.");
        } finally {
            setDeleteConfirm({ show: false, id: null });
        }
    };

    const cancelDelete = () => {
        setDeleteConfirm({ show: false, id: null });
    };

    // Filter activities for the selected sport
    const filteredActivities = selectedSport
        ? activities.filter(a => a.sport_type === selectedSport)
        : [];

    return (
        <div className="p-4 relative min-h-screen">
            <header className="flex justify-between items-center" style={{ marginBottom: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="flex items-center gap-4">
                    <img src="/logo.png" alt="Logo" style={{ width: '50px', height: '50px', borderRadius: '50%' }} />
                    <h1>PeakPulse <span style={{ fontSize: '0.8em', opacity: 0.7, fontWeight: 400 }}>| Welcome, {user?.username}</span></h1>
                </div>
                <div className="flex gap-4">
                    <button onClick={logout} className="btn btn-outline">{t('logout')}</button>
                </div>
            </header>

            {/* HOME VIEW: Show only if no sport is selected */}
            {!selectedSport && (
                <div style={{ marginTop: '3rem' }}>
                    <h2 style={{ marginBottom: '1.5rem', textAlign: 'center', fontSize: '2rem' }}>Choose Your Sport</h2>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '1.5rem'
                    }}>
                        <button
                            onClick={() => setSelectedSport('skydiving')}
                            className="card flex flex-col items-center justify-center gap-4 btn-outline"
                            style={{ height: '220px', border: '1px solid rgba(14, 165, 233, 0.3)', background: 'rgba(14, 165, 233, 0.05)', transition: 'all 0.2s', cursor: 'pointer' }}
                        >
                            <img src="/skydiving_logo.jpg" alt="Skydiving" className="animate-float" style={{ width: '100px', height: '100px', objectFit: 'contain', borderRadius: '50%' }} />
                            <span style={{ fontSize: '1.3rem', fontWeight: 600 }}>Skydiving</span>
                        </button>

                        <button
                            onClick={() => setSelectedSport('indoor_skydiving')}
                            className="card flex flex-col items-center justify-center gap-4 btn-outline"
                            style={{ height: '220px', border: '1px solid rgba(168, 85, 247, 0.3)', background: 'rgba(168, 85, 247, 0.05)', transition: 'all 0.2s', cursor: 'pointer' }}
                        >
                            <img src="/indoor_skydiving_logo.png" alt="Indoor Skydiving" className="animate-float" style={{ width: '100px', height: '100px', objectFit: 'contain', borderRadius: '12px' }} />
                            <span style={{ fontSize: '1.3rem', fontWeight: 600 }}>Indoor Skydiving</span>
                        </button>

                        <button
                            onClick={() => setSelectedSport('scuba_diving')}
                            className="card flex flex-col items-center justify-center gap-4 btn-outline"
                            style={{ height: '220px', border: '1px solid rgba(6, 182, 212, 0.3)', background: 'rgba(6, 182, 212, 0.05)', transition: 'all 0.2s', cursor: 'pointer' }}
                        >
                            <img src="/scuba_diving_icon.png" alt="Scuba Diving" className="animate-float" style={{ width: '100px', height: '100px', objectFit: 'contain' }} />
                            <span style={{ fontSize: '1.3rem', fontWeight: 600 }}>Scuba Diving</span>
                        </button>

                        <button
                            onClick={() => setSelectedSport('running')}
                            className="card flex flex-col items-center justify-center gap-4 btn-outline"
                            style={{ height: '220px', border: '1px solid rgba(34, 197, 94, 0.3)', background: 'rgba(34, 197, 94, 0.05)', transition: 'all 0.2s', cursor: 'pointer' }}
                        >
                            <Footprints size={64} color="#22c55e" />
                            <span style={{ fontSize: '1.3rem', fontWeight: 600 }}>Running</span>
                        </button>
                    </div>
                </div>
            )}

            {/* SPORT DETAIL VIEW: Show only if a sport IS selected */}
            {selectedSport && (
                <div>

                    <div className="flex justify-between items-center mb-6">
                        <button onClick={() => { setSelectedSport(null); setShowForm(false); }} className="btn btn-outline">
                            ← Back to Home
                        </button>
                        {!showForm && (
                            <button onClick={() => setShowForm(true)} className="btn btn-primary">
                                + Add {selectedSport.replace('_', ' ')} Log
                            </button>
                        )}
                    </div>

                    {/* SKYDIVING HERO HEADER - SKETCH LAYOUT */}
                    {selectedSport === 'skydiving' && !showForm && (
                        <div className="flex flex-col items-center mb-10 animate-fade-in -mt-6">
                            {/* Image Container (Banner: 450x160px) */}
                            <div className="relative mb-6 shadow-xl rounded-md border border-white/10" style={{ width: '100%', maxWidth: '450px', height: '160px', overflow: 'hidden' }}>
                                <img
                                    src="/skydiving_cover.png"
                                    alt="Skydiving"
                                    className="block"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            </div>

                            {/* Title */}
                            <h1 className="text-3xl font-bold mb-6 tracking-[0.2em] text-[#0ea5e9]">SKYDIVING</h1>

                            {/* Stats Row */}
                            <div className="flex justify-between w-full" style={{ maxWidth: '450px' }}>
                                {/* Left: Total Jumps Box */}
                                <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col items-start justify-center w-[48%] backdrop-blur-sm shadow-lg hover:bg-white/10 transition-colors">
                                    <div className="text-xs font-bold uppercase tracking-wider mb-2 text-gray-300 text-left">Total No of Jumps</div>
                                    <div className="text-4xl font-extrabold text-[#0ea5e9]">
                                        {filteredActivities.sort((a, b) => b.id - a.id)[0]?.total_jumps || 0}
                                    </div>
                                </div>

                                {/* Right: Total Freefall Box */}
                                <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col items-end justify-center w-[48%] backdrop-blur-sm shadow-lg hover:bg-white/10 transition-colors">
                                    <div className="text-xs font-bold uppercase tracking-wider mb-2 text-gray-300 text-right">Total Free Fall Time</div>
                                    <div className="text-4xl font-extrabold text-white text-right">
                                        {filteredActivities.sort((a, b) => b.id - a.id)[0]?.total_freefall_time || 0}
                                        <span className="text-lg font-normal ml-1 opacity-60 text-gray-400">sec</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* RUNNING HERO HEADER */}
                    {selectedSport === 'running' && !showForm && (
                        <div className="flex flex-col items-center mb-10 animate-fade-in -mt-6">
                            <div className="relative mb-6 shadow-xl rounded-md border border-white/10" style={{ width: '100%', maxWidth: '450px', height: '160px', overflow: 'hidden' }}>
                                <img src="/running_cover.png" alt="Running" className="block" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                            <h1 className="text-3xl font-bold mb-6 tracking-[0.2em] text-emerald-400">RUNNING</h1>
                            <div className="flex justify-between w-full" style={{ maxWidth: '450px' }}>
                                <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col items-start justify-center w-[48%] backdrop-blur-sm shadow-lg hover:bg-white/10 transition-colors">
                                    <div className="text-xs font-bold uppercase tracking-wider mb-2 text-gray-300 text-left">Total Distance</div>
                                    <div className="text-4xl font-extrabold text-emerald-400">
                                        {filteredActivities.sort((a, b) => b.id - a.id)[0]?.total_distance || 0}
                                        <span className="text-lg font-normal ml-1 opacity-60 text-gray-400">km</span>
                                    </div>
                                </div>
                                <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col items-end justify-center w-[48%] backdrop-blur-sm shadow-lg hover:bg-white/10 transition-colors">
                                    <div className="text-xs font-bold uppercase tracking-wider mb-2 text-gray-300 text-right">Total Runs</div>
                                    <div className="text-4xl font-extrabold text-white text-right">
                                        {filteredActivities.length}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SCUBA DIVING HERO HEADER */}
                    {selectedSport === 'scuba_diving' && !showForm && (
                        <div className="flex flex-col items-center mb-10 animate-fade-in -mt-6">
                            <div className="relative mb-6 shadow-xl rounded-md border border-white/10" style={{ width: '100%', maxWidth: '450px', height: '160px', overflow: 'hidden' }}>
                                <img src="/scuba_cover.png" alt="Scuba Diving" className="block" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                            <h1 className="text-3xl font-bold mb-6 tracking-[0.2em] text-cyan-400">SCUBA DIVING</h1>
                            <div className="flex justify-between w-full" style={{ maxWidth: '450px' }}>
                                <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col items-start justify-center w-[48%] backdrop-blur-sm shadow-lg hover:bg-white/10 transition-colors">
                                    <div className="text-xs font-bold uppercase tracking-wider mb-2 text-gray-300 text-left">Total Dives</div>
                                    <div className="text-4xl font-extrabold text-cyan-400">
                                        {filteredActivities.sort((a, b) => b.id - a.id)[0]?.dive_number || filteredActivities.length}
                                    </div>
                                </div>
                                <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col items-end justify-center w-[48%] backdrop-blur-sm shadow-lg hover:bg-white/10 transition-colors">
                                    <div className="text-xs font-bold uppercase tracking-wider mb-2 text-gray-300 text-right">Total Bottom Time</div>
                                    <div className="text-4xl font-extrabold text-white text-right">
                                        {filteredActivities.sort((a, b) => b.id - a.id)[0]?.total_bottom_time || 0}
                                        <span className="text-lg font-normal ml-1 opacity-60 text-gray-400">min</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* INDOOR SKYDIVING HERO HEADER */}
                    {selectedSport === 'indoor_skydiving' && !showForm && (
                        <div className="flex flex-col items-center mb-10 animate-fade-in -mt-6">
                            <div className="relative mb-6 shadow-xl rounded-md border border-white/10" style={{ width: '100%', maxWidth: '450px', height: '160px', overflow: 'hidden' }}>
                                <img src="/indoor_skydiving_cover.png" alt="Indoor Skydiving" className="block" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                            <h1 className="text-3xl font-bold mb-6 tracking-[0.2em] text-violet-400">INDOOR SKYDIVING</h1>
                            <div className="flex justify-between w-full" style={{ maxWidth: '450px' }}>
                                <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col items-start justify-center w-[48%] backdrop-blur-sm shadow-lg hover:bg-white/10 transition-colors">
                                    <div className="text-xs font-bold uppercase tracking-wider mb-2 text-gray-300 text-left">Total Sessions</div>
                                    <div className="text-4xl font-extrabold text-violet-400">
                                        {filteredActivities.length}
                                    </div>
                                </div>
                                <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col items-end justify-center w-[48%] backdrop-blur-sm shadow-lg hover:bg-white/10 transition-colors">
                                    <div className="text-xs font-bold uppercase tracking-wider mb-2 text-gray-300 text-right">Total Tunnel Time</div>
                                    <div className="text-4xl font-extrabold text-white text-right">
                                        {filteredActivities.sort((a, b) => b.id - a.id)[0]?.total_tunnel_time || 0}
                                        <span className="text-lg font-normal ml-1 opacity-60 text-gray-400">min</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {showForm && (
                        <div style={{ marginBottom: '2rem' }}>
                            <ActivityForm
                                initialSport={selectedSport}
                                activities={filteredActivities}
                                onSave={handleSave}
                                onCancel={() => setShowForm(false)}
                            />
                        </div>
                    )}

                    {!showForm && (
                        <>
                            {loading ? <div>Loading...</div> : (
                                filteredActivities.length > 0 ? (
                                    <ActivityList activities={filteredActivities} onDelete={handleDeleteClick} />
                                ) : (
                                    <div className="text-center p-8 opacity-50">No activities found for this sport. Add one!</div>
                                )
                            )}
                        </>
                    )}
                </div>
            )}

            {/* DELETE CONFIRMATION MODAL */}
            {deleteConfirm.show && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
                }}>
                    <div className="card animate-scale-in" style={{ maxWidth: '400px', width: '90%', padding: '2rem', textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                        <div className="flex justify-center mb-4">
                            <AlertTriangle size={48} color="#ef4444" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Delete Log?</h3>
                        <p style={{ marginBottom: '2rem', opacity: 0.8 }}>Are you sure you want to delete the log?</p>

                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={confirmDelete}
                                className="btn"
                                style={{ background: '#ef4444', color: 'white', border: 'none', padding: '0.8rem 1.5rem', fontWeight: 'bold' }}
                            >
                                Yes, Delete
                            </button>
                            <button
                                onClick={cancelDelete}
                                className="btn btn-outline"
                            >
                                No, Back to Menu
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* DISCLAIMER MODAL */}
            {showDisclaimer && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200
                }}>
                    <div className="card animate-scale-in" style={{ maxWidth: '400px', width: '90%', padding: '2rem', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <div className="flex justify-center mb-4">
                            <AlertTriangle size={48} className="text-yellow-400" style={{ color: '#facc15' }} />
                        </div>
                        <h3 className="text-xl font-bold mb-4">Important Note</h3>
                        <p style={{ marginBottom: '2rem', opacity: 0.9, lineHeight: '1.6' }}>
                            All entered data is for your <strong>personal reference only</strong>.
                        </p>

                        <button
                            onClick={() => setShowDisclaimer(false)}
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '1rem' }}
                        >
                            I Understand
                        </button>
                    </div>
                </div>
            )}

            {/* LOADING OVERLAY - Parachute Animation */}
            {isSaving && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(10px)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 300
                }}>
                    <div style={{ position: 'relative', width: '120px', height: '120px' }}>
                        {/* Spinning dashed circle */}
                        <div className="animate-spin-slow" style={{
                            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                            border: '2px dashed rgba(56, 189, 248, 0.3)', borderRadius: '50%'
                        }}></div>

                        {/* Parachute / Skydiver Image */}
                        <img
                            src="/skydiving_logo.jpg"
                            alt="Saving..."
                            className="animate-float"
                            style={{
                                width: '80px', height: '80px',
                                position: 'absolute', top: '20px', left: '20px',
                                objectFit: 'contain', borderRadius: '50%',
                                filter: 'drop-shadow(0 0 10px rgba(56, 189, 248, 0.5))'
                            }}
                        />
                    </div>
                    <h3 className="text-xl font-bold mt-8 text-[#38bdf8] animate-pulse">Saving Activity...</h3>
                </div>
            )}
        </div>
    );
}
