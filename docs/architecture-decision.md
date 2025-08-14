## ADR-001: Escolha do PostgreSQL como Banco de Dados Primário

**Status**: Aceito
**Data**: 2025-08-13

### Contexto

O sistema precisa armazenar informações sobre partidas e eventos de jogo (kills) com integridade referencial, consultas históricas e suporte a migrações de schema.
Como há relações diretas entre as entidades (`matches` e `kills`), o banco de dados precisa oferecer suporte transacional e recursos avançados de SQL.

### Decisão

Adotar **PostgreSQL 15** como banco de dados relacional principal.

### Consequências

**Vantagens**:

* Ferramentas maduras para migração de schema (ex.: TypeORM migrations).
* Recursos avançados como JSONB e índices parciais.

**Desvantagens**:

* Exige configuração de cluster mais complexa em produção.
* Pode ser mais custoso para consultas analíticas em tempo real.


## ADR-002: Uso do NestJS como Framework Backend

**Status**: Aceito
**Data**: 2025-08-13

### Contexto

O sistema precisa ser modular, escalável e fácil de manter, com suporte a injeção de dependências, camadas bem definidas e documentação de APIs.
Também é necessário integrar testes unitários e de integração de forma nativa.

### Decisão

Utilizar **NestJS** como framework para o backend em Node.js.

### Consequências

**Vantagens**:

* Arquitetura modular baseada em decorators e injeção de dependências.
* Integração simples com TypeORM e PostgreSQL.
* Suporte embutido a validação de dados, interceptors e filtros de exceção.
* Geração automática de documentação com Swagger.

**Desvantagens**:

* Curva de aprendizado inicial maior para desenvolvedores sem experiência prévia.
* Estrutura de projeto mais rígida em comparação a frameworks minimalistas.


## ADR-003: Estratégia para Processamento e Armazenamento de Logs

**Status**: Aceito
**Data**: 2025-08-13

### Contexto

Os arquivos de log podem conter múltiplas partidas e precisam ser processados de forma confiável, gerando registros de `matches` e `kills` no banco.
Alguns eventos, como kills realizados pelo `<WORLD>`, devem ser ignorados no cálculo de frags.

### Decisão

Implementar um **serviço de processamento de logs** com as seguintes regras:

* Leitura linha a linha do arquivo.
* Identificação de eventos de início e fim de partida.
* Registro de kills com associação à partida.
* Ignorar kills realizados pelo `<WORLD>` para contagem de frags.

### Consequências

**Vantagens**:

* Processamento claro e rastreável.
* Regras de negócio explícitas.
* Fácil extensão para novos tipos de eventos.

**Desvantagens**:

* Requer validação e testes extensivos para evitar inconsistências.
* Processamento síncrono pode ser custoso para arquivos muito grandes (possível melhoria futura com fila de mensagens).

Perfeito. Aqui está a ADR focada na decisão sobre uso do **README detalhado** como parte da estratégia de documentação da aplicação:


## ADR-004: Uso de README Detalhado como Documento Principal de Referência

**Status**: Aceito
**Data**: 2025-08-13

### Contexto

O projeto precisa apresentar de forma clara e acessível as informações essenciais para desenvolvedores e avaliadores, incluindo:

* Contexto e objetivos da aplicação.
* Guia de instalação, configuração e execução.
* Exemplos de uso da API.
* Informações sobre arquitetura e decisões técnicas.
* Procedimentos para testes e contribuição.

Como se trata de uma prova de conceito, a documentação precisa estar **centralizada** em um único local para facilitar a consulta, sem depender de ferramentas externas ou múltiplos arquivos espalhados pelo repositório.

### Decisão

Utilizar o arquivo **`README.md`** como documento principal de referência do projeto, estruturado com:

* **Título e descrição resumida**.
* **Lista de funcionalidades e tecnologias** utilizadas.
* **Instruções passo a passo** para execução local e em produção.
* **Exemplos práticos de chamadas à API**.
* **Seção de testes** e informações de cobertura.
* **Instruções de contribuição** e licenciamento.

### Consequências

**Vantagens**:

* Centraliza as informações essenciais em um único documento fácil de acessar.
* Facilita a avaliação de terceiros sem necessidade de explorar toda a base de código.
* Segue boas práticas de open source, aumentando a clareza e atratividade do projeto.
* Facilita manutenção da documentação em paralelo à evolução do código.

**Desvantagens**:

* Exige disciplina para manter o README atualizado conforme o projeto evolui.
* Pode tornar-se extenso, demandando organização clara e tópicos bem estruturados.

