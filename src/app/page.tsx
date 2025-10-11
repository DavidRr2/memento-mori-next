// 파일 경로: src/app/page.tsx (Cloudflare R2 업로드 적용 최종본)

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
    onDelete: (id: number) => void;
    onEdit: (memory: Memory) => void;
}

interface MemoryFormProps {
    onMemoryCreated: () => void;
}

interface EditMemoryModalProps {
  memory: Memory | null;
  onSave: (id: number, formData: FormData) => void;
  onCancel: () => void;
}

// R2에 공개적으로 접근 가능한 URL 주소 ( .env.local 파일에서 설정 필요 )
const CLOUDFLARE_R2_PUBLIC_URL = process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL || '';


// --- 헬퍼 함수: 이미지 업로드 로직 ---
async function uploadImageToR2(imageFile: File): Promise<string | null> {
  // 1. 우리 서버에 Presigned URL 요청
  const presignedResponse = await fetch('/api/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      filename: imageFile.name,
      contentType: imageFile.type,
    }),
  });

  if (!presignedResponse.ok) {
    console.error("Presigned URL 요청 실패");
    return null;
  }

  const { url, fields, key } = await presignedResponse.json();

  // 2. R2에 직접 업로드하기 위한 FormData 생성
  const r2FormData = new FormData();
  Object.entries({ ...fields, file: imageFile }).forEach(([key, value]) => {
    r2FormData.append(key, value as string | Blob);
  });

  // 3. R2로 직접 파일 업로드
  const uploadResponse = await fetch(url, {
    method: 'POST',
    body: r2FormData,
  });

  if (!uploadResponse.ok) {
    console.error("R2 업로드 실패");
    const errorText = await uploadResponse.text();
    console.error("R2 Error:", errorText);
    return null;
  }

  // 4. 성공 시 R2에 저장된 파일 키(이름) 반환
  return key;
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
    setMessage('기록 중...');

    const form = event.currentTarget;
    const formData = new FormData(form);
    const content = formData.get('content') as string;
    const imageFile = formData.get('image') as File | null;

    if (!content.trim() && (!imageFile || imageFile.size === 0)) {
      setMessage('내용 또는 이미지를 입력/선택해주세요.');
      return;
    }

    let image_key: string | null = null;
    if (imageFile && imageFile.size > 0) {
      image_key = await uploadImageToR2(imageFile);
      if (!image_key) {
        setMessage('이미지 업로드 중 오류가 발생했습니다.');
        return;
      }
    }

    const finalFormData = new FormData();
    finalFormData.append('content', content);
    if (image_key) {
      finalFormData.append('image_filename', image_key);
    }
    
    const response = await fetch('/api/memories', {
      method: 'POST',
      body: finalFormData,
    });

    const data = await response.json();
    setMessage(data.message || data.error);

    if (response.ok) {
      form.reset();
      onMemoryCreated();
      setTimeout(() => setMessage(''), 3000);
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

function EditMemoryModal({ memory, onSave, onCancel }: EditMemoryModalProps) {
  if (!memory) return null;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const content = formData.get('content') as string;
    const imageFile = formData.get('image') as File | null;

    let image_key = memory.image_filename;

    if (imageFile && imageFile.size > 0) {
      image_key = await uploadImageToR2(imageFile);
      if (!image_key) {
        alert('새 이미지 업로드 중 오류가 발생했습니다.');
        return;
      }
    }
    
    const finalFormData = new FormData();
    finalFormData.append('content', content);
    if (image_key) {
      finalFormData.append('image_filename', image_key);
    }
    
    onSave(memory.id, finalFormData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white w-full max-w-lg p-8 rounded-lg shadow-2xl">
        <h2 className="text-xl font-bold mb-4">기억 수정하기</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <textarea
              name="content"
              defaultValue={memory.content}
              rows={5}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm"
            ></textarea>
          </div>
          {memory.image_filename && (
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">현재 이미지:</p>
              <Image src={`${CLOUDFLARE_R2_PUBLIC_URL}/${memory.image_filename}`} alt="Current Memory Image" width={200} height={150} className="rounded-md" />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              {memory.image_filename ? '새 이미지로 변경 (선택 사항)' : '이미지 추가 (선택 사항)'}
            </label>
            <input
              type="file"
              name="image"
              accept="image/*"
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onCancel} className="py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
              취소
            </button>
            <button type="submit" className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
              저장하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function MemoriesList({ memories, onDelete, onEdit }: MemoriesListProps) {
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
                src={`${CLOUDFLARE_R2_PUBLIC_URL}/${memory.image_filename}`} 
                alt="기억 이미지"
                width={600}
                height={400}
                className="w-full h-auto object-cover rounded-md"
                priority
                />
            </div>
          )}
          <p className="text-gray-800 whitespace-pre-wrap">{memory.content}</p>
          <div className="flex justify-between items-center mt-4">
            <span className="text-xs text-gray-400">
              {new Date(memory.created_at).toLocaleString()}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => onEdit(memory)}
                className="py-1 px-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                수정
              </button>
              <button 
                onClick={() => onDelete(memory.id)}
                className="py-1 px-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function MemorySection({ userEmail, onLogout }: MemorySectionProps) {
    const [memories, setMemories] = useState<Memory[] | null>(null);
    const [editingMemory, setEditingMemory] = useState<Memory | null>(null);

    const fetchMemories = async () => {
        const response = await fetch('/api/memories');
        if (response.ok) {
            const data = await response.json();
            setMemories(data);
        } else {
            setMemories([]);
        }
    };

    const handleDelete = async (id: number) => {
      if (confirm('정말로 이 기억을 삭제하시겠습니까?')) {
        const response = await fetch(`/api/memories/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          fetchMemories();
        } else {
          const data = await response.json();
          alert(data.error || '삭제 중 오류가 발생했습니다.');
        }
      }
    };

    const handleSaveEdit = async (id: number, formData: FormData) => {
      const response = await fetch(`/api/memories/${id}`, {
        method: 'PUT',
        body: formData,
      });

      if (response.ok) {
        setEditingMemory(null);
        fetchMemories();
      } else {
        const data = await response.json();
        alert(data.error || '수정 중 오류가 발생했습니다.');
      }
    };

    useEffect(() => {
        fetchMemories();
    }, []);

    return (
      <>
        <EditMemoryModal 
          memory={editingMemory}
          onSave={handleSaveEdit}
          onCancel={() => setEditingMemory(null)}
        />
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
                        <MemoriesList 
                          memories={memories} 
                          onDelete={handleDelete}
                          onEdit={(memory) => setEditingMemory(memory)}
                        />
                    )}
                </div>
            </main>
        </div>
      </>
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