import React, { useRef, useState } from 'react';
import { Paperclip, X, FileText, Plus } from 'lucide-react';

// ✅ ТИПІЗУЄМО ПРОПСИ: Додаємо apiUrl у список вхідних параметрів
type FileUploaderProps = {
  onFileSelect: (file: File | null) => void;
  apiUrl?: string; // Робимо необов'язковим для безпеки (якщо немає — підставимо локальний)
};

export const FileUploader: React.FC<FileUploaderProps> = ({ onFileSelect, apiUrl }) => {
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Оголошуємо стан для скидання інпуту:
  const [inputKey, setInputKey] = useState<number>(0);

  // Визначаємо фінальний URL для запиту (беремо з пропсів або фолбекаємось на localhost)
  const currentApiUrl = apiUrl || 'http://localhost:8000';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      onFileSelect(selectedFile);
    }
  };

  // Перетворили функцію на асинхронну (async)
  const handleRemoveFile = async () => {
    setFile(null); // Прибираємо з екрана
    onFileSelect(null); // Передаємо батькові
    
    // Повністю очищуємо значення інпуту в браузері
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    // Змінюємо ключ, щоб React перестворив інпут з нуля і "забув" старий файл
    setInputKey(prev => prev + 1);

    try {
      // ✅ ЗАМІНИЛИ ЛОКАЛЬНИЙ ШЛЯХ НА ДИНАМІЧНИЙ URL З БАЗИ ЗМІННИХ
      const response = await fetch(`${currentApiUrl}/api/clear`, {
        method: 'POST',
      });
      
      if (response.ok) {
        console.log("📁 Папку на бекенді успішно очищено від старих файлів");
      } else {
        console.error("⚠️ Бекенд повернув помилку при очищенні папки");
      }
    } catch (error) {
      console.error("❌ Помилка мережі при спробі видалити файл з сервера:", error);
    }
  };

  return (
    <div className="file-uploader">
      <div className="file-uploader__header">
        <h3 className="file-uploader__title">Джерела знань</h3>
        {!file && (
          <button className="file-uploader__add-icon" onClick={() => fileInputRef.current?.click()}>
            <Plus size={18} />
          </button>
        )}
      </div>
      
      {/* Тепер inputKey повністю легальний і працює на 100% */}
      <input 
        key={inputKey}
        type="file" 
        accept=".json,.txt,.log,.csv" 
        className="file-uploader__input" 
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {!file ? (
        <div className="file-uploader__empty-state" onClick={() => fileInputRef.current?.click()}>
          <Paperclip size={24} className="file-uploader__upload-icon" />
          <p>Завантажити документи</p>
          <span>Підтримуються .txt, .json, .log, .csv</span>
        </div>
      ) : (
        <div className="file-uploader__card">
          <div className="file-uploader__card-icon">
            <FileText size={18} />
          </div>
          <div className="file-uploader__card-info">
            <p className="file-uploader__card-name">{file.name}</p>
            <p className="file-uploader__card-size">{(file.size / 1024).toFixed(1)} KB • Документ</p>
          </div>
          <button className="file-uploader__card-remove" onClick={handleRemoveFile}>
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
};