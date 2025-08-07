import React, { useState, useImperativeHandle, forwardRef } from 'react';
import Modal from 'react-modal';
import { getUserTransactions } from '../services/apiService';

const UserTransactionsModal = forwardRef(({ isOpen, onClose, userId: initialUserId }, ref) => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useImperativeHandle(ref, () => ({
        fetchTransactions: (userId) => {
            setLoading(true);
            setError(null);
            getUserTransactions(userId)
                .then(response => {
                    setTransactions(response || []);
                })
                .catch(error => {
                    setError('Failed to fetch transactions.');
                    console.error('Error fetching transactions:', error);
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }));

    if (!isOpen) return null;
    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            contentLabel="User Transactions"
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
                <h5 className="modal-title">User Transactions</h5>
                <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body">
                {loading ? (
                    <p>Loading...</p>
                ) : error ? (
                    <p className="text-danger">{error}</p>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-striped table-bordered">
                            <thead className="table-light">
                                <tr>
                                    <th>Payment Method</th>
                                    <th>Amount</th>
                                    <th>Transaction Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions && transactions.length > 0 ? (
                                    transactions.map((transaction) => {
                                        return (
                                            <tr key={transaction.payment_id}>
                                                <td>{transaction.paymentMethod}</td>
                                                <td>{transaction.amount}</td>
                                                <td>{new Date(transaction.createdAt).toLocaleString('en-US', { timeZone: 'Asia/Manila' })}</td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="3" className="text-center">No transactions found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            <div className="modal-footer">
                <button className="btn btn-secondary" onClick={onClose}>Close</button>
            </div>
        </Modal>
    );
});

export default React.memo(UserTransactionsModal);