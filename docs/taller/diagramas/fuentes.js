// Fuente de los diagramas del taller: genera las especificaciones Archify (workflow v2) en diagramas/src/.
// Uso: node docs/taller/diagramas/fuentes.js   y después, por cada archivo cambiado, desde la carpeta de la skill archify:
//   node bin/archify.mjs deliver workflow <src/x.workflow.json> <diagramas/x.html> --quality showcase --json
// Los HTML se generaron con archify 2.17.0-dev.1 (ver la cabecera de cada diagrama).
const fs = require('fs'), path = require('path');
const out = process.argv[2] || path.join(__dirname, 'src');
const legend = { entries: {
  frontend: { label: 'Pantalla' }, backend: { label: 'Cálculo / lógica' }, database: { label: 'Datos' },
  cloud: { label: 'Herramienta externa' }, security: { label: 'Control / decisión' },
  messagebus: { label: 'Intercambio (archivo, JSON, HTTP)' }, external: { label: 'Personas / IA' } } };
const N = (id, lane, col, type, label, sublabel) => ({ id, lane, col, type, label, sublabel, width: 160 });
const E = (from, to, label, extra = {}) => ({ from, to, ...(label ? { label } : {}), ...extra });
const H = { fromSide: 'right', toSide: 'left' };
const specs = {
  '00-mapa': ['Mapa del taller: de la hoja en blanco a #/guiado',
    [['pagina', 'Construir la página (navegador)'], ['conectar', 'Conectar con otras herramientas']],
    [N('contexto','pagina',0,'external','P0 · Preparar','prompt de contexto'), N('esqueleto','pagina',1,'frontend','P1 · Esqueleto','encabezado + pestañas'),
     N('datos','pagina',2,'database','P2 · Datos','año simulado'), N('mercado','pagina',3,'frontend','P3 · Mercado','tabla + gráficos'),
     N('indicadores','pagina',4,'backend','P4 · Indicadores','SMA · EMA · RSI'), N('carteras','pagina',5,'backend','P5 · Carteras','riesgo + Sharpe'),
     N('api','conectar',2,'messagebus','P6 · API JSON','datos para otros'), N('colab','conectar',3,'cloud','P7 · Colab','verificar en Python'),
     N('n8n','conectar',4,'cloud','P8 · n8n','avisos automáticos'), N('guiado','conectar',5,'security','P9 · #/guiado','la terminal final')],
    [E('contexto','esqueleto'), E('esqueleto','datos'), E('datos','mercado'), E('mercado','indicadores'), E('indicadores','carteras',null,H),
     E('carteras','api','publicar datos',{variant:'emphasis'}), E('api','colab','CSV / JSON',H), E('colab','n8n'), E('n8n','guiado',null,{variant:'emphasis'})]],
  'p0-preparar': ['P0 · Preparar el equipo y el chat',
    [['grupo','Ustedes (grupo)'], ['ia','Chat de IA'], ['pc','Computadora']],
    [N('roles','grupo',0,'external','Repartir 4 roles','rotan en cada paso'), N('constructor','grupo',1,'frontend','Constructor','nombre, activos, estilo'),
     N('contexto','ia',2,'messagebus','Prompt de contexto','reglas del proyecto'), N('entendido','ia',3,'external','IA responde','“Entendido”'),
     N('carpeta','pc',4,'database','Carpeta finlab','donde guardan versiones'), N('listo','pc',5,'security','Listos para P1','chat + carpeta')],
    [E('roles','constructor'), E('constructor','contexto','copiar y pegar'), E('contexto','entendido'), E('entendido','carpeta'), E('carpeta','listo')]],
  'p1-esqueleto': ['P1 · El ciclo de trabajo de cada paso',
    [['grupo','Ustedes (grupo + navegador)'], ['control','Verificación'], ['ia','Chat de IA']],
    [N('prompt','grupo',0,'external','Copiar prompt','+ archivo actual'), N('respuesta','ia',1,'external','IA responde','archivo completo'),
     N('guardar','grupo',2,'database','Guardar finlab.html','reemplazar todo'), N('abrir','grupo',3,'frontend','Abrir con doble clic','mirar la consola'),
     N('verificar','control',4,'security','Comprobar','lista “lo lograron si”'), N('version','control',5,'database','Guardar versión','finlab-v1.html'),
     N('rescate','ia',4,'external','Prompt de rescate','pegar el error')],
    [E('prompt','respuesta',null,{fromSide:'bottom',toSide:'left'}), E('respuesta','guardar','archivo nuevo',{fromSide:'top',toSide:'bottom'}), E('guardar','abrir'), E('abrir','verificar'), E('verificar','version','salió bien',{variant:'emphasis'}),
     E('verificar','rescate','algo falla',{variant:'security',role:'error'}), E('rescate','respuesta','volver a pedir',{variant:'dashed',role:'return'})]],
  'p2-datos': ['P2 · Cómo se generan los datos simulados',
    [['def','Definición'], ['gen','Generador'], ['res','Resultado']],
    [N('tickers','def',0,'database','TICKERS','8 activos + volatilidad'), N('semilla','def',1,'security','Semilla','mulberry32 por símbolo'),
     N('sim','gen',2,'backend','simulateSeries()','252 días hábiles'), N('formula','gen',3,'backend','Retorno diario','tendencia + vol · z'),
     N('serie','res',4,'database','Serie { d, c, v }','fecha, cierre, volumen'), N('consola','res',5,'frontend','Consola (F12)','tabla de control')],
    [E('tickers','semilla'), E('semilla','sim','mismos números'), E('sim','formula','cada día'), E('formula','serie'), E('serie','consola')]],
  'p3-mercado': ['P3 · De la serie a la pantalla de Mercado',
    [['datos','Datos'], ['calc','Cálculo'], ['pant','Pantalla']],
    [N('serie','datos',0,'database','Serie del P2','252 cierres'), N('var','calc',1,'backend','Variación del día','hoy / ayer − 1'),
     N('conteo','calc',2,'backend','Conteo','suben / bajan'), N('tarjetas','pant',3,'frontend','Tarjetas','resumen del día'),
     N('tabla','pant',4,'frontend','Tabla + sparkline','precio, %, 30 días'), N('grafico','pant',5,'frontend','Gráfico Recharts','rango 1M a 1A')],
    [E('serie','var'), E('var','conteo'), E('conteo','tarjetas'), E('tarjetas','tabla'), E('tabla','grafico','clic en una fila')]],
  'p4-indicadores': ['P4 · De los cierres a la señal',
    [['datos','Datos'], ['medias','Medias móviles'], ['senal','Señal y pantalla'], ['verif','Verificación']],
    [N('cierres','datos',0,'database','Cierres','del activo elegido'), N('medias','medias',1,'backend','Medias móviles','SMA 20/50 · EMA 12/26'),
     N('rsi','datos',2,'backend','RSI 14','Wilder · 0 a 100'),
     N('signal','senal',3,'security','signalOf()','COMPRA · VENTA · NEUTRAL'), N('ui','senal',4,'frontend','Tabla + gráfico','columnas RSI y Señal'),
     N('csv','verif',4,'messagebus','Exportar CSV','fecha, cierre, medias'), N('sheets','verif',5,'cloud','Google Sheets','=PROMEDIO() de 20')],
    [E('cierres','medias'), E('cierres','rsi'), E('medias','signal','cortas vs largas'), E('signal','ui'), E('rsi','ui','resaltar extremos'),
     E('ui','csv'), E('csv','sheets','recalcular a mano',{variant:'dashed'})]],
  'p5-carteras': ['P5 · Cómo se mide una cartera',
    [['entrada','Entrada'], ['calc','Cálculo'], ['res','Resultado']],
    [N('preset','entrada',0,'external','Cartera elegida','3 perfiles o a mano'), N('pesos','entrada',1,'security','Normalizar pesos','que sumen 100%'),
     N('retornos','calc',2,'backend','Retornos diarios','hoy / ayer − 1'), N('cov','calc',3,'backend','Media y covarianza','× 252 = anual'),
     N('metricas','res',4,'frontend','Retorno · Vol · Sharpe','tasa libre 4,3%'), N('base100','res',5,'frontend','Gráfico base 100','vs equiponderada')],
    [E('preset','pesos'), E('pesos','retornos'), E('retornos','cov'), E('cov','metricas'), E('metricas','base100','misma cartera')]],
  'p6-api': ['P6 · Qué pasa cuando alguien consulta la API',
    [['quien','Quien pregunta'], ['router','Router (dentro de la página)'], ['datos','Datos']],
    [N('explorador','quien',0,'frontend','Explorador de API','elige una ruta'), N('get','quien',1,'messagebus','GET /api/...','pedido HTTP simulado'),
     N('ruta','router',2,'security','¿Existe la ruta?','y el símbolo'), N('mercado','datos',3,'database','Mercado + indicadores','lo calculado en P3–P4'),
     N('json','router',4,'messagebus','200 · JSON','symbol, last, rsi14…'), N('alertas','datos',5,'database','Alertas','guardadas en localStorage'),
     N('e404','quien',3,'security','404 · error','mensaje en español')],
    [E('explorador','get'), E('get','ruta'), E('ruta','mercado','sí'), E('mercado','json'), E('json','alertas','¿se dispara?'),
     E('ruta','e404','no',{variant:'security',role:'error'})]],
  'p7-colab': ['P7 · Del CSV a Google Colab',
    [['term','Terminal FIN·LAB'], ['pc','Tu computadora'], ['colab','Google Colab']],
    [N('export','term',0,'frontend','Exportar CSV','botón del P4'), N('archivo','pc',1,'messagebus','finlab.csv','carpeta Descargas'),
     N('upload','colab',2,'cloud','files.upload()','subir el archivo'), N('pandas','colab',3,'backend','pandas.read_csv','tabla en memoria'),
     N('codigo','term',3,'frontend','Bloques A · B · C','botón Copiar'), N('recalc','colab',4,'backend','Recalcular','rolling + Wilder'),
     N('compara','colab',5,'security','Comparar','diferencia < 0,01')],
    [E('export','archivo'), E('archivo','upload'), E('upload','pandas'), E('codigo','pandas','pegar en una celda',{variant:'dashed'}), E('pandas','recalc'), E('recalc','compara')]],
  'p8-n8n': ['P8 · El workflow de n8n que avisa solo',
    [['disp','Disparador'], ['pasos','Pasos'], ['salida','Salida']],
    [N('trigger','disp',0,'external','Manual o Schedule','cuándo corre'), N('http','pasos',1,'messagebus','HTTP Request','GET /api/market/summary'),
     N('code','pasos',2,'backend','Code','filtra señal y RSI'), N('if','pasos',3,'security','IF','¿hay algo para avisar?'),
     N('aviso','salida',4,'cloud','Email o Telegram','aviso con el motivo'), N('nada','salida',5,'database','Registrar','sin coincidencias')],
    [E('trigger','http'), E('http','code','JSON'), E('code','if'), E('if','aviso','sí',{variant:'emphasis'}), E('if','nada','no',{variant:'dashed',role:'branch'})]],
  'p9-guiado': ['P9 · La terminal terminada en #/guiado',
    [['pc','Tu computadora'], ['term','Terminal FIN·LAB'], ['n8n','n8n']],
    [N('abrir','pc',1,'frontend','Abrir la terminal','publicada o 127.0.0.1:4173'),
     N('elegir','term',2,'frontend','Elegir señal','VENTA · COMPRA · NEUTRAL'), N('json','term',3,'messagebus','Descargar JSON','monitor-mercado-n8n'),
     N('importar','n8n',4,'cloud','Importar archivo','Import from file'), N('ejecutar','n8n',5,'security','Ejecutar workflow','¿qué salida se activa?'),
     N('ejercicios','term',5,'external','Ejercicios en grupo','3 preguntas')],
    [E('abrir','elegir'), E('elegir','json'), E('json','importar'), E('importar','ejecutar'), E('ejecutar','ejercicios','comparar predicción',{variant:'emphasis'})]],
  'p11-modelos': ['P11 · Elegir el modelo con evidencia',
    [['tarea','Tarea'], ['prueba','Prueba'], ['decision','Decisión']],
    [N('tarea','tarea',0,'external','Una tarea concreta','misma pregunta siempre'), N('chico','prueba',1,'backend','Modelo chico','rápido y barato'),
     N('alcanza','decision',2,'security','¿Alcanza?','correcto · completo'), N('usar','decision',3,'frontend','Usar el chico','no pagar de más'),
     N('grande','prueba',3,'backend','Subir un escalón','modelo más grande'), N('anotar','decision',4,'database','Anotar en el kit','modelo + razón')],
    [E('tarea','chico'), E('chico','alcanza','respuesta'), E('alcanza','usar','sí',{variant:'emphasis'}), E('alcanza','grande','no',{variant:'dashed',role:'branch'}),
     E('usar','anotar'), E('grande','anotar','si ahora alcanza')]],
  // ---------- Agentes (clase 3) ----------
  'a2-consejo': ['Un consejo de agentes para una decisión de inversión',
    [['ustedes','Ustedes'], ['analistas','Analistas (cada uno con su rol)'], ['control','Control']],
    [N('pregunta','ustedes',0,'external','La pregunta','¿armamos esta cartera?'), N('tecnico','analistas',1,'backend','Analista técnico','medias y RSI'),
     N('riesgo','analistas',2,'backend','Analista de riesgo','volatilidad y Sharpe'), N('diablo','analistas',3,'backend','Abogado del diablo','busca lo que falla'),
     N('auditor','control',4,'security','Agente auditor','¿cada número tiene fuente?'), N('informe','ustedes',5,'frontend','Informe','con aviso y fuentes')],
    [E('pregunta','tecnico'), E('tecnico','riesgo','pasa su análisis'), E('riesgo','diablo','pasa su análisis'), E('diablo','auditor','objeciones'),
     E('auditor','informe','aprobado',{variant:'emphasis'})]],
  'a3-este-taller': ['Así se hizo este taller: agentes que planifican y controlan',
    [['profe','El profesor'], ['agentes','Agentes'], ['control','Controles']],
    [N('pedido','profe',0,'external','Pedido','reestructurar el taller'), N('consejo','agentes',1,'backend','Consejo de 4 agentes','miran y proponen'),
     N('plan','agentes',2,'database','Plan unificado','coincidencias y choques'), N('decide','profe',3,'security','El profesor decide','4 decisiones'),
     N('etapas','agentes',4,'backend','Implementación','6 etapas chicas'), N('evals','control',5,'security','Evals y tests','frenan si algo falla'),
     N('docente','control',2,'security','Agente docente','audita sin editar')],
    [E('pedido','consejo'), E('consejo','plan'), E('plan','decide','para decidir',{variant:'emphasis'}), E('decide','etapas'), E('etapas','evals','cada etapa'),
     E('docente','plan','hallazgos',{variant:'dashed'})]],
};
// Diagramas de secuencia: se escriben tal cual (el formato es otro que el de los workflows).
const secuencias = {
  'p10-claves': {
    schema_version: 1, diagram_type: 'sequence',
    meta: { title: 'P10 · La clave se guarda una vez y nunca se muestra', quality_profile: 'showcase', column_fit: 'spread', viewBox: [1080, 540] },
    participants: [
      { id: 'grupo', type: 'external', label: 'Ustedes', sublabel: 'crean y prueban' },
      { id: 'panel', type: 'cloud', label: 'Panel del proveedor', sublabel: 'OpenAI · Anthropic · Google' },
      { id: 'cred', type: 'security', label: 'Credenciales de n8n', sublabel: 'guarda la clave cifrada' },
      { id: 'flujo', type: 'backend', label: 'Workflow', sublabel: 'usa la credencial por nombre' },
      { id: 'modelo', type: 'external', label: 'Modelo de IA', sublabel: 'cobra por uso' }
    ],
    segments: [
      { from: 150, to: 236, label: 'Crear' },
      { from: 244, to: 300, label: 'Guardar' },
      { from: 308, to: 440, label: 'Usar' }
    ],
    messages: [
      { id: 'crear', from: 'grupo', to: 'panel', y: 172, label: 'clave nueva, permiso mínimo', variant: 'emphasis' },
      { id: 'mostrar', from: 'panel', to: 'grupo', y: 210, label: 'se ve una sola vez', variant: 'return' },
      { id: 'guardar', from: 'grupo', to: 'cred', y: 272, label: 'pegar y guardar', variant: 'security' },
      { id: 'pedir', from: 'flujo', to: 'cred', y: 330, label: 'pide la credencial' },
      { id: 'llamar', from: 'cred', to: 'modelo', y: 364, label: 'llama con la clave' },
      { id: 'respuesta', from: 'modelo', to: 'flujo', y: 398, label: 'respuesta', variant: 'return' },
      { id: 'exportar', from: 'flujo', to: 'grupo', y: 428, label: 'el JSON lleva solo el id', variant: 'return' }
    ]
  },
  'p14-mcp': {
    schema_version: 1, diagram_type: 'sequence',
    meta: { title: 'P14 · El MCP de n8n: el asistente crea, ustedes deciden', quality_profile: 'showcase', column_fit: 'spread', viewBox: [1080, 540] },
    participants: [
      { id: 'grupo', type: 'external', label: 'Ustedes', sublabel: 'piden y revisan' },
      { id: 'asistente', type: 'external', label: 'Asistente', sublabel: 'Claude, ChatGPT…' },
      { id: 'mcp', type: 'messagebus', label: 'MCP de n8n', sublabel: '/mcp-server/http' },
      { id: 'n8n', type: 'cloud', label: 'n8n', sublabel: 'sus workflows' }
    ],
    segments: [
      { from: 150, to: 246, label: 'Pedir' },
      { from: 254, to: 350, label: 'Crear' },
      { from: 358, to: 440, label: 'Decidir' }
    ],
    messages: [
      { id: 'pedido', from: 'grupo', to: 'asistente', y: 172, label: 'copiá el aviso RSI, umbral 25', variant: 'emphasis' },
      { id: 'buscar', from: 'asistente', to: 'mcp', y: 204, label: 'buscar workflows' },
      { id: 'lista', from: 'mcp', to: 'asistente', y: 234, label: 'aviso-rsi', variant: 'return' },
      { id: 'crear', from: 'asistente', to: 'mcp', y: 276, label: 'crear copia' },
      { id: 'nuevo', from: 'mcp', to: 'n8n', y: 306, label: 'workflow nuevo, desactivado' },
      { id: 'revisar', from: 'asistente', to: 'grupo', y: 338, label: 'JSON para revisar', variant: 'return' },
      { id: 'confirmar', from: 'grupo', to: 'asistente', y: 380, label: 'confirmo la prueba', variant: 'security' },
      { id: 'activar', from: 'grupo', to: 'n8n', y: 422, label: 'activar: decisión humana', variant: 'emphasis' }
    ]
  },
  'a1-ciclo-agente': {
    schema_version: 1, diagram_type: 'sequence',
    meta: { title: 'El ciclo de un agente: pregunta, herramientas y control', quality_profile: 'showcase', column_fit: 'spread', viewBox: [1080, 540] },
    participants: [
      { id: 'persona', type: 'external', label: 'Ustedes', sublabel: 'hacen la pregunta' },
      { id: 'agente', type: 'backend', label: 'Agente', sublabel: 'una IA con herramientas' },
      { id: 'api', type: 'messagebus', label: 'API de mercado', sublabel: 'herramienta' },
      { id: 'calc', type: 'backend', label: 'Calculadora', sublabel: 'herramienta' },
      { id: 'auditor', type: 'security', label: 'Agente auditor', sublabel: 'revisa antes de entregar' }
    ],
    segments: [
      { from: 150, to: 196, label: 'Pregunta' },
      { from: 204, to: 336, label: 'Usa herramientas' },
      { from: 342, to: 440, label: 'Control y respuesta' }
    ],
    messages: [
      { id: 'preguntar', from: 'persona', to: 'agente', y: 172, label: '¿qué activo mirar?', variant: 'emphasis' },
      { id: 'pedir-datos', from: 'agente', to: 'api', y: 222, label: 'pide RSI y señales' },
      { id: 'datos', from: 'api', to: 'agente', y: 254, label: '8 activos', variant: 'return' },
      { id: 'calcular', from: 'agente', to: 'calc', y: 286, label: 'distancia a 30 y 70' },
      { id: 'resultado', from: 'calc', to: 'agente', y: 316, label: 'JNJ, la más lejos', variant: 'return' },
      { id: 'borrador', from: 'agente', to: 'auditor', y: 358, label: 'borrador' },
      { id: 'correccion', from: 'auditor', to: 'agente', y: 390, label: 'falta el aviso', variant: 'security' },
      { id: 'responder', from: 'agente', to: 'persona', y: 422, label: 'respuesta con aviso', variant: 'emphasis' }
    ]
  }
};
for (const [id, spec] of Object.entries(secuencias)) {
  fs.writeFileSync(path.join(out, id + '.sequence.json'), JSON.stringify(spec, null, 2) + '\n');
}
for (const [id, [title, lanes, nodes, edges]] of Object.entries(specs)) {
  const spec = { schema_version: 2, diagram_type: 'workflow', meta: { title, quality_profile: 'showcase', legend },
    lanes: lanes.map(([id, label]) => ({ id, label, ...(id === 'err' ? { variant: 'exception' } : {}) })), nodes, edges };
  fs.writeFileSync(path.join(out, id + '.workflow.json'), JSON.stringify(spec, null, 2) + '\n');
}
console.log([...Object.keys(specs), ...Object.keys(secuencias)].join(' '));
