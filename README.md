# 🚀 Gerenciador de Estudantes e Projetos (CLI)

Uma aplicação de linha de comando (CLI) construída com Node.js, TypeScript e Prisma para gerenciar um cadastro de estudantes e seus respectivos projetos, utilizando MongoDB como banco de dados.

---

## ⚙️ Tecnologias

Este projeto foi desenvolvido com as seguintes tecnologias:

- [Node.js](https://nodejs.org/en/)
- [TypeScript](https://www.typescriptlang.org/)
- [Prisma](https://www.prisma.io/) - ORM para acesso ao banco de dados.
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) - Banco de dados NoSQL na nuvem.

---

## ✨ Funcionalidades

- **➕ Adicionar** novos estudantes e seus projetos via interface de linha de comando.
- **🔄 Atualizar** dados de estudantes existentes.
- **❌ Remover** estudantes e todos os seus projetos de forma segura (usando transações).
- **📋 Listar** todos os estudantes cadastrados.
- **👁️ Visualizar** e gerenciar os dados de forma gráfica com o Prisma Studio.

---

## 📂 Estrutura do Projeto

```

/prisma-mongodb-ts-cli
├── prisma/
│   └── schema.prisma       # Define os modelos de dados e a conexão com o banco
├── src/
│   └── index.ts            # Ponto de entrada da aplicação e lógica da CLI
├── .env                    # Armazena a string de conexão do MongoDB (deve ser criado)
├── .gitignore              # Ignora arquivos como node_modules e .env
├── README.md               # Este arquivo
├── package.json            # Dependências e scripts do projeto
└── tsconfig.json           # Configurações do compilador TypeScript

```

---

## 📥 Instalação e Configuração

```bash
# 1. Clone este repositório
git clone [https://github.com/ferreiraryan/prisma-mongodb-ts-cli/](https://github.com/ferreiraryan/prisma-mongodb-ts-cli/) 

# 2. Acesse o diretório
cd prisma-mongodb-ts-cli

# 3. Instale as dependências
npm install

# 4. Configure as Variáveis de Ambiente
# Crie um arquivo chamado .env na raiz do projeto e adicione sua string de conexão do MongoDB Atlas.
# DATABASE_URL="mongodb+srv://<user>:<password>@cluster.mongodb.net/<database_name>?retryWrites=true&w=majority"

# 5. Gere o Prisma Client
npx prisma generate

# 6. Execute o projeto
npm run start
```

---


## 🤝 Contribuindo

Sinta-se à vontade para contribuir! Basta seguir os passos abaixo:

1. Faça um **fork** do projeto.
2. Crie uma **branch** com a sua feature: `git checkout -b minha-feature`
3. Faça **commit** das suas alterações: `git commit -m 'Adiciona nova feature'`
4. Envie para o GitHub: `git push origin minha-feature`
5. Abra um **Pull Request**

---

## 📬 Contato

- **Ryan Ferreira** - [ryanferreira4883@gmail.com](mailto:ryanferreira4883@gmail.com)
- **GitHub** - [https://github.com/ferreiraryan](https://github.com/ferreiraryan)
- **LinkedIn** - [https://www.linkedin.com/in/ferryan/](https://www.linkedin.com/in/ferryan/)

---
