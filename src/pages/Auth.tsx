import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Shield, Mail, Lock, User, Chrome, ArrowRight, Loader2, Building2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Auth() {
    const { user, login, signup, loginWithGoogle } = useAuth();
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [role, setRole] = useState<'citizen' | 'admin'>('citizen');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    if (user) return <Navigate to="/" replace />;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (isLogin) {
                await login(email, password, role);
                toast.success(`Welcome to the ${role === 'admin' ? 'Authority' : 'Citizen'} Portal`);
            } else {
                if (password !== confirmPassword) {
                    toast.error('Passkeys do not match. Please verify.');
                    setIsLoading(false);
                    return;
                }
                await signup(email, password, name, role);
                toast.success('Registration successful. Welcome to FixMyCity.');
            }
            navigate('/');
        } catch (error) {
            toast.error('Authentication error. Please verify your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        try {
            await loginWithGoogle(role);
            toast.success(`Government ID verified via Google (${role === 'admin' ? 'Admin' : 'Citizen'})`);
            navigate('/');
        } catch (error) {
            toast.error('Identity verification failed.');
        } finally {
            setIsLoading(false);
        }
    };

    const isAdmin = role === 'admin';

    return (
        <div className={`min-h-screen w-full flex items-center justify-center p-6 bg-[#F8FAFC] relative overflow-hidden transition-all duration-700`}>
            {/* Minimal SVG Grid Pattern for Professional Look */}
            <div className="absolute inset-0 z-0 opacity-[0.03]" style={{ backgroundImage: `radial-gradient(#0F172A 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />

            {/* Subtle Gradient Blooms */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className={`absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[150px] transition-all duration-1000 ${isAdmin ? 'bg-blue-900/10' : 'bg-primary/5'}`} />
                <div className={`absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full blur-[150px] transition-all duration-1000 ${isAdmin ? 'bg-teal-900/10' : 'bg-teal-500/5'}`} />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-[480px] z-10"
            >
                {/* Secure Brand Header */}
                <div className="text-center mb-10">
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="inline-flex items-center justify-center mb-4 transition-transform duration-500"
                    >
                        <img
                            src="/logo.png"
                            alt="FixMyCity"
                            className="h-20 w-auto object-contain"
                        />
                    </motion.div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.3em] ml-1">Official Governance Node</p>
                </div>

                {/* Portal Selector */}
                <div className="flex bg-white/80 backdrop-blur-md p-1.5 rounded-[1.5rem] border border-slate-200 mb-8 shadow-sm">
                    <button
                        onClick={() => setRole('citizen')}
                        className={`flex-1 py-3.5 rounded-xl text-xs font-black tracking-widest transition-all duration-500 uppercase flex items-center justify-center gap-2.5 ${!isAdmin ? 'bg-[#0F172A] text-white shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <User className="w-4 h-4" />
                        Citizen Portal
                    </button>
                    <button
                        onClick={() => setRole('admin')}
                        className={`flex-1 py-3.5 rounded-xl text-xs font-black tracking-widest transition-all duration-500 uppercase flex items-center justify-center gap-2.5 ${isAdmin ? 'bg-primary text-white shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <Shield className="w-4 h-4" />
                        Authority Portal
                    </button>
                </div>

                <div className="bg-white rounded-[2.5rem] p-10 md:p-14 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 relative group transition-all duration-500">
                    <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r transition-all duration-700 ${isAdmin ? 'from-primary to-teal-400' : 'from-slate-900 to-slate-700'}`} />

                    <div className="mb-10">
                        <h2 className="text-3xl font-black text-slate-900 mb-2">
                            {isLogin ? 'Welcome Back' : 'Registration'}
                        </h2>
                        <p className="text-slate-500 font-bold text-sm">
                            {isAdmin ? 'Authenticate via the Authority Identity Service' : 'Access the unified citizen reporting platform'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <AnimatePresence mode="wait">
                            {!isLogin && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="space-y-1.5"
                                >
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Government ID Name</label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-primary transition-colors" />
                                        <Input
                                            placeholder="Legal Full Name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="pl-11 h-14 bg-slate-50 border-slate-100 rounded-2xl focus:ring-primary/20 transition-all font-bold placeholder:text-slate-300"
                                            required={!isLogin}
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Official Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-primary transition-colors" />
                                <Input
                                    type="email"
                                    placeholder="name@official.gov"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-11 h-14 bg-slate-50 border-slate-100 rounded-2xl focus:ring-primary/20 transition-all font-bold placeholder:text-slate-300"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Secure Passkey</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-primary transition-colors" />
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-11 h-14 bg-slate-50 border-slate-100 rounded-2xl focus:ring-primary/20 transition-all font-bold placeholder:text-slate-300"
                                    required
                                />
                            </div>
                        </div>

                        {!isLogin && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="space-y-1.5"
                            >
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm Security Passkey</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-primary transition-colors" />
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="pl-11 h-14 bg-slate-50 border-slate-100 rounded-2xl focus:ring-primary/20 transition-all font-bold placeholder:text-slate-300"
                                        required={!isLogin}
                                    />
                                </div>
                            </motion.div>
                        )}

                        <Button
                            type="submit"
                            className={`w-full h-15 rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl transition-all duration-500 group overflow-hidden relative ${isAdmin ? 'bg-primary hover:bg-primary/90 text-white shadow-primary/30' : 'bg-slate-950 hover:bg-slate-900 text-white shadow-slate-900/30'}`}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                <span className="flex items-center justify-center gap-3">
                                    {isLogin ? 'Verify Identity' : 'Register Profile'}
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
                                </span>
                            )}
                        </Button>
                    </form>

                    <div className="relative my-10 text-center">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-100"></div>
                        </div>
                        <span className="relative bg-white px-6 text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">Integrated Auth</span>
                    </div>

                    <Button
                        variant="outline"
                        type="button"
                        onClick={handleGoogleSignIn}
                        disabled={isLoading}
                        className="w-full h-14 rounded-2xl border-slate-100 bg-white hover:bg-slate-50 transition-all font-bold gap-3 text-slate-600 shadow-sm"
                    >
                        <Chrome className="w-5 h-5 text-slate-400" />
                        Verify via Google SSO
                    </Button>

                    <div className="mt-12 text-center">
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-primary transition-all underline decoration-2 underline-offset-8 decoration-slate-100 hover:decoration-primary/30"
                        >
                            {isLogin ? "Request New Credentials" : 'Existing User Verification'}
                        </button>
                    </div>
                </div>

                <p className="mt-10 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Secured by 256-bit encryption • Privacy Policy • Council Terms
                </p>
            </motion.div>
        </div>
    );
}
