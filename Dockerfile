# ==========================================
# ÉTAPE 1 : compiler React avec Node
# ==========================================
FROM node:22-alpine AS build

WORKDIR /app

# Profiter du cache pour les dépendances npm
COPY package.json package-lock.json ./
RUN npm ci

# Copier le frontend
COPY . .

# Dans Docker, React utilise des URL relatives /api
ARG VITE_API_BASE_URL=""
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

RUN npm run build


# ==========================================
# ÉTAPE 2 : servir React avec Nginx
# ==========================================
FROM nginx:1.27-alpine

# Supprimer la configuration Nginx par défaut
RUN rm /etc/nginx/conf.d/default.conf

# Ajouter notre configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copier uniquement le résultat compilé
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK \
    --interval=15s \
    --timeout=5s \
    --start-period=10s \
    --retries=5 \
    CMD wget --quiet --tries=1 --spider http://localhost/healthz || exit 1