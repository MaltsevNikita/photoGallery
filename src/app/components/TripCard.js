import Link from 'next/link';

export default function TripCard({ trip, openPhotoModal }) {

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-5">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{trip.city}, {trip.country}</h3>
            <p className="text-gray-50 text-sm mt-1">{new Date(trip.date).toLocaleDateString('ru-RU', { 
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
            {trip.photos.slice(0, 3).map((photo, index) => (
              <div key={index} className="w-16 h-16 relative z-10">
                <img 
                  src={photo.startsWith('blob:') ? photo : photo} 
                  alt={`Фото поездки ${index + 1}`} 
                  className="w-full h-full object-cover rounded cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    openPhotoModal(photo);
                  }}
                />
              </div>
            ))}
            {trip.photos.length > 3 && (
              <div className="w-16 h-16 flex items-center justify-center bg-gray-10 rounded relative z-10">
                <span className="text-gray-500 text-sm cursor-pointer" onClick={(e) => e.stopPropagation()}>+{trip.photos.length - 3}</span>
              </div>
            )}
          </div>
        )}
        
        <Link 
          href={`/trip/${trip.id}`}
          className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded"
        >
          Подробнее
        </Link>
      </div>
    </div>
  );
}
