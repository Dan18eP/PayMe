import app from "./app";
import { env } from "./config/env";

const server = app.listen(env.PORT, () => {
  console.log(` Servidor corriendo en http://localhost:${env.PORT}`);
  console.log(` Entorno: ${env.NODE_ENV}`);
});

export default server;
