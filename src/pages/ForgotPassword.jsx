
import { useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setMessage('');
        setError('');
        setLoading(true);

        try {
            const response = await API.post('/auth/forgot-password', {
                email,
            });

            setMessage(response.data.message);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Unable to send reset link. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <form className="auth-card" onSubmit={handleSubmit}>
                <h1>Bug Tracker</h1>
                <h2>Forgot Password?</h2>
                <p>Enter your registered email to receive a reset link.</p>

                {message && <div className="success-message">{message}</div>}
                {error && <div className="error-message">{error}</div>}

                <label>Email Address</label>
                <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <button type="submit" disabled={loading}>
                    {loading ? 'Sending...' : 'Send Reset Link'}
                </button>

                <p className="auth-footer">
                    <Link to="/login">Back to Login</Link>
                </p>
            </form>
        </div>
    );
};

export default ForgotPassword;
