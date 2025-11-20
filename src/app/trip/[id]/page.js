'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';

export default function TripDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrip = async () => {
      // Получаем поездку из localStorage или из state
      const trips = JSON.parse(localStorage.getItem('trips')) || [];
      const foundTrip = trips.find(trip => trip.id === parseInt(id));
      
      if (foundTrip) {
        setTrip(foundTrip);
      } else {
        // Если поездка не найдена, возвращаемся на главную
        router.push('/');
      }
      setLoading(false);
    };

    fetchTrip();
  }, [id, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Загрузка поездки...</p>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900">Поездка не найдена</h1>
          </div>
        </header>
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <p className="text-gray-50">Поездка с ID {id} не найдена.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <button 
            onClick={() => router.push('/')}
            className="text-blue-600 hover:text-blue-800 font-medium mb-2 cursor-pointer"
          >
            &larr; Назад к поездкам
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{trip.city}, {trip.country}</h1>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">Детали поездки</h2>
              <p className="text-gray-600">
                <span className="font-medium">Дата:</span> {new Date(trip.date).toLocaleDateString('ru-RU', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            
            {trip.description && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Описание</h3>
                <p className="text-gray-600 whitespace-pre-line">{trip.description}</p>
              </div>
            )}
            
            {trip.photos && trip.photos.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-80 mb-4">Фотографии</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {trip.photos.map((photo, index) => (
                    <div key={index} className="overflow-hidden rounded-lg shadow">
                      <img 
                        src={photo.startsWith('blob:') ? photo : photo} 
                        alt={`Фото поездки ${index + 1}`} 
                        className="w-full h-48 object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
