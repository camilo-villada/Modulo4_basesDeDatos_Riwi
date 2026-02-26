//arranque del servidor

const app = require('./src/app');
require('./src/config/db');

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
}   );