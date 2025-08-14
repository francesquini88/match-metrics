# 📊 Match Metrics API

Um serviço desenvolvido com **Node.js** e **NestJS** para processar e analisar dados de **logs de partidas de jogos**.  
Permite o upload de arquivos de log e gera **rankings detalhados de frags e mortes** para cada partida.


## 🚀 Funcionalidades

- Upload de arquivos de log de partidas.
- Processamento e extração de estatísticas detalhadas.
- Geração de rankings de frags e mortes por partida.
- Documentação interativa da API com **Swagger**.
- Testes unitários e de integração com **Jest**.


## 🛠 Tecnologias Utilizadas

- **Node.js** – Ambiente de execução JavaScript.
- **NestJS** – Framework escalável para Node.js.
- **TypeScript** – Tipagem estática para maior segurança no código.
- **TypeORM** – Mapeamento objeto-relacional.
- **PostgreSQL** – Banco de dados relacional.
- **Docker & Docker Compose** – Containerização e orquestração.
- **Jest** – Testes automatizados.
- **Swagger** – Documentação da API.

## 📚 Documentos & Recursos

Como parte da documentação, vários artefatos foram preparados para auxiliar o entendimento da equipe, incluindo:

- **ADR(Registros de decisões de arquitetura)**: [Justificativa](/docs/architecture-decision.md)
- **Swagger UI**: `http://localhost:4000/api-docs`
- **Banco de Dados**: [Justificativa](/docs/banco-de-dados.md)
- **Vídeo explicativo da aplicação**: 
- **Diagramas**: Diagramas do modelo C4 nas camadas de contexto, contêiner e componente, para oferecer uma visão abrangente e estruturada da arquitetura do sistema.
  - [Context](/docs/c4-model/systemcontext.png)
  - [Container](/docs/c4-model/container.png)
  - [Component](/docs/c4-model/component.png)

## 📦 Instalação Rápida

### **Pré-requisitos**
- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- [Node.js LTS](https://nodejs.org/en/download/)

### **Passos**
```bash
# Clone o repositório
git clone https://github.com/francesquini88/match-metrics.git
cd match-metrics

# Crie o arquivo de variáveis de ambiente
cp .env.example .env

# Suba os containers
docker-compose up --build
````

A API estará disponível em **[http://localhost:4000](http://localhost:4000)**

O Swagger estará disponível em **http://localhost:4000/api-docs**


## ⚙️ Configuração

Arquivo `.env`:

```env
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_USER=admin
DATABASE_PASSWORD=admin123
DATABASE_NAME=db
```

## 🚀 Endpoints

| Method | Path                                    | Description                              |
| ------ | --------------------------------------- | -----------------------------------------|
| POST   | `/matches/upload`                       | Upload de arquivo de log.                |
| GET    | `/matches/{matchId}/ranking`            | Ranking de frags e mortes de uma partida.|
| GET    | `/matches/ranking/global?page=1&limit=3`| Ranking geral de jogadores.              |

## 📒 Postman Collection

Para importar e testar a API no Postman: [Collection](/docs/metric-logs.postman_collection.json)

Arquivo para realizar o teste de upload: [Arquivo](/docs/arquivo_para_testes.txt)

## 🧪 Testes

```bash
# Unitários
npm run test

# Integração (E2E)
npm run test:e2e

# Cobertura
npm run test -- --coverage
```

O relatório estará disponível em `coverage/lcov-report/index.html`.



## 📂 Estrutura do Projeto

```
src/
 ├── modules/        # Funcionalidades isoladas (users, matches, etc.)
 ├── common/         # Utilitários, interceptors e filtros
test/                # Testes E2E
.env                 # Variáveis de ambiente
```

---

## 📜 Fluxo de Uso

1. **Upload** de arquivo `.txt` via endpoint.
2. **Processamento** e extração das estatísticas.
3. **Consulta** dos rankings via endpoint GET.
