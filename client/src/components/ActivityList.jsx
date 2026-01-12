import React from 'react';
import { useTranslation } from '../hooks/useTranslation';

export default function ActivityList({ activities, onDelete }) {
    const { t } = useTranslation();

    if (!activities || activities.length === 0) {
        return <div className="p-4 text-center text-light">No activities found.</div>;
    }

    const getSportLabel = (type) => {
        switch (type) {
            case 'skydiving': return 'Skydiving';
            case 'indoor_skydiving': return 'Indoor';
            case 'scuba_diving': return 'Scuba';
            case 'running': return 'Running';
            default: return type;
        }
    };

    const getSportColor = (type) => {
        switch (type) {
            case 'skydiving': return { bg: '#e0f2fe', text: '#0369a1' }; // Sky Blue
            case 'indoor_skydiving': return { bg: '#f3e8ff', text: '#7e22ce' }; // Purple
            case 'scuba_diving': return { bg: '#ecfeff', text: '#0e7490' }; // Cyan
            case 'running': return { bg: '#f1f5f9', text: '#334155' }; // Slate
            default: return { bg: '#f1f5f9', text: '#475569' };
        }
    };

    return (
        <div className="card" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                        <th className="p-4">Date</th>
                        <th className="p-4">Sport</th>
                        <th className="p-4">Location</th>
                        <th className="p-4">Details</th>
                        <th className="p-4">Notes</th>
                        <th className="p-4 actions">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {activities.map(act => {
                        const style = getSportColor(act.sport_type);
                        return (
                            <tr key={act.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td className="p-4" style={{ whiteSpace: 'nowrap' }}>
                                    <div>{act.date}</div>
                                    <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>{act.time !== '00:00' ? act.time : ''}</div>
                                </td>
                                <td className="p-4">
                                    <span style={{
                                        backgroundColor: style.bg,
                                        color: style.text,
                                        padding: '0.25rem 0.5rem', borderRadius: '0.5rem', fontSize: '0.8rem', fontWeight: 600
                                    }}>
                                        {getSportLabel(act.sport_type)}
                                    </span>
                                </td>
                                <td className="p-4">{act.location || '-'}</td>
                                <td className="p-4">
                                    {act.sport_type === 'skydiving' && (
                                        <div className="text-sm">
                                            {act.jump_number && <div><strong>#{act.jump_number}</strong></div>}
                                            {act.height && <div>{act.height}m</div>}
                                            {act.freefall_time && <div>{act.freefall_time}s FF</div>}
                                        </div>
                                    )}
                                    {act.sport_type === 'indoor_skydiving' && (
                                        <div className="text-sm">
                                            {act.tunnel_time && <div>{act.tunnel_time} mins</div>}
                                            {act.skill_level && <div>{act.skill_level}</div>}
                                        </div>
                                    )}
                                    {act.sport_type === 'scuba_diving' && (
                                        <div className="text-sm">
                                            {act.dive_number && <div><strong>#{act.dive_number}</strong></div>}
                                            {act.depth && <div>{act.depth}m</div>}
                                            {act.bottom_time && <div>{act.bottom_time} mins</div>}
                                            {act.visibility && <div className="text-xs opacity-70">Vis: {act.visibility}</div>}
                                        </div>
                                    )}
                                    {act.sport_type === 'running' && (
                                        <div className="text-sm">
                                            {act.distance && <div>{act.distance} km</div>}
                                        </div>
                                    )}
                                </td>
                                <td className="p-4 text-sm opacity-70" style={{ maxWidth: '200px' }}>
                                    {act.notes}
                                    {act.signature && <div style={{ marginTop: '0.25rem', fontStyle: 'italic' }}>Sig: {act.signature}</div>}
                                </td>
                                <td className="p-4">
                                    <button
                                        onClick={() => onDelete(act.id)}
                                        className="btn btn-outline"
                                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', color: '#ef4444', borderColor: '#ef4444' }}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
