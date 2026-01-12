import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { login } from '../services/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Mic, BarChart3, TrendingUp, Users } from 'lucide-react';
import toast from 'react-hot-toast';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login: loginUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const data = await login(email, password);
      loginUser(data.user, data.token);
      toast.success('Logged in successfully!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex w-full h-full overflow-hidden">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/90 to-primary/80 h-full">
        <div className="relative w-full h-full overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          </div>
          
          <div className="relative z-10 w-full h-full flex flex-col justify-center items-center p-12">
            <div className="max-w-md w-full space-y-8">
              <div className="flex items-center gap-3">
                <div className="p-4 rounded-2xl bg-white/20 backdrop-blur-sm">
                  <Mic className="h-10 w-10 text-white" />
                </div>
                <h1 className="text-4xl font-bold text-white">VoiceIQ</h1>
              </div>
              
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-white">
                  Analyze call quality with AI-powered insights
                </h2>
                <p className="text-white/90 text-lg">
                  Transform your call recordings into actionable insights. Get instant transcripts, scores, and summaries.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6 pt-8">
                <div className="space-y-2">
                  <div className="p-3 rounded-lg bg-white/10 backdrop-blur-sm w-fit">
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-white">AI Scoring</h3>
                  <p className="text-sm text-white/80">Automated quality assessment</p>
                </div>
                <div className="space-y-2">
                  <div className="p-3 rounded-lg bg-white/10 backdrop-blur-sm w-fit">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-white">Analytics</h3>
                  <p className="text-sm text-white/80">Detailed call insights</p>
                </div>
                <div className="space-y-2">
                  <div className="p-3 rounded-lg bg-white/10 backdrop-blur-sm w-fit">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-white">Team Ready</h3>
                  <p className="text-sm text-white/80">Manage your calls</p>
                </div>
                <div className="space-y-2">
                  <div className="p-3 rounded-lg bg-white/10 backdrop-blur-sm w-fit">
                    <Mic className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-white">Transcription</h3>
                  <p className="text-sm text-white/80">Automatic speech-to-text</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center bg-background w-full h-full overflow-y-auto">
        <div className="w-full max-w-md p-6">
          <div className="lg:hidden text-center space-y-3 mb-6">
            <div className="flex items-center justify-center gap-3">
              <div className="p-3 rounded-xl bg-primary/10">
                <Mic className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-4xl font-bold text-foreground">VoiceIQ</h1>
            </div>
          </div>

          <Card className="shadow-lg border">
            <CardHeader className="space-y-2 pb-4">
              <CardTitle className="text-2xl font-bold text-center">Welcome back</CardTitle>
              <CardDescription className="text-center">
                Sign in to your account to continue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-foreground">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-foreground">
                    Password
                  </label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11"
                    required
                  />
                </div>
                <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={loading}>
                  {loading ? 'Signing in...' : 'Sign in'}
                </Button>
              </form>
              <div className="mt-6 mb-4 text-center text-sm">
                <span className="text-muted-foreground">Don't have an account? </span>
                <Link to="/signup" className="text-primary font-semibold hover:underline">
                  Sign up
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Login;
