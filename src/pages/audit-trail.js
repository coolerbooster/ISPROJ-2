import React from 'react';
import Navbar from '../components/Navbar';
import AuditTrailTable from '../components/AuditTrailTable'; // ✅ corrected

export default function AuditTrailPage() {
    return (
        <div>
            <Navbar />
            <div className="container-fluid py-4">
                <h3 className="mb-4">Audit Trail</h3>
                <AuditTrailTable />
            </div>
        </div>
    );
}
