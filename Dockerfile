# Estágio 1: Build (para compilar a aplicação)
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Estágio 2: Produção (para rodar a aplicação compilada)
FROM node:22-alpine

WORKDIR /app

# Copia os arquivos de produção e as dependências do estágio de build
COPY --from=build /app/package*.json ./
COPY --from=build /app/dist ./dist

# Instala apenas as dependências de produção
RUN npm install --omit=dev

# Exponha a porta em que o NestJS está rodando
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["node", "dist/main"]