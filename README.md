# Receitas++

Aplicativo mobile de receitas inteligentes desenvolvido para a disciplina de Sistemas Móveis. O projeto ajuda o usuário a descobrir quais receitas realmente pode preparar com base nos ingredientes e nas quantidades disponíveis, além de incluir um fluxo administrativo para moderação de receitas enviadas por usuários comuns.

## Visão geral

O projeto é dividido em duas partes:

- `frontend mobile` em React Native com Expo Router
- `backend API` em Node.js, Express, TypeORM e SQLite

O app possui autenticação, persistência local de sessão e favoritos, catálogo de receitas, filtro por compatibilidade de ingredientes e uma área administrativa com dashboard, relatórios e fila de aprovação.

## Principais funcionalidades

### Usuário comum

- login, cadastro e redefinição de senha
- sessão persistida localmente com `AsyncStorage`
- busca de receitas por nome
- filtro por categoria
- visualização de receitas aprovadas
- tela de detalhes da receita
- favoritos persistidos localmente por usuário
- visualização das próprias receitas
- cadastro de novas receitas com envio para aprovação
- filtro inteligente por ingredientes e quantidades
- acesso parcial offline para sessão restaurada e favoritos já salvos

### Superadmin

- acesso separado por perfil
- dashboard com indicadores gerais
- listagem de usuários
- listagem completa de receitas
- fila de aprovações
- moderação de status `pending`, `approved` e `rejected`
- relatórios por categoria, autor e status

## Regra de negócio central

Uma receita só aparece como compatível quando todos os ingredientes exigidos estão presentes e cada quantidade informada pelo usuário é suficiente para atender à quantidade pedida pela receita.

Exemplos:

- se a receita exige `200g` de arroz e o usuário informa `100g`, ela não é considerada possível
- se a receita exige arroz e ovo, mas o usuário informa apenas arroz, ela também não aparece
- a receita só entra no resultado quando todos os ingredientes e quantidades forem atendidos

## Stack utilizada

### Frontend

- React Native
- Expo
- Expo Router
- TypeScript
- React Navigation
- AsyncStorage
- React Native Safe Area Context
- React Native Reanimated

### Backend

- Node.js
- Express
- TypeORM
- SQLite com `better-sqlite3`
- JWT
- bcrypt

## Estrutura do projeto

```text
ReceitasPP/
  app/
    _layout.tsx
    index.tsx
    login.tsx
    cadastro.tsx
    esqueci-senha.tsx
    +not-found.tsx
    (user)/
      _layout.tsx
      home.tsx
      buscar.tsx
      ingredientes.tsx
      resultados.tsx
      favoritos.tsx
      minhas-receitas.tsx
      nova-receita.tsx
      perfil.tsx
      receita/[id].tsx
    (admin)/
      _layout.tsx
      dashboard.tsx
      usuarios.tsx
      receitas.tsx
      aprovacoes.tsx
      relatorios.tsx
  src/
    components/
    data/
    features/
    hooks/
    services/
    theme/
    types/
    utils/
  backend/
    entity/
    data-source.js
    server.js
    package.json
```

## Seed inicial

Ao iniciar o backend, o projeto garante uma base inicial com:

- usuários comuns e superadmin
- catálogo ampliado de ingredientes culinários
- receitas aprovadas, pendentes e rejeitadas
- novas receitas pendentes distribuídas entre usuários comuns existentes

As receitas submetidas por usuários comuns entram com status `pending` para aprovação do superadmin.

## Contas de teste

### Superadmin

- e-mail: `admin@receitaspp.com`
- senha: `admin123`

### Usuários comuns

- `ana@receitaspp.com` / `123456`
- `bruna@receitaspp.com` / `123456`
- `pedro@unileste.com` / `123456`

## Pré-requisitos

- Node.js 18+ ou superior
- npm
- Expo Go ou emulador Android/iOS

## Como executar

### 1. Instalar dependências do app mobile

```bash
npm install
```

### 2. Instalar dependências do backend

```bash
cd backend
npm install
```

### 3. Iniciar o backend

Ainda dentro da pasta `backend`:

```bash
node server.js
```

O backend sobe por padrão em:

```text
http://127.0.0.1:3069
```

### 4. Iniciar o app Expo

Em outro terminal, na raiz do projeto:

```bash
npm start
```

Comandos úteis:

```bash
npm run android
npm run ios
npm run web
```

## Configuração da API

O app tenta descobrir automaticamente a URL do backend durante o desenvolvimento com base no ambiente do Expo. Se necessário, você também pode definir manualmente:

```bash
EXPO_PUBLIC_API_URL=http://SEU_IP:3069
```

Isso é útil quando o app estiver rodando em dispositivo físico e o backend em outra máquina da mesma rede.

## Fluxo sugerido para validação

1. Inicie o backend.
2. Inicie o app com Expo.
3. Faça login com um usuário comum.
4. Busque receitas por nome ou categoria.
5. Abra a tela de ingredientes, informe quantidades e valide o filtro inteligente.
6. Favorite receitas e confira a persistência local.
7. Cadastre uma nova receita e verifique que ela entra como `pending`.
8. Faça login como superadmin.
9. Abra a tela de aprovações e valide a moderação da receita enviada.

## Recursos nativos utilizados

O projeto não utiliza câmera, GPS nem notificações push. Os recursos nativos mais relevantes são:

- `AsyncStorage` para sessão, usuário salvo, favoritos e persistência local de apoio
- `SafeAreaProvider`, `SafeAreaView` e `useSafeAreaInsets` para adaptação da interface ao dispositivo
- `StatusBar` para integração visual com o sistema
- `useColorScheme` para seguir tema claro/escuro do aparelho
- `Platform` e `expo-constants` para ajustar a URL da API conforme o ambiente

O suporte offline é parcial: o app consegue restaurar sessão salva em falhas de rede e reabrir favoritos previamente armazenados, mas não oferece acesso offline completo ao catálogo nem ao painel administrativo.

## Endpoints principais da API

- `POST /login`
- `POST /register`
- `POST /auth/reset-password`
- `GET /auth/me`
- `GET /receitas`
- `GET /receitas/:id`
- `POST /receitas`
- `PUT /receitas/:id`
- `PUT /receitas/:id/ingredientes`
- `GET /ingredientes`
- `GET /admin/users`
- `GET /admin/recipes`
- `PATCH /admin/recipes/:id/status`
- `GET /admin/dashboard`
- `GET /admin/reports`

## Verificação de tipos

Na raiz do projeto:

```bash
npm run typecheck
```

## Status do projeto

O projeto já possui fluxo funcional de ponta a ponta com frontend mobile e backend real, incluindo autenticação, cadastro de receitas, persistência local, filtro inteligente e moderação administrativa. Ainda assim, ele continua sendo um projeto acadêmico em evolução, com espaço para melhorias como testes automatizados, refinamento de UX, upload de imagens e endurecimento de segurança para produção.

## Possíveis evoluções

- testes automatizados no frontend e backend
- paginação e filtros mais avançados no painel admin
- upload de imagem para receitas
- melhorias no modo offline
- edição mais completa de receitas
- métricas e relatórios mais detalhados

## Autores

- Caetano Souza Rocha Louzada
- Carlos Eduardo Felipe Andrade
- Leonna Tomás Viegas

Projeto acadêmico desenvolvido para a disciplina de Sistemas Móveis.
