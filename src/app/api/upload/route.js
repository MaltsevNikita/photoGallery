import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request) {
  try {
    // Получаем FormData из запроса
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return Response.json({ error: 'Файл не найден' }, { status: 400 });
    }

    // Читаем данные файла
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Генерируем уникальное имя файла
    const filename = `${Date.now()}-${file.name}`;
    const filepath = join(process.cwd(), 'public', 'trips-images', filename);

    // Создаем папку, если она не существует
    const fs = require('fs');
    const dir = join(process.cwd(), 'public', 'trips-images');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Сохраняем файл
    await writeFile(filepath, buffer);

    // Возвращаем URL файла
    return Response.json({ 
      success: true, 
      url: `/trips-images/${filename}` 
    });
  } catch (error) {
    console.error('Ошибка при загрузке файла:', error);
    return Response.json({ error: 'Ошибка при загрузке файла' }, { status: 500 });
  }
}
