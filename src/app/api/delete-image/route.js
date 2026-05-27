import { promises as fsPromises } from 'fs';
import { join } from 'path';

export async function DELETE(request) {
  try {
    const { imageUrl } = await request.json();
    
    // Извлекаем имя файла из URL (например, /trips-images/filename.jpg -> filename.jpg)
    const filename = imageUrl.split('/').pop();
    const filepath = join(process.cwd(), 'public', 'trips-images', filename);

    // Проверяем, что путь находится в допустимой директории
    const allowedDir = join(process.cwd(), 'public', 'trips-images');
    const resolvedPath = await fsPromises.realpath(filepath);
    const resolvedAllowedDir = await fsPromises.realpath(allowedDir);
    
    if (!resolvedPath.startsWith(resolvedAllowedDir)) {
      return Response.json({ error: 'Недопустимый путь к файлу' }, { status: 400 });
    }

    // Удаляем файл
    await fsPromises.unlink(filepath);

    return Response.json({ success: true });
  } catch (error) {
    console.error('Ошибка при удалении файла:', error);
    return Response.json({ error: 'Ошибка при удалении файла' }, { status: 500 });
  }
}
