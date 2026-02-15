import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const AuthApp = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [user, setUser] = useState<any>(null);

  // Check current session on mount
  useState(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMessage(error.message);
      else setMessage("Logged in!");
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin },
      });
      if (error) setMessage(error.message);
      else setMessage("Check your email to confirm your account.");
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setMessage("Logged out.");
  };

  if (user) {
    return (
      <div className="p-4 h-full flex flex-col items-center justify-center gap-3" style={{ background: "hsl(210 30% 95%)" }}>
        <div className="text-3xl">👤</div>
        <p className="text-sm font-semibold" style={{ color: "hsl(210 20% 30%)" }}>
          Signed in as
        </p>
        <p className="text-xs" style={{ color: "hsl(210 15% 45%)" }}>{user.email}</p>
        <button
          onClick={handleLogout}
          className="mt-2 px-4 py-1.5 text-xs font-medium rounded"
          style={{
            background: "linear-gradient(180deg, hsl(210 60% 50%), hsl(210 60% 42%))",
            color: "white",
            border: "1px solid hsl(210 50% 35%)",
          }}
        >
          Log Out
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 h-full flex flex-col" style={{ background: "hsl(210 30% 95%)" }}>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">👤</span>
        <h2 className="text-sm font-bold" style={{ color: "hsl(210 20% 30%)" }}>
          {isLogin ? "Log In" : "Register"}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-2.5 flex-1">
        <label className="text-xs font-medium" style={{ color: "hsl(210 15% 40%)" }}>
          Email
        </label>
        <input
          type="email"
          required
          maxLength={255}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="px-2 py-1.5 text-xs rounded border outline-none"
          style={{
            background: "white",
            borderColor: "hsl(210 20% 80%)",
            color: "hsl(210 20% 20%)",
          }}
        />

        <label className="text-xs font-medium" style={{ color: "hsl(210 15% 40%)" }}>
          Password
        </label>
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="px-2 py-1.5 text-xs rounded border outline-none"
          style={{
            background: "white",
            borderColor: "hsl(210 20% 80%)",
            color: "hsl(210 20% 20%)",
          }}
        />

        <button
          type="submit"
          disabled={loading}
          className="mt-1 px-4 py-1.5 text-xs font-medium rounded"
          style={{
            background: "linear-gradient(180deg, hsl(210 60% 50%), hsl(210 60% 42%))",
            color: "white",
            border: "1px solid hsl(210 50% 35%)",
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? "Please wait…" : isLogin ? "Log In" : "Register"}
        </button>

        {message && (
          <p className="text-xs mt-1" style={{ color: "hsl(210 50% 40%)" }}>
            {message}
          </p>
        )}

        <button
          type="button"
          onClick={() => { setIsLogin((v) => !v); setMessage(""); }}
          className="text-xs mt-auto underline"
          style={{ color: "hsl(210 50% 45%)" }}
        >
          {isLogin ? "Don't have an account? Register" : "Already have an account? Log In"}
        </button>
      </form>
    </div>
  );
};

export default AuthApp;
