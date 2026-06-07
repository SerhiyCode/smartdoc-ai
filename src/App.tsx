import { useState } from 'react';
import { FileUploader } from './components/FileUploader';
import { ChatBox } from './components/ChatBox';
import { BarChart2, Trash2, ShieldCheck } from 'lucide-react';

type FileStats = {
  totalLines: number;
  uniqueLines: number;
  duplicates: number;
  compressionRate: number;
};

export default function App() {
  const [fileAttached, setFileAttached] = useState<boolean>(false);
  const [isFileUploading, setIsFileUploading] = useState<boolean>(false);
  const [chatKey, setChatKey] = useState<number>(0);
  const [fileStats, setFileStats] = useState<FileStats | null>(null);

  const handleFileSelect = async (selectedFile: File | null) => {    
    if (!selectedFile) {
      setFileAttached(false);
      setFileStats(null);
      setChatKey(prev => prev + 1);
      
      try {
        await fetch('http://localhost:8000/api/clear', { method: 'POST' });
      } catch (err) {
        console.error('Не вдалося очистити папку на бекенді:', err);
      }
      return;
    }

    setIsFileUploading(true); 
    setFileStats(null); 
    
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('http://localhost:8000/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Помилка завантаження файлу');
      }

      const data = await response.json();
      
      if (data.status === 'success') {
        console.log('Файл успішно оброблено:', data.filename);
        setFileStats(data.stats);     
        setFileAttached(true);        
        setChatKey(prev => prev + 1); 
      }
    } catch (error) {
      console.error('Не вдалося надіслати файл:', error);
      alert('Помилка сервера при завантаженні файлу.');
      setFileAttached(false);
      setFileStats(null);
    } finally {
      setIsFileUploading(false);
    }
  };

  
  const handleDownloadCleaned = async () => {
    try {
      window.location.href = 'http://localhost:8000/api/download-cleaned';
    } catch (error) {
      console.error('Помилка скачування:', error);
      alert('Не вдалося завантажити очищений файл.');
    }
  };

  return (
    <div className="app-container" style={{ display: 'flex', gap: '24px', padding: '24px', fontFamily: 'sans-serif', backgroundColor: '#121214', minHeight: '100vh' }}>
      <div className="sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '320px', shrink: 0 }}>
        

        <FileUploader onFileSelect={handleFileSelect} />

        {(fileAttached || isFileUploading) && (
          <div style={{
            backgroundColor: '#1e1e24', 
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            border: '1px solid #2a2a32', 
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            minHeight: '180px',
            justifyContent: isFileUploading ? 'center' : 'flex-start'
          }}>
            
            {isFileUploading ? (
              
              <div style={{ textAlign: 'center', color: '#9ca3af', padding: '20px 0' }}>
                <div style={{ fontSize: '24px', animation: 'spin 1s linear infinite', marginBottom: '10px' }}>⌛</div>
                <div style={{ fontSize: '14px', fontWeight: 500 }}>Оновлення аналітики...</div>
              </div>
            ) : fileStats ? (
              /* Звичайний вивід готової статистики */
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #2a2a32', paddingBottom: '10px' }}>
                  <BarChart2 size={18} style={{ color: '#3b82f6' }} />
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#ffffff' }}>Аналітика документа</h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#9ca3af' }}>
                    <span>Всього рядків:</span>
                    <strong style={{ color: '#ffffff' }}>{fileStats.totalLines.toLocaleString()}</strong>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#9ca3af' }}>
                    <span>Унікальних записів:</span>
                    <strong style={{ color: '#10b981' }}>{fileStats.uniqueLines.toLocaleString()}</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#9ca3af' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Trash2 size={14} style={{ color: '#ef4444' }} /> Видалено дублікатів:
                    </span>
                    <strong style={{ color: '#ef4444' }}>{fileStats.duplicates.toLocaleString()}</strong>
                  </div>
                </div>

                {fileStats.compressionRate > 0 && (
                  <div style={{
                    backgroundColor: 'rgba(59, 130, 246, 0.1)', 
                    padding: '10px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '13px',
                    color: '#60a5fa',
                    border: '1px solid rgba(59, 130, 246, 0.2)'
                  }}>
                    <ShieldCheck size={16} style={{ color: '#3b82f6', shrink: 0 }} />
                    <span>Файл оптимізовано на <strong style={{ color: '#ffffff' }}>{fileStats.compressionRate}%</strong>!</span>
                  </div>
                )}

                <button 
                  onClick={handleDownloadCleaned}
                  style={{
                    marginTop: '6px',
                    padding: '12px 16px',
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 6px rgba(16, 185, 129, 0.2)'
                  }}
                >
                  📥 Завантажити очищений файл
                </button>
              </>
            ) : null}
          </div>
        )}
      </div>
      
      <ChatBox 
        key={chatKey} 
        fileAttached={fileAttached} 
        isFileUploading={isFileUploading} 
      />
    </div>
  );
}