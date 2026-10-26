# API pública de muestra

`GET /api/market/summary` devuelve el contrato usado por los ejercicios n8n y Colab. Es una función de solo lectura con una muestra fija y pública. Los cambios enviados por `POST` no se guardan; de hecho, los métodos de escritura se rechazan con 405.

Si se necesitan precios actualizados, alertas persistentes o varios usuarios, hace falta conectar un proveedor de datos y una base de datos administrada antes de activar esos flujos.
