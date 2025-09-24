// 파일 경로: src/app/page.tsx (최종 완성본)

'use client';

import { useState, useEffect, FormEvent } from 'react';
import Image from 'next/image';

// --- 타입 정의 ---
interface User {
  logged_in: boolean;
  email?: string;
}

interface Memory {
  id: number;
  content: string;
  image_filename: string | null;
  created_at: string;
}

interface AuthFormProps {
  onAuthSuccess: () => void;
}

interface MemorySectionProps {
  userEmail: string;
  onLogout: () => void;
}

interface MemoriesListProps {
    memories: Memory[];
}

interface MemoryFormProps {
    onMemoryCreated: () => void;
}

// --- 컴포넌트들 ---

function AuthForm({ onAuthSuccess }: AuthFormProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const target = event.target as HTMLFormElement;
    const email = (target.elements.namedItem('email') as HTMLInputElement).value;
    const password = (target.elements.namedItem('password') as HTMLInputElement).value;
    const url = isRegister ? '/api/register' : '/api/login';

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    setMessage(data.message || data.error);

    if (response.ok) {
        if (isRegister) {
            target.reset(); 
            setMessage('회원가입 성공! 이제 로그인해주세요.');
        } else {
            onAuthSuccess();
        }
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-xl">
        <h2 className="text-2xl font-bold text-center text-gray-900">
          {isRegister ? '회원가입' : 'Memento Mori'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              이메일
            </label>
            <input 
              id="email"
              type="email" 
              name="email" 
              placeholder="you@example.com" 
              required 
              autoComplete="off" 
              className="mt-1 w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="password"  className="block text-sm font-medium text-gray-700">
              비밀번호
            </label>
            <input 
              id="password"
              type="password" 
              name="password" 
              placeholder="••••••••" 
              required 
              autoComplete="off" 
              className="mt-1 w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <button 
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {isRegister ? '회원가입하기' : '로그인하기'}
            </button>
          </div>
        </form>
        <p className="text-center text-red-500 text-sm h-4">{message}</p>
        <p className="text-center text-sm">
          <button 
            onClick={() => { setIsRegister(!isRegister); setMessage(''); }}
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            {isRegister ? '이미 계정이 있으신가요? 로그인' : '계정이 없으신가요? 회원가입'}
          </button>
        </p>
      </div>
    </div>
  );
}

function MemoryForm({ onMemoryCreated }: MemoryFormProps) {
  const [message, setMessage] = useState('');
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const content = formData.get('content') as string;
    const image = formData.get('image') as File;
    if (!content.trim() && (!image || image.size === 0)) {
        setMessage('내용 또는 이미지를 입력/선택해주세요.');
        return;
    }
    setMessage('기록 중...');
    const response = await fetch('/api/memories', {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    setMessage(data.message || data.error);
    if (response.ok) {
      (event.target as HTMLFormElement).reset();
      onMemoryCreated();
    }
  };

  return (
    <section className="w-full max-w-2xl p-8 space-y-6 bg-white rounded-lg shadow-xl">
      <h2 className="text-xl font-bold text-gray-800">새로운 기억을 기록하세요</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <textarea 
            name="content" 
            rows={5} 
            placeholder="오늘을 기억하고 싶은 순간을 기록하세요..."
            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          ></textarea>
        </div>
        <div>
          <input 
            type="file" 
            name="image" 
            accept="image/*" 
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />
        </div>
        <div>
          <button 
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            기억 기록하기
          </button>
        </div>
      </form>
      <p className="text-center text-sm h-4">{message}</p>
    </section>
  );
}

function MemoriesList({ memories }: MemoriesListProps) {
  if (memories.length === 0) {
    return (
        <div className="text-center py-10 px-6 bg-white rounded-lg shadow-xl">
            <h3 className="text-lg font-medium text-gray-700">기록된 기억이 아직 없습니다.</h3>
            <p className="mt-1 text-sm text-gray-500">첫 번째 기억을 기록해보세요!</p>
        </div>
    );
  }
  
  return (
    <div className="w-full max-w-2xl space-y-6">
      {memories.map(memory => (
        <div key={memory.id} className="bg-white p-6 rounded-lg shadow-xl overflow-hidden">
          {memory.image_filename && (
            <div className="mb-4">
                <Image 
                src={`/uploads/${memory.image_filename}`} 
                alt="기억 이미지"
                width={600}
                height={400}
                className="w-full h-auto object-cover rounded-md"
                priority
                />
            </div>
          )}
          <p className="text-gray-800 whitespace-pre-wrap">{memory.content}</p>
          <span className="block text-right text-xs text-gray-400 mt-4">
            {new Date(memory.created_at).toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}

function MemorySection({ userEmail, onLogout }: MemorySectionProps) {
    const [memories, setMemories] = useState<Memory[] | null>(null);
    const fetchMemories = async () => {
        const response = await fetch('/api/memories');
        if (response.ok) {
            const data = await response.json();
            setMemories(data);
        } else {
            setMemories([]);
        }
    };
    useEffect(() => {
        fetchMemories();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
            <header className="w-full max-w-2xl mb-8 flex justify-between items-center">
                <div className="text-sm text-gray-600">
                    <span className="font-semibold">{userEmail}</span>님, 안녕하세요.
                </div>
                <button 
                    onClick={onLogout}
                    className="py-1 px-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    로그아웃
                </button>
            </header>
            <main className="w-full max-w-2xl flex flex-col items-center space-y-8">
                <MemoryForm onMemoryCreated={fetchMemories} />
                <div className="w-full">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">기록된 기억들</h2>
                    {memories === null ? (
                        <p>기억을 불러오는 중...</p>
                    ) : (
                        <MemoriesList memories={memories} />
                    )}
                </div>
            </main>
        </div>
    )
}


// --- 최종 메인 페이지 ---
export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);

  const checkLoginStatus = async () => {
    try {
      const response = await fetch('/api/me');
      const data = await response.json();
      setUser(data);
    } catch (error) {
      console.error('Error checking login status:', error);
      setUser({ logged_in: false });
    }
  };

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' }); 
    checkLoginStatus();
  }

  if (user === null) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <main>
      {user.logged_in && user.email ? (
        <MemorySection userEmail={user.email} onLogout={handleLogout} />
      ) : (
        <AuthForm onAuthSuccess={checkLoginStatus} />
      )}
    </main>
  );
}