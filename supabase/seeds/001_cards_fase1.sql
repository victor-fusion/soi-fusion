-- ============================================================
-- Seed 001: Tarjetas de contenido — Fase 1 Descubrimiento
-- Ejecutar DESPUÉS de la migración 002_cards.sql
-- ============================================================

-- ─── ESTRATEGIA > PROBLEMA ───────────────────────────────────

insert into public.cards (section_id, title, description, type, "order", content) values
(
  'problema',
  'Cómo hacer entrevistas de descubrimiento',
  'El método para validar que el problema que estás resolviendo importa de verdad a tu ICP.',
  'playbook',
  1,
  'ENTREVISTAS DE DESCUBRIMIENTO

El objetivo es entender el problema de tu ICP, no vender tu solución.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REGLAS DE ORO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Escucha más de lo que hablas → regla del 80/20
2. No menciones tu solución hasta el final (o nunca)
3. Pregunta por comportamientos pasados, no por opiniones futuras
   MAL: "¿Usarías una herramienta que hiciera X?"
   BIEN: "¿Cuándo fue la última vez que tuviste este problema?"
4. Si alguien dice "haría X", pregunta "¿cuándo fue la última vez que lo hiciste?"
5. El silencio es tu aliado — no lo rellenes

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ESTRUCTURA DE 45 MINUTOS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

5 min  → Presentación y contexto
         "Gracias por tu tiempo. Estoy investigando [área]. No tengo nada que vender,
          solo quiero entender cómo trabajas."

10 min → Situación actual
         ¿Cómo resuelven el problema hoy? ¿Qué herramientas usan?

15 min → El problema
         Frecuencia, consecuencias, nivel de dolor

10 min → Soluciones actuales y frustraciones
         ¿Qué han probado? ¿Por qué no funcionó?

5 min  → Cierre y referencias
         ¿Me puedes conectar con alguien más que tenga este problema?

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SEÑALES DE PROBLEMA REAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ Se emociona o frustra al hablar del problema
✓ Ya ha intentado resolverlo (gastando dinero o tiempo)
✓ Recuerda un caso concreto reciente con detalle
✓ Te pide que le avises cuando lances

✗ "Interesante idea" sin más detalle
✗ No recuerda cuándo le afectó por última vez
✗ "Depende" como respuesta a preguntas de frecuencia
✗ No ha hecho nada al respecto hasta ahora

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REQUISITO FUSIÓN — FASE 1
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Mínimo 15 entrevistas documentadas
Más del 60% deben confirmar el problema sin inducción
Ninguna con amigos, familiares o conocidos directos'
),
(
  'problema',
  'Guía de entrevista de problema',
  'Template listo para usar en tus entrevistas de descubrimiento. Imprime o lleva en el móvil.',
  'template',
  2,
  'GUÍA DE ENTREVISTA DE PROBLEMA

Entrevistado: _______________________
Empresa / Rol: _______________________
Fecha: _______________________
Duración real: _______ min

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
APERTURA (5 min)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

"Gracias por tu tiempo. Estoy investigando cómo [profesionales/empresas como tú] gestionan
[área]. No tengo nada que vender, solo quiero entender tu realidad para ver si hay algo
en lo que pueda ayudar."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONTEXTO (10 min)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

→ ¿Puedes describirme cómo gestionas [área] actualmente?
→ ¿Qué herramientas o procesos usas hoy para esto?
→ ¿Con qué frecuencia te encuentras con esto?
→ ¿Quién más en tu equipo se ve afectado?

Notas: _______________________________________________

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EL PROBLEMA (15 min)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

→ ¿Cuál es la parte más frustrante o difícil de ese proceso?
→ ¿Cuándo fue la última vez que te pasó? ¿Qué ocurrió exactamente?
→ ¿Qué consecuencias tuvo (tiempo, dinero, relación con cliente...)?
→ En una escala del 1 al 10, ¿qué urgencia tiene resolverlo?

Problema principal identificado: ________________________
Nivel de dolor (1-10): _______
Frecuencia: ___________

Notas: _______________________________________________

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SOLUCIONES ACTUALES (10 min)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

→ ¿Cómo lo resuelves hoy? ¿Con qué combinas?
→ ¿Qué has probado antes que no funcionó?
→ ¿Cuánto te cuesta la solución actual (tiempo + dinero)?
→ Si tuvieras la solución perfecta, ¿cómo sería?

Solución actual: _____________________________________
Coste estimado: _____________________________________
Frustración principal con lo actual: _________________

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CIERRE (5 min)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

→ ¿Hay algo más que debería saber sobre este tema?
→ ¿Conoces a alguien más que tenga este problema y que pueda hablar conmigo?

Referencia conseguida: □ Sí  □ No
Nombre / contacto: ___________________________________

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RESUMEN POST-ENTREVISTA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

□ Problema confirmado sin inducción
□ Disposición clara a pagar por una solución
□ Referencia conseguida

Insight más importante: ______________________________'
),
(
  'problema',
  'Checklist de validación de problema',
  'Criterios para saber si tu problema está suficientemente validado antes de pasar a solución.',
  'checklist',
  3,
  'CHECKLIST — ¿Está validado tu problema?

Marca cada ítem cuando puedas responder SÍ con evidencia real.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VOLUMEN DE ENTREVISTAS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

□ He hecho al menos 15 entrevistas documentadas
□ Ninguna es con amigos, familia o conocidos directos
□ Al menos 10 son con personas que encajan en mi ICP objetivo
□ Más del 60% han confirmado el problema sin que yo lo mencionara primero

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CALIDAD DEL PROBLEMA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

□ Puedo describir el problema en una frase que los entrevistados reconocen
□ Los entrevistados ya han intentado resolverlo (hay "workarounds" activos)
□ Puedo cuantificar el coste del problema (tiempo, dinero, oportunidad)
□ El problema ocurre con frecuencia regular (no es un caso puntual raro)
□ He identificado quién sufre más el problema dentro del segmento

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ICP DEFINIDO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

□ Tengo definido un segmento concreto y acotado (no "cualquier empresa")
□ Puedo describir al ICP con: rol, sector, tamaño empresa, situación
□ Sé por qué este segmento sufre más el problema que otros
□ Tengo ejemplos reales de personas que encajan en este ICP

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RESULTADO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

13-16 ✓ → Problema sólidamente validado. Pasa a Fase 2.
9-12 ✓  → Necesitas más entrevistas o profundidad.
< 9 ✓   → Vuelve al campo. No estás listo para la solución.'
);

-- ─── ESTRATEGIA > VALIDACIÓN ─────────────────────────────────

insert into public.cards (section_id, title, description, type, "order", content) values
(
  'validacion',
  'Canvas de validación de hipótesis',
  'Framework para documentar y priorizar las hipótesis clave de tu startup antes de validarlas.',
  'template',
  1,
  'CANVAS DE VALIDACIÓN DE HIPÓTESIS

Rellena una fila por cada hipótesis que necesitas validar.
Ordénalas de mayor a menor riesgo: empieza por la que, si falla, tumba todo.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HIPÓTESIS | CÓMO VALIDAR | MÉTRICA DE ÉXITO | RESULTADO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EJEMPLO:
Hipótesis: "Los directores de RRHH de PYMEs dedican +3h/semana a gestionar bajas"
Cómo validar: 15 entrevistas con directores RRHH
Métrica de éxito: >60% confirman el problema sin inducción
Resultado: _____________

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TUS HIPÓTESIS (de mayor a menor riesgo)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Hipótesis: ________________________________________
   Cómo validar: ______________________________________
   Métrica de éxito: __________________________________
   Resultado: □ Confirmada  □ Refutada  □ Pivote

2. Hipótesis: ________________________________________
   Cómo validar: ______________________________________
   Métrica de éxito: __________________________________
   Resultado: □ Confirmada  □ Refutada  □ Pivote

3. Hipótesis: ________________________________________
   Cómo validar: ______________________________________
   Métrica de éxito: __________________________________
   Resultado: □ Confirmada  □ Refutada  □ Pivote

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TIPOS DE HIPÓTESIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PROBLEMA  → ¿Existe el problema? ¿Le importa a alguien?
CLIENTE   → ¿Quién lo sufre exactamente? ¿Es nuestro ICP?
SOLUCIÓN  → ¿Nuestra solución resuelve el problema?
CANAL     → ¿Por dónde llegamos a ellos?
PRECIO    → ¿Pagarían? ¿Cuánto?
NEGOCIO   → ¿Podemos ganar dinero con esto?'
);

-- ─── GROWTH > ICP Y BUYER PERSONA ────────────────────────────

insert into public.cards (section_id, title, description, type, "order", content) values
(
  'icp',
  'Cómo definir tu ICP',
  'Guía paso a paso para identificar y documentar tu Ideal Customer Profile en Fase 1.',
  'playbook',
  1,
  'CÓMO DEFINIR TU ICP (Ideal Customer Profile)

El ICP no es "cualquier empresa que tenga el problema". Es el segmento concreto
donde tienes la mayor probabilidad de cerrar, entregar valor y retener.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
¿POR QUÉ IMPORTA?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Sin ICP claro:
→ Hablas con cualquiera y no cierras nada
→ Tu mensaje no resuena con nadie específico
→ Cada venta es diferente y no puedes escalar

Con ICP claro:
→ Sabes exactamente a quién buscar
→ Tu mensaje conecta porque habla de SU problema
→ Puedes construir un proceso repetible

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DIMENSIONES DEL ICP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FIRMOGRÁFICOS (para B2B)
• Sector / Industria
• Tamaño de empresa (empleados o facturación)
• Geografía
• Modelo de negocio (B2B, B2C, marketplace...)
• Fase de la empresa (startup, escaleup, corporación)

DEMOGRÁFICOS (persona de contacto)
• Rol / Cargo
• Nivel de seniority
• Departamento
• Años de experiencia

SITUACIONALES (el contexto que genera el problema)
• ¿Qué situación les lleva a tener el problema?
• ¿Qué ocurrió recientemente que hace el problema más urgente?
• ¿Tienen presupuesto asignado? ¿Proceso de compra?

PSICOGRÁFICOS
• ¿Cómo toman decisiones?
• ¿Qué métricas les importan?
• ¿A qué le temen?

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROCESO EN 3 PASOS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PASO 1 — HIPÓTESIS INICIAL
Escribe quién crees que tiene el problema más agudo.
Sé específico: "directores de operaciones de empresas de logística de 50-200 empleados en España"
no "empresas que necesiten optimizar procesos"

PASO 2 — VALIDA CON ENTREVISTAS
Habla con personas de tu hipótesis de ICP.
Identifica patrones: ¿quiénes confirman el problema con más intensidad?
¿Tienen capacidad de decisión y presupuesto?

PASO 3 — REFINA Y DOCUMENTA
Ajusta la hipótesis inicial con lo que aprendes.
Documenta el ICP v1 con todos los criterios.
Este documento evoluciona — no busques perfección, busca claridad.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SEÑAL DE BUEN ICP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Cuando describes a tu ICP, alguien de tu equipo debería poder
decir: "Ah, entonces NO hablamos con este otro tipo de empresa, ¿verdad?"
Si nadie puede decir eso, tu ICP es demasiado amplio.'
),
(
  'icp',
  'Ficha de ICP v1',
  'Template para documentar tu Ideal Customer Profile. Actualízalo después de cada bloque de entrevistas.',
  'template',
  2,
  'FICHA DE ICP v1
Versión: _______ | Fecha: _______
Validado con: _______ entrevistas

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DESCRIPCIÓN EN UNA FRASE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

"[Rol] de [tipo de empresa] que [situación que genera el problema]."

Mi ICP: _____________________________________________

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PERFIL DE EMPRESA (B2B)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Sector: _____________________________________________
Tamaño: _____________ empleados  /  _______ M€ facturación
Geografía: _________________________________________
Modelo: □ B2B  □ B2C  □ Marketplace  □ Otro: _______
Fase: □ Startup  □ Scale-up  □ PYME  □ Enterprise

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PERFIL DE PERSONA DE CONTACTO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Rol / Cargo: ________________________________________
Departamento: ______________________________________
Seniority: □ Junior  □ Manager  □ Director  □ C-Level
¿Tiene poder de decisión de compra? □ Sí  □ No  □ Influye

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EL PROBLEMA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Problema principal: __________________________________
Frecuencia: _________________________________________
Coste actual (tiempo/dinero): _______________________
Solución actual (workaround): ______________________
Frustración principal: ______________________________

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CRITERIOS DE EXCLUSIÓN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Este cliente NO es mi ICP si:
• ___________________________________________________
• ___________________________________________________
• ___________________________________________________

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EJEMPLOS REALES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Persona 1: ___________ (empresa, rol, por qué encaja)
Persona 2: ___________ (empresa, rol, por qué encaja)
Persona 3: ___________ (empresa, rol, por qué encaja)'
);

-- ─── PRODUCTO > DISCOVERY ────────────────────────────────────

insert into public.cards (section_id, title, description, type, "order", content) values
(
  'discovery',
  'Jobs to Be Done (JTBD)',
  'El framework para entender qué trabajo contrata tu cliente cuando usa tu producto.',
  'playbook',
  1,
  'JOBS TO BE DONE (JTBD)

La gente no compra productos. Contrata soluciones para hacer un trabajo.
Cuando alguien compra un taladro, el trabajo que quiere hacer es "un agujero en la pared".
Si aparece algo mejor para hacer agujeros, el taladro sobra.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
¿QUÉ ES UN "JOB"?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Un Job es el progreso que una persona quiere hacer en una situación determinada.
Tiene tres dimensiones:

FUNCIONAL → ¿Qué tarea concreta quiere completar?
EMOCIONAL → ¿Cómo quiere sentirse (o no sentirse) al hacerlo?
SOCIAL     → ¿Cómo quiere que le perciban los demás?

EJEMPLO:
Alguien que contrata un coach de ventas
  Funcional: cerrar más deals
  Emocional: sentirse competente y seguro en las llamadas
  Social: que su equipo le vea como un líder efectivo

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CÓMO IDENTIFICAR TUS JTBD
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. En tus entrevistas, pregunta:
   → "¿Qué intentabas conseguir cuando buscaste una solución?"
   → "¿Qué cambiaría en tu vida/trabajo si esto estuviera resuelto?"
   → "¿Cómo solucionabas esto antes? ¿Por qué dejó de funcionar?"

2. Documenta el contexto:
   → ¿En qué situación concreta surge la necesidad?
   → ¿Qué desencadena la búsqueda de solución?

3. Escribe el Job Statement:
   Formato: "Cuando [situación], quiero [motivación], para [resultado esperado]"

   Ejemplo: "Cuando tengo que prospectar nuevos clientes,
             quiero identificar rápidamente a quién contactar,
             para no perder tiempo con leads que nunca van a comprar"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
POR QUÉ IMPORTA EN FASE 1
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Si defines tu producto por sus features → compites en features
Si defines tu producto por el Job que resuelve → compites en resultados

El Job que resuelves debe ser el centro de:
→ Tu propuesta de valor
→ Tu mensaje de marketing
→ Las conversaciones de ventas
→ Las decisiones de producto'
);
