# ── Etapa 1: Build ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copia archivos de dependencias
COPY package*.json ./
COPY prisma ./prisma/
COPY tsconfig*.json ./

# Instala todas las dependencias (incluyendo devDependencies para compilar)
RUN npm ci

# Genera el cliente de Prisma
RUN npx prisma generate

# Copia el resto del código
COPY . .

# Compila TypeScript a JavaScript
RUN npm run build

# Verifica que el build existe
RUN ls -la dist/

# ── Etapa 2: Producción ───────────────────────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

# Copia archivos de dependencias
COPY package*.json ./
COPY prisma ./prisma/

# Instala solo dependencias de producción
RUN npm ci --only=production

# Genera el cliente de Prisma
RUN npx prisma generate

# Copia el build generado en la etapa anterior
COPY --from=builder /app/dist ./dist

# Verifica que dist/main existe
RUN ls -la dist/

# Puerto que expone la app
EXPOSE 3000

# Comando para arrancar
CMD ["node", "dist/src/main"]