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

Perfeito — seguem as **ADRs** no **mesmo padrão** do seu exemplo (Status, Data, Contexto, Decisão, Consequências), cobrindo as quatro features:


## ADR-005: Ranking Global de Jogadores 

**Status**: Aceito
**Data**: 2025-08-14

### Contexto

Precisamos expor um **ranking consolidado de todos os jogadores** considerando **todas as partidas processadas**, respeitando as regras de negócio (ex.: **frags de `<WORLD>` não contam** como abates de jogador). O ranking deve permitir **paginação** e **ordenação determinística** (ex.: por frags, mortes, K/D), mantendo baixa complexidade operacional.

### Decisão

Calcular o ranking **on-demand** diretamente no **PostgreSQL** a partir das tabelas `kills` e `matches`, com **índices dedicados** para suportar agregações frequentes. Empates serão resolvidos por `frags desc`, depois `deaths asc` e `name asc`. Manter opção de **cache** futuro (ex.: Redis) se necessário.

### Consequências

**Vantagens**:

* Dados **sempre atualizados** sem pipelines de materialização.
* **Menor complexidade operacional** (fonte única de verdade nas tabelas transacionais).
* Fácil evolução das regras de ordenação.

**Desvantagens**:

* Consultas podem ficar **pesadas em alto volume**, exigindo **índices** e, potencialmente, **cache**.

---

## ADR-006: Arma Preferida do Vencedor — Critérios e Cálculo

**Status**: Aceito
**Data**: 2025-08-14

### Contexto

Para cada partida, devemos identificar o **vencedor** (jogador com **mais frags**, ignorando `<WORLD>`) e sua **arma preferida** (arma **mais utilizada** pelo vencedor naquela partida). Precisamos definir desempates e manter performance sem alterar o schema.

### Decisão

1. **Vencedor da partida**: jogador com maior `frags` em `kills` para o `match_id`, **excluindo `<WORLD>`**.
   Critérios de desempate: `deaths asc` → **último frag mais cedo** (`MAX(kill_time)` menor) → `name asc`.
2. **Arma preferida**: `weapon_name` com **maior contagem** de kills do vencedor naquele `match_id`, empate por `weapon_name asc`.

### Consequências

**Vantagens**:

* **Sem mudanças de schema**.
* Boa performance com **GROUP BY** + **índices**.


**Desvantagens**:

* Requer atenção a **colunas e índices** para evitar *full scans*.
* Regras de desempate adicionam **complexidade** de consulta/serviço.


## ADR-007: Maior Sequência de Frags (Streak) — Definição e Cálculo

**Status**: Aceito
**Data**: 2025-08-14

### Contexto

Precisamos descobrir, **por partida**, a **maior sequência de frags** efetuados por um jogador **sem morrer** no intervalo, respeitando a ordem temporal dos eventos.

### Decisão

Calcular o **streak** em **nível de serviço** (camada de aplicação), processando os eventos do `match_id` **ordenados por `kill_time`**:

* Incrementar o contador do **mesmo killer** a cada kill (excluindo `<WORLD>` como killer).
* Rastrear o **máximo** por jogador e o **máximo geral** da partida.
  Persistência **não necessária** (cálculo sob demanda); expor via endpoint/consulta específica se requerido.

### Consequências

**Vantagens**:

* Sem dependência de SQL.
* **Fácil evolução**.

**Desvantagens**:

* Processamento **em memória** por partida; pode exigir otimização para logs muito grandes.


## ADR-008: Awards Específicos — NoDeathAward e SpeedKillerAward

**Status**: Aceito
**Data**: 2025-08-14

### Contexto

Devemos conceder **prêmios** conforme regras:

* **NoDeathAward**: jogadores que **venceram a partida** (maior frags, excluindo `<WORLD>`) **sem morrer**.
* **SpeedKillerAward**: jogadores que **realizarem 5 frags em 1 minuto** dentro da **mesma partida** (excluindo `<WORLD>` como killer).
  É necessário padronizar critérios, empates e limites.

### Decisão

* **NoDeathAward**: após determinar o vencedor (ADR-006), conceder o award se `deaths = 0`. Em caso de **co-vencedores**, todos com `deaths = 0` recebem.
* **SpeedKillerAward**: detectar **janela deslizante de 60s** por jogador e partida:

  * Ordenar kills por `kill_time` (onde `killer_name <> '<WORLD>'`);
  * Conceder o award **uma vez por partida por jogador** (mesmo que haja múltiplas janelas).
* Implementar na **camada de serviço**, reaproveitando os eventos em memória; manter alternativa futura em SQL com **window functions** se necessário.

### Consequências

**Vantagens**:

* Regras **explícitas** e aderentes ao domínio; fácil auditoria (timestamps).
* Possível reutilizar a mesma varredura de eventos para **streak** e **speed**.

**Desvantagens**:

* Pode exigir **normalização de timezone**.

