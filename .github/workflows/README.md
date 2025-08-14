# CI/CD com GitHub Actions – Prova de Conceito

Esta prova de conceito apresenta um exemplo de **pipeline automatizado** utilizando **GitHub Actions** com **Node.js**, contemplando fluxos de *deploy* e *teardown* da infraestrutura.

### Fluxos Configurados

* **`.github/workflows/deploy.yml`** – **Simula** o processo de build e testes do projeto **Node.js** e a aplicação da infraestrutura com **Terraform**.
* **`.github/workflows/destroy.yml`** – **Simula** a execução do `terraform destroy` de forma manual via interface do GitHub.

### Destaques Técnicos

* Preparado para incluir **análise de qualidade** com **SonarQube** (via `sonar-scanner`) validando com **Quality Gate**.
* Boas práticas de **CI/CD** para projetos Node.js: `actions/setup-node`, cache de dependências (`npm`), etapas separadas de *install*, *test* e *build*.
* Estrutura modular, fácil de adaptar para ambientes reais (dev/homolog/prod).

### Observações

* Os workflows foram configurados **exclusivamente como demonstração** de pipelines automatizados.
* Todas as execuções são **simulações**, não há provisionamento real de infraestrutura nem publicação de artefatos.
