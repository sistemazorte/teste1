# 🚚 Zorte - Gestão de Motoristas

Sistema web para gerenciamento de motoristas, permitindo cadastrar, editar, ativar, inativar e excluir registros.

A aplicação foi desenvolvida utilizando **Laravel no backend** e **React + TypeScript no frontend**, com comunicação através de **API REST**.

---

## 🎯 Sobre o Projeto

O sistema permite o controle completo de motoristas cadastrados em uma transportadora, incluindo validações de dados e gerenciamento do status de cada motorista.

A interface permite realizar buscas e filtros, facilitando a administração dos registros.

---

## ✨ Funcionalidades Implementadas

### 🚛 Gerenciamento de Motoristas (CRUD Completo)

- Criar motorista  
- Listar motoristas  
- Editar motorista  
- Excluir motoristas inativos  

### 📊 Campos do motorista

- Nome completo
- CPF (único)
- Categoria da CNH (A, B, C, D, E)
- Telefone (opcional)
- Status do motorista (Ativo / Inativo)

### 🔄 Controle de Status

- Ativar motorista
- Inativar motorista
- Exclusão permitida apenas para motoristas inativos

### 🔍 Busca e Filtros

- Busca por nome, CPF ou telefone
- Filtro por status (Todos, Ativos, Inativos)

### ⚠️ Validações

- CPF obrigatório
- CPF único
- Categoria da CNH obrigatória
- Validação de telefone

---

## 🚀 Tecnologias

### Backend
- PHP 8.2+
- Laravel 12
- API REST

### Frontend
- React
- TypeScript
- TailwindCSS
- Vite

---

## 📦 Pré-requisitos

Antes de rodar o projeto é necessário ter instalado:

- PHP 8.2 ou superior
- Composer
- Node.js
- NPM
- Git

---

## 🛠️ Instalação

### 1️⃣ Clonar o projeto


git clone https://github.com/gustavooxp/zorte.git


Entre na pasta do projeto:


cd zorte


---

### 2️⃣ Instalar dependências

Backend:


composer install


Frontend:


npm install


---

### 3️⃣ Configurar ambiente

Crie o arquivo `.env` baseado no `.env.example`


cp .env.example .env


Gerar chave da aplicação:


php artisan key:generate


Configure o banco de dados no arquivo `.env`.

---

### 4️⃣ Banco de dados

Execute as migrations:


php artisan migrate


---

## ▶️ Executar a Aplicação

### Backend


php -S 127.0.0.1:8080 -t public


### Frontend

Em outro terminal execute:


npm run dev


---

## 🌐 Acesso

Abra no navegador:


http://127.0.0.1:8080


A aplicação será carregada diretamente na página de gerenciamento de motoristas.


---

## 👩‍💻 Autor

Gustavo Miranda
Projeto desenvolvido para **Teste Técnico – Estágio**.
