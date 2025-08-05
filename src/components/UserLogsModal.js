import React, { useState, useMemo } from 'react';
import Modal from 'react-modal';

const UserLogsModal = ({ isOpen, onRequestClose, logs }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = useMemo(() => {
    if (!logs) return [];
    return logs.filter(log =>
      log.action.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [logs, searchTerm]);

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="User Logs"
      style={{
        content: {
          top: '50%',
          left: '50%',
          right: 'auto',
          bottom: 'auto',
          marginRight: '-50%',
          transform: 'translate(-50%, -50%)',
          width: '80%',
          maxHeight: '80vh',
          padding: '20px',
        },
        overlay: {
          backgroundColor: 'rgba(0, 0, 0, 0.75)'
        }
      }}
      ariaHideApp={false}
    >
      <div className="modal-header">
        <h5 className="modal-title">User Activity Logs</h5>
        <button type="button" className="btn-close" onClick={onRequestClose}></button>
      </div>
      <div className="modal-body">
        <div className="mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Search by action description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="table-responsive">
          <table className="table table-striped table-bordered">
            <thead className="table-light">
              <tr>
                <th>Date & Time</th>
                <th>Action Description</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log, index) => (
                  <tr key={index}>
                    <td>{new Date(log.timestamp).toLocaleString('en-US', { timeZone: 'Asia/Manila' })}</td>
                    <td>{log.action}</td>
                    <td>
                      <span className={`badge ${log.status === 'SUCCESS' ? 'bg-success' : 'bg-danger'}`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="text-center">No logs found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div className="modal-footer">
        <button className="btn btn-secondary" onClick={onRequestClose}>Close</button>
      </div>
    </Modal>
  );
};

export default UserLogsModal;