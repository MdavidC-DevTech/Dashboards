// src/models/fakeUsers.js

// Podrías simular una “base de datos” de usuarios
// y exportarlo como un objeto o array
// src/models/fakeUsers.js

module.exports = {
  juanperez: {
    username: 'juanperez',
    full_name: 'Juan Pérez',
    email: 'juan@example.com',
    password: 'secret',         // Texto plano (para pruebas)
    role: 'teacher',
    // Suponiendo que su colegio (categoría) es ID=300 en la tabla `eva_course_categories`
    categoryId: 300
  },
  anagomez: {
    username: 'anagomez',
    full_name: 'Ana Gómez',
    email: 'ana@example.com',
    password: 'secret2',
    role: 'student',
    // Suponiendo que su colegio (categoría) es ID=497 “Colegio Spellman 2024”
    categoryId: 497
  },

};
