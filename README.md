# orbis-web-cdp

La zona de contactos. App Next independiente bajo `/contactos` (D7).

## Antes de empezar

**Este repo no se clona solo.** `npm install` falla si `orbis-packages` no está como
carpeta hermana: los paquetes compartidos se consumen como tarballs del disco
(`file:../orbis-packages/dist-packs/...`), no desde un registry. Para levantar y probar
de verdad hacen falta los 14 repos, todos bajo `01-orbis/repos/`.

El arranque completo desde cero está en **`plataforma-docs/EMPEZAR-AQUI.md`**.

### Ramas

`main` (estable) · `qa` (pruebas) · ramas de trabajo.

```bash
git checkout main && git pull        # el pull nunca se salta
git checkout -b feat/lo-que-sea
# ... cambios, commit, push de la rama ...
git checkout qa && git pull && git merge --no-ff feat/lo-que-sea && git push origin qa
```

A `main` solo se mergea cuando la prueba en `qa` pasó.

### Probar el cambio en QA

```bash
cd ../orbis-infra
docker compose --env-file .env.qa -p orbis-qa build web-cdp
docker compose --env-file .env.qa -p orbis-qa up -d web-cdp
# se abre en http://localhost:3005/contactos
```

Esta app no tiene base de datos: un cambio aquí solo necesita reconstruir su imagen.

QA tiene **su propia base** en contenedor. Desarrollo usa la de Supabase, que es
**compartida por todo el equipo**: un `db:push` o un `db:seed` desde tu máquina la cambia
para todos. Cualquier prueba que toque datos va en QA.

Cómo se levanta QA la primera vez, y cómo se vuelve a desarrollo, en
**`plataforma-docs/AMBIENTE-QA.md`**. Qué hay que correr según lo que tocaste, en
**`plataforma-docs/APLICAR-CAMBIOS.md`**.

## Arrancar en local

```bash
cp .env.example .env.local
npm install
npm run dev      # http://localhost:3005/contactos
```

Necesita `orbis-cdp` (4003) y, para ver las conversaciones de un contacto,
`orbis-chat` (4004).

## Qué hay

**Lista** — búsqueda por nombre, teléfono, correo o ciudad; los canales por los que ha
escrito cada persona, como puntos de color; última actividad; paginación de 20.

**Ficha** — datos editables (nombre, teléfono, correo, ciudad, dirección), los
atributos propios de la vertical, las **identidades por canal**, la historia del
contacto, sus conversaciones y el consentimiento con su origen y fecha.

**Eliminar datos personales** — el borrado por solicitud del titular. Avisa
exactamente qué borra y qué conserva antes de hacerlo, porque no se puede deshacer.

## Por qué la ficha se ve así

**Las identidades son el corazón del CDP**, no un detalle técnico: son lo que hace que
la misma persona por WhatsApp y por el webchat sea un solo contacto. Por eso tienen su
propio bloque, con el título en palabras — "Cómo se llega a esta persona" — y no
escondidas en una tabla de metadatos.

**Los datos los completa el agente durante la conversación**; esta pantalla es para
corregirlos. Se dice en la propia pantalla, para que nadie espere llenarlos a mano.

**El consentimiento se muestra tal cual se guardó** (origen, fecha y alcance). Es lo
que hay que poder enseñar si alguien lo pregunta.

## Pendiente

- Segmentos y filtros guardados.
- Unificar dos contactos duplicados: operación explícita y auditada.
- Exportar a CSV.
- Abrir la conversación exacta desde la ficha (hoy lleva al inbox).
