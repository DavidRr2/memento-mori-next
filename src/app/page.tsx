"use client";

// 파일 경로: src/app/page.tsx

import { FormEvent, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface AuthResponse {
  message?: string;
  error?: string;
}

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    const check = async () => {
      try {
        const response = await fetch("/api/me");
        if (response.ok) {
          const data = await response.json();
          if (data.logged_in) {
            router.replace("/studio/library");
            return;
          }
        }
      } catch (error) {
        console.error("로그인 상태 확인 실패", error);
      } finally {
        setLoading(false);
      }
    };
    check();
  }, [router]);

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[var(--bg-default)]">
        <p className="text-sm text-[var(--text-muted)]">Loading…</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[var(--bg-default)] px-6 py-16">
      <section className="w-full max-w-md space-y-8 rounded-[var(--radius-2xl)] bg-[var(--bg-surface)] p-10 shadow-[var(--elev-1)]">
        <div className="text-center space-y-2">
          <Badge type="neutral" size="md">
            Memento Mori Studio
          </Badge>
          <h1 className="text-2xl font-semibold text-[var(--text-default)]">
            로그인하고 당신만의 기억 공간을 시작하세요
          </h1>
          <p className="text-sm text-[var(--text-muted)] leading-6">
            업로드 · 편집 · 프라이버시 설정까지 모두 개인 계정에 저장됩니다.
            로그인 후에는 나만의 라이브러리로 이동합니다.
          </p>
        </div>
        <AuthForm
          onSuccess={() => router.replace("/studio/library")}
          onStatusMessage={setStatusMessage}
        />
        {statusMessage && (
          <p className="text-center text-sm text-[var(--text-muted)]">
            {statusMessage}
          </p>
        )}
      </section>
    </main>
  );
}

function AuthForm({
  onSuccess,
  onStatusMessage,
}: {
  onSuccess: () => void;
  onStatusMessage: (message: string | null) => void;
}) {
  const [isRegister, setIsRegister] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    onStatusMessage(null);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const email = formData.get("email");
    const password = formData.get("password");

    const response = await fetch(isRegister ? "/api/register" : "/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data: AuthResponse = await response.json();

    if (!response.ok) {
      setError(data.error || "문제가 발생했습니다. 다시 시도해주세요.");
    } else if (isRegister) {
      onStatusMessage("회원가입이 완료되었습니다. 로그인해주세요.");
      setIsRegister(false);
      form.reset();
    } else {
      onStatusMessage(null);
      onSuccess();
    }

    setSubmitting(false);
  };

  const handleToggleMode = () => {
    setIsRegister((previous) => !previous);
    setError(null);
    onStatusMessage(null);
    const currentForm = formRef.current;
    if (currentForm) {
      currentForm.reset();
    }
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
      <Input
        label="이메일"
        name="email"
        type="email"
        placeholder="you@example.com"
        required
      />
      <Input
        label="비밀번호"
        name="password"
        type="password"
        placeholder="••••••••"
        required
      />
      {error && <p className="text-sm text-[var(--warn)]">{error}</p>}
      <Button
        type="submit"
        className="w-full"
        disabled={submitting}
      >
        {isRegister ? "회원가입하기" : "로그인하기"}
      </Button>
      <Button
        type="button"
        variant="ghost"
        className="w-full"
        onClick={handleToggleMode}
      >
        {isRegister ? "이미 계정이 있으신가요? 로그인" : "새 계정 만들기"}
      </Button>
    </form>
  );
}
