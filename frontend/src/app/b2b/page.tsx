'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/lib/store';
import { FiLock, FiCheckCircle, FiFileText, FiList, FiAlertTriangle, FiArrowRight } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface Log {
  id: string;
  log_message: string;
  created_at: string;
}

export default function B2bPortal() {
  const storeSession = useStore((state) => state.b2bSession);
  const setStoreSession = useStore((state) => state.setB2bSession);
  const acceptAgreement = useStore((state) => state.acceptB2bAgreement);

  const [projectIdInput, setProjectIdInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [agreementChecked, setAgreementChecked] = useState(false);
  const [signatureName, setSignatureName] = useState('');
  const [logs, setLogs] = useState<Log[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  const agreementRef = useRef<HTMLDivElement>(null);

  // Fetch B2B logs if the session is active
  useEffect(() => {
    if (storeSession && storeSession.status === 'Active') {
      fetchLogs();
    }
  }, [storeSession]);

  const fetchLogs = async () => {
    if (!storeSession) return;
    setLoadingLogs(true);
    try {
      const { data, error } = await supabase
        .from('project_logs')
        .select('*')
        .eq('project_id', storeSession.projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLogs(data || []);
    } catch (err) {
      console.error('Error loading project logs:', err);
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectIdInput.trim()) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('b2b_sessions')
        .select('*')
        .eq('project_id', projectIdInput.trim())
        .single();

      if (error || !data) {
        toast.error('Invalid Project ID. Verify and try again.');
        return;
      }

      setStoreSession({
        projectId: data.project_id,
        status: data.status,
        signedName: data.signed_name || undefined,
      });

      toast.success('B2B Profile Loaded.');
    } catch (err) {
      toast.error('Unable to fetch project credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptAgreement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeSession) return;
    if (!agreementChecked) {
      toast.error('Please scroll to the bottom and accept the terms.');
      return;
    }
    if (!signatureName.trim()) {
      toast.error('Please type your legal signature to continue.');
      return;
    }

    setLoading(true);
    try {
      await acceptAgreement(signatureName.trim());
      toast.success('Agreement Accepted! Welcome to the Portal.');
    } catch {
      toast.error('Failed to submit signature. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = () => {
    if (agreementRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = agreementRef.current;
      // If client scrolled within 10px of bottom
      if (scrollHeight - scrollTop - clientHeight < 10) {
        setAgreementChecked(true);
      }
    }
  };

  // 1. Initial State: Enter Project ID
  if (!storeSession) {
    return (
      <div className="pt-32 pb-24 max-w-md mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-3xl p-8 border"
          style={{ borderColor: 'var(--border)', background: 'var(--bg-mid)' }}
        >
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-ochre/15 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-ochre/30">
              <FiLock className="text-ochre" size={24} />
            </div>
            <h1 className="font-display font-bold text-3xl" style={{ color: 'var(--text-primary)' }}>
              B2B Client Portal
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              Enter your Unique Project ID to access log files
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="b2b-project-id" className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>
                Unique Project ID
              </label>
              <input
                id="b2b-project-id"
                type="text"
                placeholder="e.g. VSVBQUBB"
                value={projectIdInput}
                onChange={(e) => setProjectIdInput(e.target.value)}
                required
                className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:border-ochre bg-transparent"
                style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              />
            </div>

            <button
              id="b2b-enter-portal-btn"
              type="submit"
              disabled={loading}
              className="btn-ochre w-full flex items-center justify-center gap-2"
            >
              {loading ? 'Authenticating…' : 'Enter Portal'} <FiArrowRight size={16} />
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // 2. Pending State: User Agreement Lock Modal
  if (storeSession.status === 'Pending') {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass w-full max-w-2xl rounded-3xl overflow-hidden border flex flex-col max-h-[85vh]"
          style={{ borderColor: 'var(--border)', background: 'var(--bg-mid)' }}
        >
          {/* Header */}
          <div className="p-6 border-b flex items-center gap-3" style={{ borderColor: 'var(--border)' }}>
            <FiFileText className="text-ochre" size={24} />
            <div>
              <h2 className="font-display font-bold text-xl" style={{ color: 'var(--text-primary)' }}>
                Master Services & User Agreement
              </h2>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Review and sign the agreement to unlock Project Logs
              </p>
            </div>
          </div>

          {/* Scrollable Terms */}
          <div
            ref={agreementRef}
            onScroll={handleScroll}
            className="flex-1 p-6 overflow-y-auto text-sm space-y-4 border-b text-justify font-sans"
            style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
          >
            <h3 className="font-bold text-cream">1. PURPOSE & SCOPE</h3>
            <p>
              This Master Services & User Agreement (the &quot;Agreement&quot;) governs access to project execution logs,
              commercial data sheets, and roll-out status metrics for distributions associated with project code {storeSession.projectId}.
            </p>

            <h3 className="font-bold text-cream">2. CONFIDENTIALITY & PROPRIETARY INFORMATION</h3>
            <p>
              All metrics, logs, source codes, price tracking spreadsheets, and deliverability details displayed inside this portal are
              highly confidential and proprietary to **REXPLORE TECHNOLOGIES** and RRR Foods. Distribution, screenshots, or duplication
              of these materials to third parties without prior written consent from the Project Lead is strictly prohibited and subject
              to legal recourse.
            </p>

            <h3 className="font-bold text-cream">3. DIGITALLY SIGNED ATTESTATION</h3>
            <p>
              By typing your full legal name below, you declare that you represent the authorized commercial distributor or corporate partner
              for project {storeSession.projectId}. You affirm your contract with REXPLORE TECH and accept all terms of use, privacy
              policies, and NDAs active for the fiscal year 2026.
            </p>

            <div className="p-3 bg-clay/10 border border-clay/30 rounded-xl flex items-start gap-2.5">
              <FiAlertTriangle className="text-clay shrink-0 mt-0.5" size={16} />
              <p className="text-xs text-clay">
                <strong>Attention:</strong> You must scroll to the very bottom of this document before you can type your signature and accept.
              </p>
            </div>
          </div>

          {/* Signature Footer */}
          <form onSubmit={handleAcceptAgreement} className="p-6 bg-white/2 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
              <div>
                <label htmlFor="b2b-sig-name" className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Digital Signature (Full Legal Name)
                </label>
                <input
                  id="b2b-sig-name"
                  type="text"
                  placeholder="Type legal name to sign"
                  value={signatureName}
                  onChange={(e) => setSignatureName(e.target.value)}
                  disabled={!agreementChecked}
                  required
                  className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-ochre bg-transparent disabled:opacity-50"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
              </div>

              <button
                id="b2b-sign-accept-btn"
                type="submit"
                disabled={loading || !agreementChecked || !signatureName.trim()}
                className="btn-ochre w-full py-2.5 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Submitting…' : 'Accept & Enter Portal'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    );
  }

  // 3. Active State: Render B2B Log Dashboard
  return (
    <div className="pt-24 pb-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 border-b pb-6" style={{ borderColor: 'var(--border)' }}>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display font-black text-4xl" style={{ color: 'var(--text-primary)' }}>
              B2B Partner Dashboard
            </h1>
            <span className="bg-green-900/30 text-green-400 text-xs font-bold px-2.5 py-1 rounded-full border border-green-800/40">
              Active
            </span>
          </div>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Project ID: <span className="font-mono text-ochre font-semibold">{storeSession.projectId}</span> · Signed by: <span className="italic">{storeSession.signedName}</span>
          </p>
        </div>

        <button
          onClick={() => {
            setStoreSession(null);
            setLogs([]);
          }}
          className="btn-ghost text-sm px-4 py-2 border rounded-xl"
          style={{ borderColor: 'var(--border)' }}
        >
          Exit Session
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Metrics Column */}
        <div className="lg:col-span-1 space-y-6">
          <div className="card p-6">
            <h3 className="font-display font-bold text-lg mb-4 text-ochre">Contract Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-secondary)' }}>Project Owner:</span>
                <span className="font-medium text-cream">REXPLORE TECH</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-secondary)' }}>Commercial License:</span>
                <span className="font-medium text-cream">Active (2026)</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-secondary)' }}>Signed Date:</span>
                <span className="font-medium text-cream">June 2026</span>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="font-display font-bold text-lg mb-2 text-ochre">Distribution Rollout</h3>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl font-bold text-cream">85%</span>
              <span className="text-xs text-green-400 font-semibold">On Schedule</span>
            </div>
            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
              <div className="bg-ochre h-full rounded-full" style={{ width: '85%' }} />
            </div>
            <p className="text-xs mt-3" style={{ color: 'var(--text-secondary)' }}>
              Logistics and delivery location validation configured across South India regions.
            </p>
          </div>
        </div>

        {/* Live Logs Stream Column */}
        <div className="lg:col-span-2">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 text-ochre">
                <FiList size={18} />
                <h3 className="font-display font-bold text-xl">Project Execution Logs</h3>
              </div>
              <button
                onClick={fetchLogs}
                disabled={loadingLogs}
                className="text-xs text-ochre hover:underline font-semibold"
              >
                {loadingLogs ? 'Refreshing…' : 'Refresh Logs'}
              </button>
            </div>

            {loadingLogs ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="skeleton h-16 rounded-xl" />
                ))}
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-10" style={{ color: 'var(--text-secondary)' }}>
                <p>No project execution logs found for this profile.</p>
              </div>
            ) : (
              <div className="space-y-6 relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-0.5 before:bg-white/5">
                {logs.map((log) => (
                  <div key={log.id} className="flex gap-4 relative">
                    <div className="w-9 h-9 rounded-full bg-ochre/10 border border-ochre/30 flex items-center justify-center shrink-0 z-10" style={{ background: 'var(--bg-mid)' }}>
                      <FiCheckCircle className="text-ochre" size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-mono mb-1" style={{ color: 'var(--text-secondary)' }}>
                        {new Date(log.created_at).toLocaleString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      <p className="text-sm font-medium leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                        {log.log_message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
