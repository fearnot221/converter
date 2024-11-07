'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
    const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
    const [fileNames, setFileNames] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [width, setWidth] = useState<string>('');
    const [height, setHeight] = useState<string>('');
    const [convertedImages, setConvertedImages] = useState<string[]>([]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
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

    const handleConvert = async () => {
        if (!selectedFiles.length) return;
        setLoading(true);
        setError(null);

        try {
            const converted = await Promise.all(selectedFiles.map(async (file) => {
                const response = await fetch('/api/resize-image', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ image: file, width: parseInt(width), height: parseInt(height) }),
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
            a.download = `${fileNames[index].replace(/\.[^/.]+$/, '')}_resized.${fileNames[index].split('.').pop()}`;
            a.click();
        });
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        const files = Array.from(e.dataTransfer.files);
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

    return (
        <div style={containerStyle}>
            <nav style={navbarStyle}>
                <Link href="/" style={navItemStyle}>Home</Link>
                <Link href="/convert/png-to-jpg" style={navItemStyle}>PNG to JPG</Link>
                <Link href="/convert/jpg-to-png" style={navItemStyle}>JPG to PNG</Link>
            </nav>
            <h1 style={headingStyle}>Image Resizer</h1>
            <div
                style={uploadAreaStyle}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
            >
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={fileInputStyle}
                    multiple
                    id="file-upload"
                />
                <label htmlFor="file-upload" style={uploadButtonStyle}>
                    Choose Files
                </label>
                <p style={uploadTextStyle}>Drag or click to select files.</p>
            </div>

            {/* Preview selected images */}
            {selectedFiles.length > 0 && (
                <div style={previewContainerStyle}>
                    {selectedFiles.map((file, index) => (
                        <div style={imagePreviewWrapperStyle} key={index}>
                            <Image
                                src={file}
                                alt={`preview-${index}`}
                                width={150}
                                height={150}
                                style={imagePreviewStyle}
                            />
                        </div>
                    ))}
                </div>
            )}

            <div style={actionAreaStyle}>
                <input
                    type="number"
                    placeholder="Width"
                    value={width}
                    onChange={(e) => setWidth(e.target.value)}
                    style={inputStyle}
                />
                <input
                    type="number"
                    placeholder="Height"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    style={inputStyle}
                />
                <button
                    onClick={convertedImages.length ? handleDownloadAll : handleConvert}
                    disabled={!selectedFiles.length || loading}
                    style={buttonStyle}
                >
                    {loading ? 'Resizing...' : convertedImages.length ? 'Download All Files' : 'Resize Images'}
                </button>
            </div>

            {error && <p style={errorStyle}>{error}</p>}
        </div>
    );
}

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

const inputStyle: React.CSSProperties = {
    margin: '10px',
    padding: '10px',
    fontSize: '1rem',
    borderRadius: '5px',
    border: '1px solid #ccc',
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
    transition: 'background-color 0.3s ease, transform 0.3s ease-in-out',
};

const uploadTextStyle: React.CSSProperties = {
    marginTop: '20px',
    fontSize: '1.1rem',
    color: '#666',
};

const previewContainerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '20px',
    flexWrap: 'wrap',
};

const imagePreviewWrapperStyle: React.CSSProperties = {
    margin: '10px',
};

const imagePreviewStyle: React.CSSProperties = {
    borderRadius: '8px',
    border: '2px solid #f1f1f1',
    maxWidth: '150px',
    maxHeight: '150px',
    objectFit: 'cover',
};

const actionAreaStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '40px',
    width: '100%',
};

const errorStyle: React.CSSProperties = {
    color: '#ff4d4d',
    fontSize: '1.1rem',
    marginTop: '10px',
};
