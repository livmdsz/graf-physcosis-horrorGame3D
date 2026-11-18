# PSYCHOSIS — Horror psicológico 2D

**Materia:** Graficación · **Institución:** Tecnológico Nacional de México, Campus Instituto Tecnológico de Pachuca  
**Creadora:** Itzel Mendoza Sánchez · **No. de control:** 26201715

## Contexto
PSYCHOSIS es una experiencia web de terror psicológico situada en un pasillo hospitalario abandonado. El jugador debe detectar y eliminar objetivos antes de que termine el tiempo, mientras las entidades se desplazan por el escenario.

## Objetivo
Aplicar Canvas 2D, imágenes, animación, interacción por mouse, detección de colisiones, sonido, interfaz adaptable con Bootstrap y persistencia local de puntuaciones.

## Justificación
El proyecto integra los conceptos de graficación en una aplicación interactiva con una estética de horror y suspenso. La mecánica de apuntar a la cabeza exige precisión y observación, y los movimientos variables mantienen el escenario activo.

## Operación
1. Abre `index.html` en un navegador moderno o publica la carpeta en GitHub Pages.
2. Espera a que finalice la pantalla de carga.
3. En el menú, selecciona **Iniciar partida**. Las instrucciones y la configuración están disponibles en el menú.
4. Haz clic en la **cabeza** de los zombis. Cada acierto aumenta la puntuación y el objetivo reaparece en otra zona.
5. Las 25 entidades se desplazan en cuatro patrones (arriba, abajo, diagonal y circular); rebotan al colisionar y producen un efecto visual breve.
6. La partida termina al agotarse el cronómetro. Los últimos diez segundos se resaltan en rojo.
7. El récord se conserva en `localStorage` del navegador. El sonido puede activarse/desactivarse con el control superior.

## Estructura
```text
videojuego2d/
├── index.html
├── styles.css
├── game.js
├── README.md
└── assets/
    ├── ambience.wav
    ├── favicon.svg
    ├── game-hall.png
    ├── loading-hall.png
    ├── menu-corridor.png
    ├── shot.wav
    └── zombie.png
```

## Tecnologías y características
- HTML5 Canvas 2D y JavaScript sin frameworks de juego.
- Bootstrap 5.3 por CDN para estructura y componentes.
- 25 entidades, velocidades y patrones diferentes.
- Colisiones con inversión de velocidad y partículas de impacto.
- Puntero tipo mira, efectos al disparar, audio ambiente y efecto de disparo.
- Fecha de acceso dinámica en el pie de página.
- Récord guardado en el navegador mediante `localStorage`.
- Diseño adaptable para escritorio y móvil.

## Publicación en GitHub Pages
En la carpeta del proyecto, ejecuta:

```bash
git init
git add .
git commit -m "feat: crear videojuego PSYCHOSIS"
git branch -M main
git remote add origin https://github.com/USUARIO/REPOSITORIO.git
git push -u origin main
```

En GitHub, abre **Settings → Pages**, selecciona **Deploy from a branch**, elige `main` y la carpeta `/ (root)`, y guarda. Sustituye `USUARIO/REPOSITORIO` por los datos reales del repositorio. Verifica la URL que GitHub Pages muestre.

## Conclusiones
PSYCHOSIS reúne en una experiencia interactiva las bases de Canvas 2D: dibujo de imágenes, animación por fotogramas, movimiento, detección de colisiones, interacción con el mouse y efectos gráficos. La interfaz, los controles de sonido y la persistencia local complementan la operación del juego. Antes de entregar, se recomienda probarlo en el navegador objetivo y comprobar la publicación remota.

## Créditos de recursos
Las imágenes de escenario y la ilustración de zombi se basan en los archivos de referencia proporcionados para este proyecto. Los sonidos ambientales y de disparo se generan como archivos WAV incluidos en `assets/`. El favicon es un SVG creado para PSYCHOSIS.


## Actualización 3D: personaje armado, controles y audio

La partida principal ahora abre directamente `escenario3d.html`. Se incorporó un personaje humanoide 3D con una pistola visible (cuerpo, empuñadura, corredera, cañón y destello de disparo). La animación de caminar y correr se genera mediante articulaciones; el modo apuntar mantiene el arma preparada.

### Controles revisados
- W/A/S/D o flechas: desplazamiento en relación con la orientación horizontal de la cámara.
- 1: caminar.
- 2: correr.
- 3: apuntar con el arma.
- Q/E: giro de 90 grados.
- Espacio: saltar.
- F o clic izquierdo: disparar.
- Shift: correr temporalmente.
- Esc: pausar/reanudar.
- Ratón: orbitar la cámara; rueda: zoom.

### Audio
Se reutilizan `assets/ambience.wav` y `assets/shot.wav` del proyecto PSYCHOSIS original. El navegador inicia el audio después de la primera interacción del usuario, debido a las políticas de reproducción automática. El botón inferior permite activar o desactivar el sonido.

### Recursos visuales reutilizados
La escena incorpora imágenes del proyecto base: `game-hall.png` y `menu-corridor.png` como referencias visuales de las paredes, `zombie.png` como imagen decorativa del fondo, y una textura de losetas/concreto `floor-hospital.png` para el plano cuadrado bajo el personaje.

### Ejecución
En Windows, descomprime el proyecto y ejecuta `INICIAR_PSYCHOSIS.bat`. No abras los HTML mediante doble clic; el servidor local es necesario para los módulos ES de Three.js. Se requiere Internet para descargar Three.js desde CDN.


### Dependencias Three.js locales
Para evitar depender de una versión externa de Three.js en CDN, se integró una copia local de la biblioteca y sus módulos desde el archivo de referencia `graf-threejs3dScenario.rar`:
- `vendor/three/three.module.js`
- `vendor/three/addons/controls/OrbitControls.js`
- `vendor/three/addons/loaders/FBXLoader.js`
- `vendor/three/addons/libs/fflate.module.js`
- `vendor/models/Flair.fbx` (personaje humano riggeado de Mixamo)

La escena intenta cargar el FBX local y acopla el arma a su hueso `RightHand`. Si el FBX no puede cargarse, conserva el personaje humanoide de respaldo, que también tiene un arma visible y animaciones por articulaciones.

**Referencias web proporcionadas en la guía:** los cinco enlaces cortos redirigen a ejemplos alojados en GitHub Pages. En el entorno de preparación, las páginas de destino no permitieron recuperar su contenido directamente; por ello, no se atribuyen funciones específicas a esos ejemplos. La implementación utiliza la biblioteca, los controles y el cargador FBX que sí se pudieron inspeccionar y extraer del RAR de referencia.


## Corrección de pantalla de carga infinita

Se modificó `scene3d.js` para que las texturas tengan un límite de espera y un material procedural de respaldo si alguna imagen no se puede leer. La descarga del FBX ahora ocurre en segundo plano y no bloquea la construcción ni el renderizado del escenario. Si el modelo tarda demasiado o falla, permanece visible el personaje 3D armado de respaldo. Se verificó la sintaxis del módulo JavaScript con Node.js.


## Solución al error 404 de NURBSCurve.js

La consola mostraba un error 404 porque `FBXLoader.js` importaba `../curves/NURBSCurve.js`, pero esa carpeta no estaba incluida en el paquete local de Three.js. Para impedir que ese módulo ausente detenga por completo el renderizado, esta revisión elimina la importación del FBXLoader y utiliza el personaje humanoide 3D armado que ya está construido con geometrías y articulaciones dentro de `scene3d.js`. El entorno, las texturas, la cámara, controles, disparos y audio permanecen activos. El FBX no se carga en esta revisión; se prioriza que la escena 3D arranque sin la dependencia incompleta.
