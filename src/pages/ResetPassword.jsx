
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import API from '../services/api';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setMessage('');
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }

        setLoading(true);

        try {
            const response = await API.post(
                `/auth/reset-password/${token}`,
                { password }
            );

            setMessage(response.data.message);

            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Password reset failed. The link may be invalid or expired.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <form className="auth-card" onSubmit={handleSubmit}>
                <h1>Bug Tracker</h1>
                <h2>Reset Password</h2>
                <p>Enter your new password below.</p>

                {message && <div className="success-message">{message}</div>}
                {error && <div className="error-message">{error}</div>}

                <label>New Password</label>
                <input
                    type="password"
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={6}
                    required
                />

                <label>Confirm Password</label>
                <input
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    minLength={6}
                    required
                />

                <button type="submit" disabled={loading}>
                    {loading ? 'Resetting...' : 'Reset Password'}
                </button>

                <p className="auth-footer">
                    <Link to="/login">Back to Login</Link>
                </p>
            </form>
        </div>
    );
};

export default ResetPassword;
