'use client';
import { useState } from 'react';
import JSZip from 'jszip';
import Link from 'next/link'; // Import Link from Next.js
import Image from 'next/image'; // Import Image from Next.js

export default function Home() {
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [convertedImages, setConvertedImages] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter(file => file.type === 'image/jpeg');
    handleFileSelection(files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleFileSelection = (files: File[]) => {
    const readerPromises = files.map(file => new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    }));
    Promise.all(readerPromises).then(results => {
      setSelectedFiles(results);
      setFileNames(files.map(file => file.name));
      setConvertedImages([]);
      setError(null);
    }).catch(() => setError('Error reading files'));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).filter(file => file.type === 'image/jpeg');
    handleFileSelection(files);
  };

  const handleConvert = async () => {
    if (!selectedFiles.length) return;
    setLoading(true);
    setError(null);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 5;
      });
    }, 100);

    try {
      const converted = await Promise.all(selectedFiles.map(async (file) => {
        const response = await fetch('/api/convert/jpg-to-png', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: file }),
        });
        const data = await response.json();
        if (response.ok) return data.image;
        else throw new Error(data.error || 'Conversion failed');
      }));
      setConvertedImages(converted);
    } catch {
      setError('An error occurred during conversion.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadAll = () => {
    convertedImages.forEach((image, index) => {
      const a = document.createElement('a');
      a.href = image;
      a.download = `${fileNames[index].replace('.jpg', '')}_converted.png`;
      a.click();
    });
  };

  const handleDownloadZip = async () => {
    try {
      const zip = new JSZip();
      const folder = zip.folder('converted_images');
      for (let i = 0; i < convertedImages.length; i++) {
        const image = convertedImages[i];
        const response = await fetch(image);
        const blob = await response.blob();
        folder?.file(`${fileNames[i].replace('.jpg', '')}_converted.png`, blob);
      }
      zip.generateAsync({ type: 'blob' }).then((content) => {
        const url = URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'converted_images.zip';
        a.click();
        URL.revokeObjectURL(url);
      });
    } catch {
      setError('Error downloading ZIP');
    }
  };

  return (
    <div style={containerStyle}>
      <nav style={navbarStyle}>
        <Link href="/" style={navItemStyle}>Home</Link>
        <Link href="/convert/png-to-jpg" style={navItemStyle}>PNG to JPG</Link>
        <Link href="/resize-image" style={navItemStyle}>Resize Image</Link>
      </nav>
      <h1 style={headingStyle}>JPG to PNG Converter</h1>
      <div
        style={uploadAreaStyle}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <input
          type="file"
          accept="image/jpeg"
          onChange={handleFileChange}
          style={fileInputStyle}
          multiple
          id="file-upload"
        />
        <label htmlFor="file-upload" style={uploadButtonStyle}>
          Choose JPG Files
        </label>
        <p style={uploadTextStyle}>Drag or click to select JPG files.</p>
      </div>
      <div style={previewContainerStyle}>
        {selectedFiles.map((file, index) => (
          <div key={index} style={imagePreviewWrapperStyle}>
            <Image src={file} alt="Selected JPG" style={imagePreviewStyle} width={150} height={150} />
          </div>
        ))}
      </div>
      <div style={actionAreaStyle}>
        <button
          onClick={convertedImages.length ? handleDownloadAll : handleConvert}
          disabled={!selectedFiles.length || loading}
          style={buttonStyle}
        >
          {loading ? (
            <div className="spinner" style={spinnerStyle}></div>
          ) : convertedImages.length ? (
            'Download All Files'
          ) : (
            'Convert to PNG'
          )}
        </button>
      </div>
      {convertedImages.length > 0 && (
        <button onClick={handleDownloadZip} style={buttonStyle}>
          Download All as ZIP
        </button>
      )}
      {error && <p style={errorStyle}>{error}</p>}
      {loading && (
        <div style={progressContainerStyle}>
          <div style={progressBarStyle}>
            <div style={{ ...progressIndicatorStyle, width: `${progress}%` }} />
          </div>
          <p style={progressTextStyle}>{`Converting... ${progress}%`}</p>
        </div>
      )}
    </div>
  );
}

const previewContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
  gap: '10px',
  marginTop: '20px',
  width: '100%',
};

const uploadAreaStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '30px',
    borderRadius: '12px',
    backgroundColor: '#fff',
    border: '2px dashed #ccd1d9',
    boxSizing: 'border-box',
    cursor: 'pointer',
    marginBottom: '20px',
    width: '80%',
};

const fileInputStyle: React.CSSProperties = {
    display: 'none',
};

const uploadButtonStyle: React.CSSProperties = {
    display: 'inline-block',
    padding: '12px 35px',
    fontSize: '1.2rem',
    backgroundColor: '#6c757d',
    color: '#fff',
    border: 'none',
    borderRadius: '50px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease, transform 0.3s ease',
    marginBottom: '10px',
};

const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '60px',
    padding: '30px',
    background: '#f7f7f7',
    borderRadius: '15px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
    maxWidth: '900px',
    margin: 'auto',
    fontFamily: 'Roboto, sans-serif',
    color: '#333',
};

const headingStyle: React.CSSProperties = {
    fontSize: '2.5rem',
    fontWeight: '700',
    marginBottom: '20px',
    color: '#2f3542',
    textAlign: 'center',
    width: '100%',
};

const actionAreaStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
};

const imagePreviewWrapperStyle: React.CSSProperties = {
    maxWidth: '200px',
};

const imagePreviewStyle: React.CSSProperties = {
    width: '100%',
    height: 'auto',
    borderRadius: '10px',
};

const spinnerStyle: React.CSSProperties = {
    border: '4px solid rgba(255, 255, 255, 0.3)',
    borderTop: '4px solid #fff',
    borderRadius: '50%',
    width: '24px',
    height: '24px',
    animation: 'spin 1s linear infinite',
};

const buttonStyle: React.CSSProperties = {
    padding: '12px 35px',
    fontSize: '1.2rem',
    backgroundColor: '#6c757d',
    color: '#fff',
    border: 'none',
    borderRadius: '50px',
    cursor: 'pointer',
    width: '100%',
    marginTop: '20px',
    transition: 'background-color 0.3s ease, transform 0.3s ease-in-out',
};

const errorStyle: React.CSSProperties = {
    color: '#ff6347',
    fontSize: '1.2rem',
    textAlign: 'center',
    marginTop: '20px',
};

const navItemStyle: React.CSSProperties = {
    color: '#fff',
    textDecoration: 'none',
    fontSize: '1.2rem',
    fontWeight: '500',
    padding: '0 20px',
  };
  
  const navbarStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    backgroundColor: '#333',
    padding: '15px 0',
    width: '100%',
  };

const progressContainerStyle: React.CSSProperties = {
    marginTop: '30px',
    textAlign: 'center',
};

const progressBarStyle: React.CSSProperties = {
    width: '100%',
    backgroundColor: '#ddd',
    borderRadius: '8px',
    height: '20px',
};

const progressIndicatorStyle: React.CSSProperties = {
    backgroundColor: '#007bff',
    height: '100%',
    borderRadius: '8px',
};

const progressTextStyle: React.CSSProperties = {
    fontSize: '1.2rem',
    marginTop: '10px',
    color: '#007bff',
};

const uploadTextStyle: React.CSSProperties = {
    color: '#555',
    fontSize: '1.2rem',
};