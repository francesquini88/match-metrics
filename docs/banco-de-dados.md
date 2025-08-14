# Documentação do Banco de Dados
Este banco de dados foi projetado para gerenciar informações de partidas de jogos e registrar eventos de eliminações (kills) ocorridos durante essas partidas.
A estrutura foi organizada para garantir **integridade referencial**, manter um **histórico completo** das partidas e facilitar consultas essenciais, como rankings, estatísticas e análises detalhadas de jogadas.


## Banco de Dados Relacional (SQL)
### Justificativa:

* O sistema possui relações claras entre entidades (por exemplo, `matches` e `kills`), que são melhor gerenciadas em um banco de dados relacional.
* A **consistência dos dados** é crítica (por exemplo, garantir que uma eliminação sempre esteja associada a uma partida válida).
* A estrutura do banco de dados é **bem definida e estável**, adequada para o modelo relacional.
* Consultas complexas (por exemplo, estatísticas de jogadores, histórico de partidas) são mais eficientes em bancos relacionais.



## Justificativas de Design

### Normalização:

* O schema evita redundâncias e garante integridade referencial.

### Relacionamentos (Foreign Keys):

* **matches → kills**: Uma partida pode ter múltiplos registros de eliminações associadas.

### Uso de Índices:

* Índices são utilizados em colunas críticas para otimizar buscas, como `match_id`.

### Modularidade:

* As tabelas são separadas por responsabilidade:

  * **matches** armazena dados da partida.
  * **kills** armazena eventos específicos da partida (eliminação de um jogador por outro).

## Estrutura do Banco de Dados

### Tabelas Principais:

1. **matches** – Armazena informações sobre as partidas.

   * **id** (`uuid`, PK) – Identificador único da partida.
   * **match\_id** (`integer`, único) – Identificador numérico da partida.
   * **start\_date** (`timestamp with time zone`) – Data/hora de início da partida.
   * **end\_date** (`timestamp with time zone`) – Data/hora de término da partida.
   * **rawLog** (`text`) – Registro bruto do log da partida.

2. **kills** – Registra eventos de eliminações ocorridos nas partidas.

   * **id** (`uuid`, PK) – Identificador único da eliminação.
   * **killer\_name** (`varchar`, obrigatório) – Nome do jogador que realizou a eliminação.
   * **victim\_name** (`varchar`, obrigatório) – Nome do jogador que foi eliminado.
   * **weapon\_name** (`varchar`) – Arma utilizada na eliminação.
   * **kill\_time** (`timestamp with time zone`, obrigatório) – Momento da eliminação.
   * **match\_id** (`uuid`, FK → matches.id) – Referência à partida na qual a eliminação ocorreu.

## Resumo dos Relacionamentos

* **matches (1) → kills (N)**

  * Cada partida pode conter diversas eliminações registradas.

  * A remoção de uma partida remove automaticamente todas as eliminações associadas (*ON DELETE CASCADE*).
