import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function CustomerLogin() {
  const [step, setStep] = useState('phone'); // phone | name | otp
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [whatsAppLink, setWhatsAppLink] = useState('');
  const [otpValue, setOtpValue] = useState(''); // for testing
  const [timer, setTimer] = useState(0);
  const [customerName, setCustomerName] = useState('');
  const navigate = useNavigate();

  // Countdown timer for resend
  useEffect(() => {
    if (timer > 0) {
      const t = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [timer]);

  const sendOTP = async (e) => {
    e?.preventDefault();
    if (phone.length < 10) { setError('Enter valid 10-digit phone number'); return; }
    setError(''); setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/customer-auth/send-otp`, {
        phone, name: name || undefined
      });

      if (res.data.needsName) {
        setStep('name'); setLoading(false); return;
      }

      setWhatsAppLink(res.data.whatsAppLink);
      setOtpValue(res.data.otp); // remove in production
      setCustomerName(res.data.customerName);
      setStep('otp');
      setTimer(30);

      // Auto open WhatsApp
      window.open(res.data.whatsAppLink, '_blank');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const submitName = async (e) => {
    e.preventDefault();
    if (!name.trim()) { setError('Please enter your name'); return; }
    await sendOTP();
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) value = value.slice(-1);
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    // Auto focus next
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const verifyOTP = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) { setError('Enter complete 6-digit OTP'); return; }
    setError(''); setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/customer-auth/verify-otp`, {
        phone, otp: otpString
      });
      localStorage.setItem('customerToken', res.data.token);
      localStorage.setItem('customerUser', JSON.stringify(res.data.customer));
      navigate('/customer/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid OTP');
      setOtp(['', '', '', '', '', '']);
      document.getElementById('otp-0')?.focus();
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    setError(''); setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/customer-auth/resend-otp`, { phone });
      setWhatsAppLink(res.data.whatsAppLink);
      setOtpValue(res.data.otp);
      setTimer(30);
      window.open(res.data.whatsAppLink, '_blank');
    } catch (err) {
      setError('Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, margin: '0 auto 14px', background: 'linear-gradient(135deg,#e17055,#d63031)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="ti ti-building-store" style={{ fontSize: 32, color: 'white' }} aria-hidden="true" />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'white', margin: 0 }}>HardwareShop</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 4 }}>Customer Portal</p>
        </div>

        {/* Card */}
        <div style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', borderRadius: 20, padding: '32px 28px', border: '1px solid rgba(255,255,255,0.1)' }}>

          {/* Step 1 - Phone */}
          {step === 'phone' && (
            <>
              <h2 style={{ color: 'white', fontSize: 18, fontWeight: 600, marginBottom: 6 }}>
                Welcome back!
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 24 }}>
                Enter your phone number to receive OTP on WhatsApp
              </p>

              {error && <div style={{ background: 'rgba(214,48,49,0.2)', border: '1px solid rgba(214,48,49,0.4)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#ff7675', marginBottom: 16 }}>{error}</div>}

              <form onSubmit={sendOTP}>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 6 }}>Phone Number</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <div style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, padding: '10px 12px', color: 'white', fontSize: 14, minWidth: 52, textAlign: 'center' }}>
                      +91
                    </div>
                    <input type="tel" value={phone} maxLength={10}
                      onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="10-digit mobile number"
                      style={{ flex: 1, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, padding: '10px 14px', color: 'white', fontSize: 14, outline: 'none' }} />
                  </div>
                </div>

                <button type="submit" disabled={loading || phone.length < 10}
                  style={{ width: '100%', padding: 12, background: 'linear-gradient(135deg,#25D366,#128C7E)', border: 'none', borderRadius: 10, color: 'white', fontSize: 15, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: phone.length < 10 ? 0.6 : 1 }}>
                  <i className="ti ti-brand-whatsapp" aria-hidden="true" />
                  {loading ? 'Sending OTP...' : 'Send OTP on WhatsApp'}
                </button>
              </form>
            </>
          )}

          {/* Step 2 - Name (new customer) */}
          {step === 'name' && (
            <>
              <h2 style={{ color: 'white', fontSize: 18, fontWeight: 600, marginBottom: 6 }}>
                New Customer?
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 24 }}>
                Please enter your name to create your account
              </p>

              {error && <div style={{ background: 'rgba(214,48,49,0.2)', border: '1px solid rgba(214,48,49,0.4)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#ff7675', marginBottom: 16 }}>{error}</div>}

              <form onSubmit={submitName}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 6 }}>Your Name</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)}
                    placeholder="Enter your full name"
                    style={{ width: '100%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, padding: '10px 14px', color: 'white', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 6 }}>Phone</label>
                  <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 14px', color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>
                    +91 {phone}
                  </div>
                </div>
                <button type="submit" disabled={loading}
                  style={{ width: '100%', padding: 12, background: 'linear-gradient(135deg,#25D366,#128C7E)', border: 'none', borderRadius: 10, color: 'white', fontSize: 15, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <i className="ti ti-brand-whatsapp" aria-hidden="true" />
                  {loading ? 'Sending...' : 'Send OTP on WhatsApp'}
                </button>
                <button type="button" onClick={() => setStep('phone')}
                  style={{ width: '100%', padding: 10, background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 13, cursor: 'pointer', marginTop: 8 }}>
                  ← Change phone number
                </button>
              </form>
            </>
          )}

          {/* Step 3 - OTP */}
          {step === 'otp' && (
            <>
              <h2 style={{ color: 'white', fontSize: 18, fontWeight: 600, marginBottom: 6 }}>
                Enter OTP
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 6 }}>
                Hi {customerName}! We sent a 6-digit OTP to WhatsApp
              </p>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginBottom: 20 }}>
                +91 {phone}
              </p>

              {error && <div style={{ background: 'rgba(214,48,49,0.2)', border: '1px solid rgba(214,48,49,0.4)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#ff7675', marginBottom: 16 }}>{error}</div>}

              {/* OTP hint for testing */}
              {otpValue && (
                <div style={{ background: 'rgba(37,211,102,0.15)', border: '1px solid rgba(37,211,102,0.3)', borderRadius: 10, padding: '8px 12px', fontSize: 12, color: '#25D366', marginBottom: 16, textAlign: 'center' }}>
                  Test OTP: <strong style={{ fontSize: 16, letterSpacing: 4 }}>{otpValue}</strong>
                </div>
              )}

              {/* OTP input boxes */}
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 24 }}>
                {otp.map((digit, i) => (
                  <input key={i} id={`otp-${i}`}
                    type="tel" maxLength={1} value={digit}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(i, e)}
                    style={{
                      width: 44, height: 52, textAlign: 'center', fontSize: 22, fontWeight: 700,
                      background: digit ? 'rgba(37,211,102,0.15)' : 'rgba(255,255,255,0.08)',
                      border: `1px solid ${digit ? 'rgba(37,211,102,0.5)' : 'rgba(255,255,255,0.15)'}`,
                      borderRadius: 10, color: 'white', outline: 'none',
                      transition: 'all 0.2s'
                    }} />
                ))}
              </div>

              <button onClick={verifyOTP} disabled={loading || otp.join('').length !== 6}
                style={{ width: '100%', padding: 12, background: 'linear-gradient(135deg,#e17055,#d63031)', border: 'none', borderRadius: 10, color: 'white', fontSize: 15, fontWeight: 600, cursor: 'pointer', opacity: otp.join('').length !== 6 ? 0.6 : 1, marginBottom: 12 }}>
                {loading ? 'Verifying...' : 'Verify OTP & Login'}
              </button>

              {/* Resend / WhatsApp */}
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => window.open(whatsAppLink, '_blank')}
                  style={{ flex: 1, padding: '8px', background: 'rgba(37,211,102,0.15)', border: '1px solid rgba(37,211,102,0.3)', borderRadius: 8, color: '#25D366', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                  <i className="ti ti-brand-whatsapp" aria-hidden="true" /> Open WhatsApp
                </button>
                <button onClick={resendOTP} disabled={timer > 0 || loading}
                  style={{ flex: 1, padding: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: timer > 0 ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.7)', cursor: timer > 0 ? 'default' : 'pointer', fontSize: 12 }}>
                  {timer > 0 ? `Resend in ${timer}s` : 'Resend OTP'}
                </button>
              </div>

              <button onClick={() => { setStep('phone'); setOtp(['','','','','','']); setError(''); }}
                style={{ width: '100%', padding: 8, background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 12, cursor: 'pointer', marginTop: 8 }}>
                ← Change phone number
              </button>
            </>
          )}

        </div>

        {/* Admin login link */}
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <Link to="/login" style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, textDecoration: 'none' }}>
            Are you an admin? → Admin Login
          </Link>
        </div>
      </div>
    </div>
  );
}