'use client';

import { useState } from 'react';
import Link from 'next/link';

// Mock worker data for testing dashboard before Supabase connection
const MOCK_WORKERS = [
  {
    id: '1',
    full_name: 'Rahul Sharma',
    profession: 'Electrician',
    slug: 'rahul-sharma',
    service_area: ['Indore', 'Dewas'],
    is_verified: true,
  },
  {
    id: '2',
    full_name: 'Amit Verma',
    profession: 'Plumber',
    slug: 'amit-verma',
    service_area: ['Ujjain'],
    is_verified: false,
  },
];

export default function AdminDashboardPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [workers] = useState(MOCK_WORKERS);

  const filteredWorkers = workers.filter(
    (w) =>
      w.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.profession.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      {/* HEADER SECTION */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px' }}>Worker Management Dashboard</h1>
          <p style={{ color: '#666', margin: '4px 0 0 0' }}>Manage profiles, add new workers, or edit existing ones.</p>
        </div>
        
        {/* ADD NEW WORKER BUTTON */}
        <Link href="/admin/create">
          <button
            style={{
              backgroundColor: '#18A34A',
              color: '#fff',
              padding: '10px 18px',
              borderRadius: '8px',
              border: 'none',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            + Add New Worker
          </button>
        </Link>
      </div>

      {/* SEARCH BAR */}
      <div style={{ marginBottom: '1.5rem' }}>
        <input
          type="text"
          placeholder="Search worker by name or profession..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid #ccc',
            fontSize: '15px',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* WORKERS TABLE */}
      <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '12px 16px' }}>Name</th>
              <th style={{ padding: '12px 16px' }}>Profession</th>
              <th style={{ padding: '12px 16px' }}>Service Area</th>
              <th style={{ padding: '12px 16px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredWorkers.map((worker) => (
              <tr key={worker.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '12px 16px', fontWeight: '500' }}>
                  {worker.full_name} {worker.is_verified && '✓'}
                </td>
                <td style={{ padding: '12px 16px', color: '#475569' }}>{worker.profession}</td>
                <td style={{ padding: '12px 16px', color: '#475569' }}>
                  {Array.isArray(worker.service_area) ? worker.service_area.join(', ') : worker.service_area}
                </td>
                <td style={{ padding: '12px 16px', display: 'flex', gap: '8px' }}>
                  {/* EDIT BUTTON */}
                  <Link href={`/admin/edit/${worker.slug}`}>
                    <button
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: '1px solid #2563eb',
                        background: '#eff6ff',
                        color: '#2563eb',
                        cursor: 'pointer',
                        fontSize: '13px',
                      }}
                    >
                      Edit
                    </button>
                  </Link>

                  {/* PREVIEW PUBLIC PROFILE BUTTON */}
                  <Link href={`/w/${worker.slug}`} target="_blank">
                    <button
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: '1px solid #475569',
                        background: '#f1f5f9',
                        color: '#475569',
                        cursor: 'pointer',
                        fontSize: '13px',
                      }}
                    >
                      View Live
                    </button>
                  </Link>
                </td>
              </tr>
            ))}

            {filteredWorkers.length === 0 && (
              <tr>
                <td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>
                  No workers found matching "{searchQuery}"
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
