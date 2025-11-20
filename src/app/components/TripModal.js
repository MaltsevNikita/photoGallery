import { useState } from 'react';

export default function TripModal({ onClose, onSave }) {
  const [tripData, setTripData] = useState({
    date: '',
    country: '',
    city: '',
    description: '',
    photos: []
  });
  const [photoFiles, setPhotoFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTripData({
      ...tripData,
      [name]: value
    });
 };

  const handlePhotoChange = async (e) => {
    const files = Array.from(e.target.files);
    setPhotoFiles(files);
    
    // Создаем URL для предварительного просмотра
    const photoUrls = files.map(file => URL.createObjectURL(file));
    
    setTripData({
      ...tripData,
      photos: photoUrls
    });
  };

  const uploadPhotos = async () => {
    if (photoFiles.length === 0) {
      return [];
    }

    setUploading(true);
    const uploadedPhotoPaths = [];

    for (const file of photoFiles) {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });

        if (response.ok) {
          const result = await response.json();
          uploadedPhotoPaths.push(result.url);
        } else {
          console.error('Ошибка при загрузке файла:', await response.text());
        }
      } catch (error) {
        console.error('Ошибка при загрузке файла:', error);
      }
    }

    setUploading(false);
    return uploadedPhotoPaths;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Загружаем фото на сервер
    const uploadedPhotoPaths = await uploadPhotos();
    
    // Подготавливаем данные для сохранения
    const tripDataWithPhotoPaths = {
      ...tripData,
      photos: uploadedPhotoPaths,
      photoFiles: photoFiles.map(file => ({
        name: file.name,
        type: file.type,
        size: file.size
      }))
    };
    
    onSave(tripDataWithPhotoPaths);
    onClose();
  };

 return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Добавить новую поездку</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="date">
              Дата поездки
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={tripData.date}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="country">
              Страна
            </label>
            <input
              type="text"
              id="country"
              name="country"
              value={tripData.country}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="city">
              Город
            </label>
            <input
              type="text"
              id="city"
              name="city"
              value={tripData.city}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
              Описание поездки
            </label>
            <textarea
              id="description"
              name="description"
              value={tripData.description}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              rows="4"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="photos">
              Фотографии поездки
            </label>
            <input
              type="file"
              id="photos"
              name="photos"
              multiple
              onChange={handlePhotoChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              disabled={uploading}
            >
              Отмена
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              disabled={uploading}
            >
              {uploading ? 'Загрузка...' : 'Сохранить поездку'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
