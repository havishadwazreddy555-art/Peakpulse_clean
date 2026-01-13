import React, { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';

export default function ActivityForm({ onSave, onCancel, initialSport, activities = [] }) {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        time: '12:00',
        location: '',
        latitude: '',
        longitude: '',
        sport_type: initialSport || 'running',
        distance: '',
        total_distance: '',
        height: '',
        depth: '',
        notes: '',
        jump_number: '',
        total_jumps: '',
        freefall_time: '',
        total_freefall_time: '',
        tunnel_time: '',
        total_tunnel_time: '',
        skill_level: '',
        dive_number: '',
        visibility: '',
        bottom_time: '',
        total_bottom_time: '',
        signature: ''
    });

    const isSkydiving = formData.sport_type === 'skydiving';
    const isIndoor = formData.sport_type === 'indoor_skydiving';
    const isScuba = formData.sport_type === 'scuba_diving';
    const isRunning = formData.sport_type === 'running';

    // Get statistics from previous activities
    // Sort by ID descending (assuming higher ID is later)
    const sortedActivities = [...activities].sort((a, b) => b.id - a.id);
    const lastActivity = sortedActivities.length > 0 ? sortedActivities[0] : null;

    // --- AUTO CALCULATION EFFECTS ---

    // Skydiving
    useEffect(() => {
        if (isSkydiving) {
            const currentFreefall = parseInt(formData.freefall_time) || 0;
            const lastTotalFreefall = lastActivity?.total_freefall_time || 0;

            setFormData(prev => ({
                ...prev,
                total_freefall_time: (lastTotalFreefall + currentFreefall).toString(),
                total_jumps: formData.jump_number
            }));
        }
    }, [formData.freefall_time, formData.jump_number, isSkydiving, lastActivity]);

    useEffect(() => {
        if (isSkydiving && lastActivity && !formData.jump_number) {
            const nextJump = (lastActivity.jump_number || 0) + 1;
            setFormData(prev => ({ ...prev, jump_number: nextJump.toString() }));
        }
    }, [isSkydiving, lastActivity]);

    // Indoor Skydiving
    useEffect(() => {
        if (isIndoor) {
            const currentTunnel = parseInt(formData.tunnel_time) || 0;
            const lastTotalTunnel = lastActivity?.total_tunnel_time || 0;
            setFormData(prev => ({
                ...prev,
                total_tunnel_time: (lastTotalTunnel + currentTunnel).toString()
            }));
        }
    }, [formData.tunnel_time, isIndoor, lastActivity]);

    // Scuba Diving
    useEffect(() => {
        if (isScuba) {
            const currentBottom = parseInt(formData.bottom_time) || 0;
            const lastTotalBottom = lastActivity?.total_bottom_time || 0;
            setFormData(prev => ({
                ...prev,
                total_bottom_time: (lastTotalBottom + currentBottom).toString()
            }));
        }
    }, [formData.bottom_time, isScuba, lastActivity]);

    useEffect(() => {
        if (isScuba && lastActivity && !formData.dive_number) {
            const nextDive = (lastActivity.dive_number || 0) + 1;
            setFormData(prev => ({ ...prev, dive_number: nextDive.toString() }));
        }
    }, [isScuba, lastActivity]);

    // Running
    useEffect(() => {
        if (isRunning) {
            const currentDist = parseFloat(formData.distance) || 0;
            const lastTotalDist = lastActivity?.total_distance || 0;
            // Round to 2 decimals
            const newTotal = (lastTotalDist + currentDist).toFixed(1);
            setFormData(prev => ({
                ...prev,
                total_distance: newTotal
            }));
        }
    }, [formData.distance, isRunning, lastActivity]);


    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };


    return (
        <div className="card animate-fade-in relative">
            <button
                onClick={onCancel}
                className="absolute top-4 left-4 btn btn-outline"
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', zIndex: 10 }}
            >
                ← Back
            </button>

            <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary)', textAlign: 'center', marginTop: '2rem' }}>
                {isSkydiving && 'SKYDIVING'}
                {isIndoor && 'INDOOR SKYDIVING'}
                {isScuba && 'SCUBA DIVING'}
                {isRunning && 'RUNNING'}
                {!isSkydiving && !isIndoor && !isScuba && !isRunning && t('addActivity')}
            </h3>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                {/* --- SKYDIVING FORM --- */}
                {isSkydiving && (
                    <>
                        {/* Top: Total Jumps & Total Freefall (Read Only / Auto Calc) */}
                        <div className="flex gap-4">
                            <div style={{ flex: 1 }}>
                                <label className="text-sm">Total No of Jump</label>
                                <input className="input" type="number" name="total_jumps" value={formData.total_jumps} readOnly style={{ opacity: 0.7, background: 'rgba(255,255,255,0.05)' }} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label className="text-sm">Total Freefall Time</label>
                                <input className="input" type="number" name="total_freefall_time" value={formData.total_freefall_time} readOnly style={{ opacity: 0.7, background: 'rgba(255,255,255,0.05)' }} />
                            </div>
                        </div>

                        {/* Standard Fields */}
                        <div className="flex gap-4">
                            <div style={{ flex: 1 }}>
                                <label className="text-sm">Jump Number</label>
                                <input className="input" type="number" name="jump_number" value={formData.jump_number} onChange={handleChange} required placeholder="#" />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label className="text-sm">{t('date')}</label>
                                <input className="input" type="date" name="date" value={formData.date} onChange={handleChange} required />
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div style={{ flex: 1 }}>
                                <label className="text-sm">Location / Destination</label>
                                <input className="input" type="text" name="location" value={formData.location} onChange={handleChange} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label className="text-sm">Freefall Time (sec)</label>
                                <input className="input" type="number" name="freefall_time" value={formData.freefall_time} onChange={handleChange} placeholder="e.g. 60" />
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div style={{ flex: 1 }}>
                                <label className="text-sm">{t('height')} (m)</label>
                                <input className="input" type="number" step="1" name="height" value={formData.height} onChange={handleChange} />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm">{t('notes')}</label>
                            <textarea className="input" name="notes" value={formData.notes} onChange={handleChange} rows="3"></textarea>
                        </div>

                        <div>
                            <label className="text-sm">Signature</label>
                            <input className="input" type="text" name="signature" value={formData.signature} onChange={handleChange} placeholder="Instructor/Verify Name" />
                        </div>
                    </>
                )}

                {/* --- INDOOR SKYDIVING FORM --- */}
                {isIndoor && (
                    <>
                        {/* Auto Field */}
                        <div className="flex gap-4">
                            <div style={{ flex: 1 }}>
                                <label className="text-sm">Total Tunnel Time</label>
                                <input className="input" type="number" name="total_tunnel_time" value={formData.total_tunnel_time} readOnly style={{ opacity: 0.7, background: 'rgba(255,255,255,0.05)' }} />
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div style={{ flex: 1 }}>
                                <label className="text-sm">{t('date')}</label>
                                <input className="input" type="date" name="date" value={formData.date} onChange={handleChange} required />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label className="text-sm">Tunnel Time (min)</label>
                                <input className="input" type="number" name="tunnel_time" value={formData.tunnel_time} onChange={handleChange} />
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div style={{ flex: 1 }}>
                                <label className="text-sm">{t('location')}</label>
                                <input className="input" type="text" name="location" value={formData.location} onChange={handleChange} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label className="text-sm">Skill Level</label>
                                <input className="input" type="text" name="skill_level" value={formData.skill_level} onChange={handleChange} placeholder="e.g. Beginner, Pro" />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm">{t('notes')}</label>
                            <textarea className="input" name="notes" value={formData.notes} onChange={handleChange} rows="3"></textarea>
                        </div>

                        <div>
                            <label className="text-sm">Signature</label>
                            <input className="input" type="text" name="signature" value={formData.signature} onChange={handleChange} placeholder="Instructor/Verify Name" />
                        </div>
                    </>
                )}

                {/* --- SCUBA DIVING FORM --- */}
                {isScuba && (
                    <>
                        {/* Auto Field */}
                        <div className="flex gap-4">
                            <div style={{ flex: 1 }}>
                                <label className="text-sm">Total Bottom Time</label>
                                <input className="input" type="number" name="total_bottom_time" value={formData.total_bottom_time} readOnly style={{ opacity: 0.7, background: 'rgba(255,255,255,0.05)' }} />
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div style={{ flex: 1 }}>
                                <label className="text-sm">Dive No</label>
                                <input className="input" type="number" name="dive_number" value={formData.dive_number} onChange={handleChange} required placeholder="#" />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label className="text-sm">{t('date')}</label>
                                <input className="input" type="date" name="date" value={formData.date} onChange={handleChange} required />
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div style={{ flex: 1 }}>
                                <label className="text-sm">{t('location')}</label>
                                <input className="input" type="text" name="location" value={formData.location} onChange={handleChange} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label className="text-sm">Visibility</label>
                                <input className="input" type="text" name="visibility" value={formData.visibility} onChange={handleChange} placeholder="e.g. 20m, Clear" />
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div style={{ flex: 1 }}>
                                <label className="text-sm">Minutes Spent</label>
                                <input className="input" type="number" name="bottom_time" value={formData.bottom_time} onChange={handleChange} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label className="text-sm">{t('depth')} (m)</label>
                                <input className="input" type="number" step="0.1" name="depth" value={formData.depth} onChange={handleChange} />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm">Comments</label>
                            <textarea className="input" name="notes" value={formData.notes} onChange={handleChange} rows="3"></textarea>
                        </div>

                        <div>
                            <label className="text-sm">Signature</label>
                            <input className="input" type="text" name="signature" value={formData.signature} onChange={handleChange} placeholder="Instructor/Buddy Name" />
                        </div>
                    </>
                )}

                {/* --- RUNNING FORM --- */}
                {isRunning && (
                    <>
                        {/* Auto Field */}
                        <div className="flex gap-4">
                            <div style={{ flex: 1 }}>
                                <label className="text-sm">Total Distance</label>
                                <input className="input" type="number" name="total_distance" value={formData.total_distance} readOnly style={{ opacity: 0.7, background: 'rgba(255,255,255,0.05)' }} />
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div style={{ flex: 1 }}>
                                <label className="text-sm">{t('date')}</label>
                                <input className="input" type="date" name="date" value={formData.date} onChange={handleChange} required />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label className="text-sm">Run (km)</label>
                                <input className="input" type="number" step="0.1" name="distance" value={formData.distance} onChange={handleChange} />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm">{t('location')}</label>
                            <input className="input" type="text" name="location" value={formData.location} onChange={handleChange} />
                        </div>

                        <div>
                            <label className="text-sm">{t('notes')}</label>
                            <textarea className="input" name="notes" value={formData.notes} onChange={handleChange} rows="3"></textarea>
                        </div>
                    </>
                )}

                <div className="flex justify-end gap-4 mt-4">
                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>{t('save')}</button>
                </div>
            </form>
        </div>
    );
}
