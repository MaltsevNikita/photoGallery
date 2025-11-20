'use client';

import { useState, useEffect } from 'react';
import TripModal from './components/TripModal';
import TripCard from './components/TripCard';

export default function Home() {
  const [trips, setTrips] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const openPhotoModal = (photo) => {
    setSelectedPhoto(photo);
  };

  const closePhotoModal = () => {
    setSelectedPhoto(null);
  };

  useEffect(() => {
    const fetchTrips = async () => {
      // Загружаем поездки из localStorage при запуске
      const savedTrips = JSON.parse(localStorage.getItem('trips')) || [];
      setTrips(savedTrips);
    };

    fetchTrips();
  }, []);

  const addTrip = (tripData) => {
    const newTrip = {
      id: Date.now(),
      ...tripData,
      photos: tripData.photos || []
    };
    const updatedTrips = [...trips, newTrip];
    setTrips(updatedTrips);
    // Сохраняем поездки в localStorage
    localStorage.setItem('trips', JSON.stringify(updatedTrips));
  };

  const exportData = () => {
    const dataStr = JSON.stringify(trips, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'trips-data.json';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importData = (event) => {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-90">Интерактивная карта путешествий</h1>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">Мои поездки</h2>
            <div className="flex space-x-4">
              <button
                onClick={exportData}
                className="bg-green-600 hover:bg-green-70 text-white font-bold py-2 px-4 rounded"
              >
                Экспорт данных
              </button>
              <label className="bg-purple-600 hover:bg-purple-70 text-white font-bold py-2 px-4 rounded cursor-pointer">
                Импорт данных
                <input
                  type="file"
                  accept=".json"
                  onChange={importData}
                  className="hidden"
                />
              </label>
              <button
                onClick={() => setShowModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Добавить поездку
              </button>
            </div>
          </div>
          
          {trips.length === 0 ? (
            <p className="text-gray-500 text-center py-10">У вас пока нет поездок. Добавьте первую поездку!</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trips.map((trip) => (
                <TripCard key={trip.id} trip={trip} openPhotoModal={openPhotoModal} />
              ))}
            </div>
          )}
        </div>
      </main>
      {showModal && (
        <TripModal 
          onClose={() => setShowModal(false)} 
          onSave={addTrip} 
        />
      )}
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
    </div>
  );
}
