# Incomex

Aplicación móvil (Expo SDK 54) para registrar ingresos y gastos diarios, pensada para Android. Permite visualizar movimientos por día, navegar con un calendario interactivo, editar registros existentes y generar reportes mensuales y anuales con desglose por fuente.

## Características principales

- Registro de ingresos (cash, card, App T3) y gastos sin mezclarlos: se muestran como totales independientes.
- Calendario interactivo que marca los días con actividad y permite cambiar rápidamente de fecha.
- Lista editable de movimientos diarios con notas, colores por fuente y retroalimentación háptica.
- Reportes visuales mensuales/anuales con gráficas circulares (Victory) y porcentajes por fuente.
- Animaciones suaves (Reanimated) y tarjetas estadísticas con gradientes.
- Cliente Supabase ya configurado para persistir datos.

## Requisitos previos

- Node.js 18+
- npm 9+
- Expo CLI (`npm install -g expo-cli`) o ejecutar con `npx expo`
- Proyecto Supabase con tabla `ledger_entries`

## Configuración inicial

1. Instala dependencias:
   ```bash
   npm install
   ```
2. Crea un archivo `.env` basado en `.env.example` y rellena tus credenciales de Supabase:
   ```bash
   cp .env.example .env
   ```
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://yccykdxmwglzeluyxnvk.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
3. Configura la tabla en Supabase (SQL recomendado):
   ```sql
   create table if not exists public.ledger_entries (
     id uuid primary key default uuid_generate_v4(),
     amount numeric(12,2) not null check (amount > 0),
     entry_date date not null,
     entry_type text not null check (entry_type in ('income', 'expense')),
     source text not null check (source in ('cash', 'card', 'app_t3', 'expense')),
     note text,
     created_at timestamptz not null default timezone('utc', now()),
     updated_at timestamptz not null default timezone('utc', now())
   );

   create index if not exists ledger_entries_entry_date_idx on public.ledger_entries(entry_date);

   create trigger update_timestamp
     before update on public.ledger_entries
     for each row
     execute procedure trigger_set_timestamp();
   ```
   Asegúrate de tener la extensión `uuid-ossp` habilitada si aún no existe: `create extension if not exists "uuid-ossp";`.

## Ejecución

- Desarrollo (Android):
  ```bash
  npm run android
  ```
- Otros targets soportados por Expo:
  ```bash
  npm run start   # abre el menú interactivo de Expo
  npm run web     # vista previa web
  ```

## Organización del código

```
src/
  components/      # UI reutilizable (tarjetas, modal, controles)
  config/          # Lectura de variables de entorno
  constants/       # Constantes de fuentes y estilos
  hooks/           # React Query y lógica de agregados
  models/          # Tipos de dominio (Ledger)
  navigation/      # Navegación inferior
  providers/       # Providers globales (React Query, SafeArea)
  screens/         # Pantallas Daily y Reports
  services/        # Cliente Supabase y CRUD
  theme/           # Paleta y espaciamientos
  utils/           # Fechas, formato, haptics
```

## Notas

- La app está pensada para Android. Verifica los haptics y animaciones en dispositivo físico o emulador reciente.
- Ajusta la moneda en `src/utils/format.ts` si necesitas otra divisa distinta a EUR.
- Usa `npx tsc --noEmit` para validar tipos y mantener la app estable.

¡Listo! Ejecuta la app y comienza a registrar tus movimientos diarios.
