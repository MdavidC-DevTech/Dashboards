// src/models/fakeUsers.js

// Podrías simular una “base de datos” de usuarios
// y exportarlo como un objeto o array
module.exports = {
    juanperez: {
      username: 'juanperez',
      full_name: 'Juan Pérez',
      email: 'juan@example.com',
      password: 'secret', // en producción, encriptado
      disabled: false,
      role: 'teacher'
    },
    anagomez: {
      username: 'anagomez',
      full_name: 'Ana Gómez',
      email: 'ana@example.com',
      password: 'secret2',
      disabled: false,
      role: 'student'
    }
  };
  