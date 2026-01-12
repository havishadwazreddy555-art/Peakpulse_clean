import React, { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';

export default function ActivityForm({ onSave, onCancel, initialSport }) {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        time: '12:00',
        location: '',
        latitude: '',
        longitude: '',
        sport_type: initialSport || 'running',
        distance: '',
        height: '',
        depth: '',
        notes: '',
        jump_number: '',
        total_jumps: '',
        freefall_time: '',
        total_freefall_time: '',
        tunnel_time: '',
        skill_level: '',
        dive_number: '',
        visibility: '',
        bottom_time: '',
        signature: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const isSkydiving = formData.sport_type === 'skydiving';
    const isIndoor = formData.sport_type === 'indoor_skydiving';
    const isScuba = formData.sport_type === 'scuba_diving';
    const isRunning = formData.sport_type === 'running';

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

                {/* GLOBAL: Date is common to all, but sometimes placed differently? 
                    User requested specific orders. Let's do per-sport conditionally for strict control.
                */}

                {/* --- SKYDIVING FORM --- */}
                {isSkydiving && (
                    <>
                        {/* Top: Total Jumps & Total Freefall */}
                        <div className="flex gap-4">
                            <div style={{ flex: 1 }}>
                                <label className="text-sm">Total No of Jump</label>
                                <input className="input" type="number" name="total_jumps" value={formData.total_jumps} onChange={handleChange} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label className="text-sm">Total Freefall Time (sec)</label>
                                <input className="input" type="number" name="total_freefall_time" value={formData.total_freefall_time} onChange={handleChange} />
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
                                <input className="input" type="number" name="freefall_time" value={formData.freefall_time} onChange={handleChange} />
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
                    </>
                )}

                {/* --- INDOOR SKYDIVING FORM --- */}
                {isIndoor && (
                    <>
                        <div className="flex gap-4">
                            <div style={{ flex: 1 }}>
                                <label className="text-sm">{t('date')}</label>
                                <input className="input" type="date" name="date" value={formData.date} onChange={handleChange} required />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label className="text-sm">Total Tunnel Time (min)</label>
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
                    </>
                )}

                {/* --- SCUBA DIVING FORM --- */}
                {isScuba && (
                    <>
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
                                <label className="text-sm">Total Minutes Spent</label>
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
