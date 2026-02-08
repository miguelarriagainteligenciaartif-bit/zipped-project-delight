# 📋 Guía de Instalación — Edgecore NASDAQ

Guía paso a paso para configurar tu propia instancia de Edgecore NASDAQ.

---

## PASO 1: Crear cuenta en GitHub

1. Ir a [github.com](https://github.com) → **Sign up**
2. Crear cuenta con email y contraseña
3. Confirmar el email

---

## PASO 2: Hacer Fork del repositorio

1. Ir al repositorio del proyecto (el enlace te lo dará el administrador)
2. Clic en el botón **"Fork"** (arriba a la derecha)
3. Darle un nombre y clic en **"Create Fork"**
4. Ahora tienes tu propia copia del código

---

## PASO 3: Crear cuenta en Supabase

1. Ir a [supabase.com](https://supabase.com) → **Start your project**
2. Iniciar sesión con tu cuenta de GitHub (botón **"Continue with GitHub"**)
3. Autorizar la conexión cuando te lo pida

---

## PASO 4: Crear un nuevo proyecto en Supabase

1. Clic en **"New Project"**
2. Elegir una organización (o crear una nueva)
3. Rellenar los datos:
   - **Nombre del proyecto**: el que quieras (ej: `mi-edgecore`)
   - **Contraseña de base de datos**: genera una segura y **guárdala en un lugar seguro**
   - **Región**: la más cercana a ti (ej: `Frankfurt` si estás en España)
4. Clic en **"Create new project"**
5. **Esperar ~2 minutos** a que se cree el proyecto

---

## PASO 5: Crear la base de datos

1. En el menú lateral de Supabase, clic en **"SQL Editor"** (ícono de terminal)
2. Clic en **"New query"**
3. **Copiar y pegar TODO el siguiente código** en el editor:

```sql
-- 1. Crear tabla de perfiles
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  username TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Activar seguridad (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Políticas de seguridad
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profile"
ON public.profiles FOR DELETE
USING (auth.uid() = user_id);

-- 4. Función para actualizar timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 5. Función para crear perfil automáticamente al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'username', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 6. Trigger: crear perfil cuando se registra un usuario
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 7. Trigger: actualizar timestamp automáticamente
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
```

4. Clic en **"Run"** (o Ctrl+Enter)
5. Debe aparecer **"Success. No rows returned"** → ¡está correcto!

---

## PASO 6: Configurar autenticación

1. En el menú lateral de Supabase, clic en **"Authentication"** (ícono de candado)
2. Ir a **"Providers"** → asegurarse de que **Email** está habilitado (está por defecto)
3. Ir a **"Settings"** → pestaña **"Email"** → activar **"Enable HIBP Check"** (protección contra contraseñas filtradas)

---

## PASO 7: Obtener las claves de conexión

1. En el menú lateral de Supabase, clic en **"Settings"** (⚙️ engranaje)
2. Ir a **"API"** (en la sección "Configuration")
3. Copiar estos valores y guardarlos:

| Dato | Dónde encontrarlo |
|------|-------------------|
| **Project URL** | Sección "Project URL" — algo como `https://xxxxx.supabase.co` |
| **Anon/Public Key** | Sección "Project API keys" → `anon` `public` — cadena larga que empieza con `eyJ...` |
| **Project ID** | Está en la URL del navegador: `supabase.com/dashboard/project/TU_PROJECT_ID` |

---

## PASO 8: Configurar el código

### Opción A: Editar en GitHub (más fácil)

1. Ir a tu fork en GitHub
2. Buscar y abrir el archivo **`.env`** en la raíz del proyecto
3. Clic en el ícono de **lápiz** (editar)
4. Reemplazar el contenido con tus datos:

```
VITE_SUPABASE_PROJECT_ID="tu_project_id_aqui"
VITE_SUPABASE_PUBLISHABLE_KEY="tu_anon_key_aqui"
VITE_SUPABASE_URL="https://tu_project_id.supabase.co"
```

5. Clic en **"Commit changes"**

### Opción B: Editar en local

1. Clonar tu fork:
   ```bash
   git clone https://github.com/TU-USUARIO/TU-REPO.git
   cd TU-REPO
   ```
2. Abrir el archivo `.env` con un editor de texto
3. Reemplazar los valores como en la Opción A
4. Guardar

---

## PASO 9: Probar en local

1. **Instalar Node.js** si no lo tienes: ir a [nodejs.org](https://nodejs.org) → descargar versión **LTS** → instalar
2. Abrir la terminal/consola en la carpeta del proyecto
3. Ejecutar:
   ```bash
   npm install
   npm run dev
   ```
4. Abrir el navegador en `http://localhost:5173`
5. **Crear una cuenta** → recibirás un email de confirmación → confirmar → ¡listo!

---

## PASO 10: Desplegar en internet (opcional)

### Opción: Netlify (gratis)

1. Ir a [netlify.com](https://www.netlify.com) → **Sign up** con GitHub
2. Clic en **"Add new site"** → **"Import an existing project"**
3. Seleccionar tu repositorio
4. Configurar:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. En **"Environment variables"** → añadir las 3 variables del archivo `.env`:
   - `VITE_SUPABASE_PROJECT_ID` = tu project id
   - `VITE_SUPABASE_PUBLISHABLE_KEY` = tu anon key
   - `VITE_SUPABASE_URL` = tu project url
6. Clic en **"Deploy site"**
7. ¡Tendrás una URL pública para acceder a tu app!

### Opción: Vercel (gratis)

1. Ir a [vercel.com](https://vercel.com) → **Sign up** con GitHub
2. Clic en **"New Project"** → importar tu repositorio
3. Añadir las mismas variables de entorno
4. Clic en **"Deploy"**

---

## ⚠️ Información importante

- Los **datos de trading** (checklist, historial, estadísticas) se guardan en el **navegador** de cada usuario (localStorage)
- Si cambias de navegador o borras los datos del navegador, **se pierde el historial**
- La base de datos solo gestiona el **registro e inicio de sesión** de usuarios
- Cada usuario tiene sus propios datos separados y seguros

---

## 🆘 ¿Problemas?

- **"Success. No rows returned"** al ejecutar el SQL → Es correcto, no es un error
- **No recibo el email de confirmación** → Revisar la carpeta de spam
- **Error al iniciar sesión** → Asegurarse de haber confirmado el email primero
- **La app no carga** → Verificar que las 3 variables del `.env` son correctas
- **npm install falla** → Asegurarse de tener Node.js versión 18 o superior (`node --version`)
