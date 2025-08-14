# Infraestrutura – Prova de Conceito (Exemplo com Terraform)

Prova de conceito de **provisionamento seguro e reutilizável** de uma instância EC2 na AWS utilizando **Terraform**, seguindo **boas práticas de automação de infraestrutura**.
O objetivo é demonstrar organização, modularidade e clareza no código para um cenário de teste técnico.

### Destaques Técnicos

* Estrutura **modular** e de fácil manutenção, permitindo **parametrização** de variáveis como região, tipo de instância e chave SSH
* Compatível com **pipelines de CI/CD** via **GitHub Actions** (exemplo no diretório `.github/workflows`)
* Código comentado para facilitar entendimento e reaproveitamento

### Observações

* Este código **não será executado neste teste**, seu objetivo é exclusivamente demonstrar uma possível abordagem de automação de infraestrutura, com foco em **padrões e organização**.
* Pode ser facilmente adaptado para ambientes reais de desenvolvimento, homologação ou produção.

### Passos para Aplicar (em um ambiente real)

```bash
cd infra/terraform
terraform init
terraform plan
terraform apply
```

### Passos para Destruir Recursos

```bash
cd infra/terraform
terraform destroy
```


