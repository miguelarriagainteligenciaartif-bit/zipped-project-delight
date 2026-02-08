import { useState } from 'react';
import { TrendingUp, User, Lock, ArrowRight, Mail, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

interface AuthScreenProps {
  onLogin: () => void;
}

export default function AuthScreen({ onLogin }: AuthScreenProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const { error } = await signIn(email.trim(), password);
    if (error) {
      if (error.message.includes('Email not confirmed')) {
        setMessage({ text: 'Debes confirmar tu email antes de iniciar sesión. Revisa tu bandeja de entrada.', type: 'error' });
      } else if (error.message.includes('Invalid login credentials')) {
        setMessage({ text: 'Email o contraseña incorrectos', type: 'error' });
      } else {
        setMessage({ text: error.message, type: 'error' });
      }
      setLoading(false);
    } else {
      setMessage({ text: 'Inicio de sesión exitoso', type: 'success' });
      setTimeout(() => onLogin(), 500);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage({ text: 'Las contraseñas no coinciden', type: 'error' });
      return;
    }
    if (username.trim().length < 3) {
      setMessage({ text: 'El nombre de usuario debe tener al menos 3 caracteres', type: 'error' });
      return;
    }

    setLoading(true);
    setMessage(null);

    const { error } = await signUp(email.trim(), password, username.trim());
    if (error) {
      setMessage({ text: error.message, type: 'error' });
      setLoading(false);
    } else {
      setEmailSent(true);
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'linear-gradient(135deg, hsl(0 0% 5%) 0%, hsl(0 0% 12%) 100%)' }}>
        <div className="w-full max-w-md slide-up">
          <div className="card-surface p-8 md:p-10 text-center">
            <div className="w-16 h-16 gold-gradient rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-primary-foreground" />
            </div>
            <h2 className="text-xl font-titles font-bold text-foreground mb-3">Confirma tu Email</h2>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              Hemos enviado un enlace de confirmación a <strong className="text-primary">{email}</strong>. 
              Revisa tu bandeja de entrada (y spam) y haz clic en el enlace para activar tu cuenta.
            </p>
            <div className="flex items-start gap-3 p-4 rounded-lg border-2 border-primary/30 bg-primary/5 text-left mb-6">
              <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <span className="text-xs text-muted-foreground">
                Una vez confirmado tu email, podrás iniciar sesión con tus credenciales.
              </span>
            </div>
            <button
              onClick={() => { setEmailSent(false); setMode('login'); setPassword(''); setConfirmPassword(''); setMessage(null); }}
              className="w-full py-3 gold-gradient text-primary-foreground font-titles font-bold rounded-lg hover:opacity-90 transition-all gold-shadow"
            >
              Ir a Iniciar Sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'linear-gradient(135deg, hsl(0 0% 5%) 0%, hsl(0 0% 12%) 100%)' }}>
      <div className="w-full max-w-md slide-up">
        <div className="card-surface p-8 md:p-10">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-3">
              <TrendingUp className="w-10 h-10 text-primary" />
              <h1 className="text-2xl md:text-3xl font-titles font-bold tracking-wider text-primary">
                EDGECORE NASDAQ
              </h1>
            </div>
            <p className="text-muted-foreground text-sm">Sistema de Ejecución — Nueva York</p>
          </div>

          {/* Form */}
          <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="space-y-5">
            <h2 className="text-xl font-titles font-semibold text-center text-foreground">
              {mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
            </h2>

            {mode === 'register' && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-primary">Nombre de Usuario</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    minLength={3}
                    className="w-full pl-10 pr-4 py-3 bg-background border-2 border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors"
                    placeholder="Tu nombre de usuario"
                  />
                </div>
                <span className="text-xs text-muted-foreground">Mínimo 3 caracteres</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-primary">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-background border-2 border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors"
                  placeholder="tu@email.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-primary">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full pl-10 pr-4 py-3 bg-background border-2 border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors"
                  placeholder="••••••••"
                />
              </div>
              {mode === 'register' && <span className="text-xs text-muted-foreground">Mínimo 6 caracteres</span>}
            </div>

            {mode === 'register' && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-primary">Confirmar Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-background border-2 border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            )}

            {message && (
              <div className={`p-3 rounded-lg text-center text-sm font-medium ${
                message.type === 'success'
                  ? 'bg-success/20 text-success border border-success/50'
                  : 'bg-destructive/20 text-destructive border border-destructive/50'
              }`}>
                {message.text}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 gold-gradient text-primary-foreground font-titles font-bold rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition-all hover:-translate-y-0.5 gold-shadow disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {mode === 'login' ? 'Entrar' : 'Registrarse'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-muted-foreground">
            {mode === 'login' ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
            <button
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setMessage(null); }}
              className="text-primary font-semibold hover:text-accent transition-colors"
            >
              {mode === 'login' ? 'Regístrate aquí' : 'Inicia sesión aquí'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
