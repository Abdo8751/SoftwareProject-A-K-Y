import React, { useState } from 'react';
import axios from 'axios';

const MFASetup = () => {
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [token, setToken] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);

  const setupMFA = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/v1/auth/mfa/setup', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setQrCode(response.data.data.qrCode);
      setSecret(response.data.data.secret);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to setup MFA');
    }
  };

  const verifyAndEnable = async (e) => {
    e.preventDefault();
    try {
      const authToken = localStorage.getItem('token');
      await axios.post('/api/v1/auth/mfa/verify', 
        { token },
        { headers: { Authorization: `Bearer ${authToken}` }}
      );
      
      setMessage('MFA enabled successfully');
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid token');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold mb-6 text-center">MFA Setup</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {message && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {message}
        </div>
      )}

      {step === 1 && (
        <div>
          <p className="mb-4">
            Enable Multi-Factor Authentication to add an extra layer of security to your account.
          </p>
          <button
            onClick={setupMFA}
            className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Setup MFA
          </button>
        </div>
      )}

      {step === 2 && (
        <div>
          <p className="mb-4">
            1. Install an authenticator app like Google Authenticator or Authy
          </p>
          <p className="mb-4">
            2. Scan this QR code with your authenticator app:
          </p>
          <div className="mb-4 flex justify-center">
            <img src={qrCode} alt="QR Code" />
          </div>
          <p className="mb-4">
            Or manually enter this code: <code className="bg-gray-100 px-2 py-1">{secret}</code>
          </p>
          <form onSubmit={verifyAndEnable}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Enter the 6-digit code from your authenticator app:
              </label>
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
                pattern="[0-9]{6}"
                maxLength="6"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Verify and Enable MFA
            </button>
          </form>
        </div>
      )}

      {step === 3 && (
        <div>
          <p className="text-green-700 font-bold mb-4">
            MFA has been successfully enabled for your account!
          </p>
          <p>
            You will now need to enter a code from your authenticator app when logging in.
          </p>
        </div>
      )}
    </div>
  );
};

export default MFASetup; 