'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TripCard from '../components/TripCard';

export default function AdminPanel() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();
  const [editingTrip, setEditingTrip] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      // Проверяем, залогинен ли админ
      const isAdminLoggedIn = localStorage.getItem('isAdminLoggedIn');
      if (isAdminLoggedIn !== 'true') {
        router.push('/admin/login');
        return;
      }
      setIsAdmin(true);
      
      // Загружаем поездки
      const savedTrips = JSON.parse(localStorage.getItem('trips')) || [];
      setTrips(savedTrips);
      setLoading(false);
    };

    checkAuth();
 }, [router]);

  const handleDeleteTrip = (tripId) => {
    if (window.confirm('Вы уверены, что хотите удалить эту поездку?')) {
      const updatedTrips = trips.filter(trip => trip.id !== tripId);
      setTrips(updatedTrips);
      localStorage.setItem('trips', JSON.stringify(updatedTrips));
    }
  };

  const handleDeletePhoto = (tripId, photoIndex) => {
    const updatedTrips = trips.map(trip => {
      if (trip.id === tripId) {
        const updatedPhotos = trip.photos.filter((_, index) => index !== photoIndex);
        return { ...trip, photos: updatedPhotos };
      }
      return trip;
    });
    
    setTrips(updatedTrips);
    localStorage.setItem('trips', JSON.stringify(updatedTrips));
  };

  const handleEditTrip = (tripId, updatedTripData) => {
    const updatedTrips = trips.map(trip => {
      if (trip.id === tripId) {
        return { ...trip, ...updatedTripData };
      }
      return trip;
    });
    
    setTrips(updatedTrips);
    localStorage.setItem('trips', JSON.stringify(updatedTrips));
  };

  const handleImportData = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedTrips = JSON.parse(e.target.result);
          // Обновляем ID для импортированных поездок, чтобы избежать дубликатов
          const importedTripsWithNewIds = importedTrips.map(trip => ({
            ...trip,
            id: Date.now() + Math.random() // Генерируем уникальный ID
          }));
          // Объединяем импортированные поездки с существующими
          const combinedTrips = [...trips, ...importedTripsWithNewIds];
          setTrips(combinedTrips);
          localStorage.setItem('trips', JSON.stringify(combinedTrips));
        } catch (error) {
          alert('Ошибка при импорте файла: Некорректный формат JSON');
        }
      };
      reader.readAsText(file);
    }
    // Сбрасываем значение input, чтобы пользователь мог загрузить один и тот же файл дважды подряд
    event.target.value = '';
  };

  const handleLogout = () => {
    localStorage.setItem('isAdminLoggedIn', 'false');
    router.push('/');
  };

  const openPhotoModal = (photo) => {
    setSelectedPhoto(photo);
  };

  const closePhotoModal = () => {
    setSelectedPhoto(null);
  };

  const openEditModal = (trip) => {
    setEditingTrip({...trip});
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setEditingTrip(null);
    setShowEditModal(false);
  };

  const saveEditTrip = () => {
    if (editingTrip) {
      handleEditTrip(editingTrip.id, editingTrip);
      closeEditModal();
    }
 };

  const handleAddPhotos = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0 && editingTrip) {
      // Загружаем новые фото на сервер
      const uploadedPhotoPaths = [];
      for (const file of files) {
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

      // Обновляем состояние с новыми путями к изображениям
      setEditingTrip({
        ...editingTrip,
        photos: [...editingTrip.photos, ...uploadedPhotoPaths]
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Загрузка админ-панели...</p>
        </div>
      </div>
    );
  }

 if (!isAdmin) {
    return null; // Редирект уже произошел в useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-90">Админ панель</h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Выйти
          </button>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">Все поездки</h2>
            <div className="flex space-x-4">
              <label className="bg-purple-600 hover:bg-purple-70 text-white font-bold py-2 px-4 rounded cursor-pointer">
                Импорт данных
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  className="hidden"
                />
              </label>
              <p className="text-gray-600 self-center">Всего поездок: {trips.length}</p>
            </div>
          </div>
          
          {trips.length === 0 ? (
            <p className="text-gray-500 text-center py-10">Нет поездок для отображения.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trips.map((trip) => (
                <div key={trip.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="p-5">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{trip.city}, {trip.country}</h3>
                        <p className="text-gray-500 text-sm mt-1">{new Date(trip.date).toLocaleDateString('ru-RU', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}</p>
                      </div>
                    </div>
                    
                    {trip.description && (
                      <p className="mt-3 text-gray-600 text-sm line-clamp-2">
                        {trip.description}
                      </p>
                    )}
                    
                    {trip.photos && trip.photos.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {trip.photos.map((photo, index) => (
                          <div key={index} className="relative w-16 h-16">
                            <img 
                              src={photo} 
                              alt={`Фото поездки ${index + 1}`} 
                              className="w-full h-full object-cover rounded cursor-pointer"
                              onClick={() => openPhotoModal(photo)}
                            />
                            <button
                              onClick={() => handleDeletePhoto(trip.id, index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="mt-4 flex space-x-2">
                      <button
                        onClick={() => openEditModal(trip)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-medium py-1 px-2 rounded"
                      >
                        Редактировать
                      </button>
                      <button
                        onClick={() => handleDeleteTrip(trip.id)}
                        className="bg-red-500 hover:bg-red-600 text-white text-sm font-medium py-1 px-2 rounded"
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Модальное окно для просмотра фото */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={closePhotoModal}
        >
          <div className="relative max-w-[80vw] max-h-[80vh] p-4" onClick={(e) => e.stopPropagation()}>
            <img 
              src={selectedPhoto} 
              alt="Увеличенное фото поездки" 
              className="max-w-full max-h-full object-contain"
            />
            <button
              className="absolute top-0 right-0 text-white bg-red-600 rounded-full w-8 h-8 flex items-center justify-center"
              onClick={closePhotoModal}
            >
              &times;
            </button>
          </div>
        </div>
      )}

      {/* Модальное окно редактирования поездки */}
      {showEditModal && editingTrip && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Редактировать поездку</h2>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Название поездки (город)</label>
              <input
                type="text"
                value={editingTrip.city}
                onChange={(e) => setEditingTrip({...editingTrip, city: e.target.value})}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Страна</label>
              <input
                type="text"
                value={editingTrip.country}
                onChange={(e) => setEditingTrip({...editingTrip, country: e.target.value})}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Дата поездки</label>
              <input
                type="date"
                value={editingTrip.date}
                onChange={(e) => setEditingTrip({...editingTrip, date: e.target.value})}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Описание поездки</label>
              <textarea
                value={editingTrip.description}
                onChange={(e) => setEditingTrip({...editingTrip, description: e.target.value})}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                rows="4"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Добавить новые фото</label>
              <input
                type="file"
                multiple
                onChange={handleAddPhotos}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            
            {editingTrip.photos && editingTrip.photos.length > 0 && (
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Фотографии поездки</label>
                <div className="grid grid-cols-3 gap-2">
                  {editingTrip.photos.map((photo, index) => (
                    <div key={index} className="relative">
                      <img 
                        src={photo} 
                        alt={`Фото поездки ${index + 1}`} 
                        className="w-full h-24 object-cover rounded"
                      />
                      <button
                        onClick={() => {
                          const updatedPhotos = editingTrip.photos.filter((_, i) => i !== index);
                          setEditingTrip({...editingTrip, photos: updatedPhotos});
                        }}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <button
                onClick={closeEditModal}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Отмена
              </button>
              <button
                onClick={saveEditTrip}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Сохранить изменения
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
