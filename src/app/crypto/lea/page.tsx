'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function LeaPage() {
  const [signature, setSignature] = useState('');
  const [originalData, setOriginalData] = useState('');
  const [secretLength, setSecretLength] = useState('');
  const [appendData, setAppendData] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('/api/crypto/lea', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          signature,
          originalData,
          secretLength: parseInt(secretLength),
          appendData
        }),
      });
      
      const data = await response.json();
      setResult(data.result);
    } catch (error) {
      console.error('Error:', error);
      setResult('處理過程中發生錯誤');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <nav style={navbarStyle}>
        <Link href="https://crypto.ctf.scist.org/" style={navItemStyle}>SCIST Crypto CTF</Link>
      </nav>
      
      <h1 className="text-2xl font-bold mb-4">LEA Tool(Sha256)</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-2">Signature(hex)：</label>
          <input
            type="text"
            value={signature}
            onChange={(e) => setSignature(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="747279746f67657461646d696e726f6c6531323334353637383930"
          />
        </div>
        
        <div>
          <label className="block mb-2">Original Data：</label>
          <input
            type="text"
            value={originalData}
            onChange={(e) => setOriginalData(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="user=guest&admin=0"
          />
        </div>
        
        <div>
          <label className="block mb-2">SECRET Length：</label>
          <input
            type="number"
            value={secretLength}
            onChange={(e) => setSecretLength(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="50"
          />
        </div>
        
        <div>
          <label className="block mb-2">Append Data：</label>
          <input
            type="text"
            value={appendData}
            onChange={(e) => setAppendData(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="&admin=1"
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded w-full"
        >
          {loading ? 'Processing...' : 'Submit'}
        </button>
      </form>
      
      {result && (
        <div className="mt-4">
          <h2 className="text-xl font-bold">Result：</h2>
          <pre className="bg-gray-100 p-4 rounded mt-2 whitespace-pre-wrap">{result}</pre>
        </div>
      )}
    </div>
  );
}

const navbarStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  backgroundColor: '#333',
  padding: '15px 0',
  width: '100%',
  marginBottom: '20px'
};

const navItemStyle: React.CSSProperties = {
  color: '#fff',
  textDecoration: 'none',
  fontSize: '1.2rem',
  fontWeight: '500',
  padding: '0 20px',
};