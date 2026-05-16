# Receitas++

Aplicativo mobile de receitas inteligentes desenvolvido com React Native, Expo Router e TypeScript.

## Objetivo

O Receitas++ ajuda o usuario a descobrir o que ele realmente consegue cozinhar com base nos ingredientes e nas quantidades disponiveis naquele momento. A proposta foi pensada para um projeto academico de Sistemas Moveis, com foco em utilidade pratica no celular e evolucao gradual da arquitetura.

## Escopo implementado nesta etapa

- FASE 1: limpeza do template Expo e base arquitetural
- FASE 2: modelagem principal com TypeScript
- FASE 3: dados mockados para demonstracao
- FASE 4: autenticacao local simulada e controle de perfil
- FASE 5: telas reais do usuario comum
- FASE 6: filtro inteligente por ingredientes e quantidades

## Tecnologias utilizadas

- React Native
- Expo
- Expo Router
- TypeScript
- AsyncStorage

## Funcionalidades do usuario comum

- Login com conta mockada
- Cadastro local de novo usuario comum
- Sessao persistida em AsyncStorage
- Home com atalhos rapidos
- Busca de receitas por nome
- Filtro de receitas por categoria
- Visualizacao apenas de receitas aprovadas
- Visualizacao de detalhes da receita
- Favoritar e desfavoritar receitas
- Visualizar favoritos
- Visualizar receitas vinculadas ao proprio usuario
- Informar ingredientes disponiveis e suas quantidades
- Receber apenas receitas compativeis com a disponibilidade informada
- Logout pelo perfil

## Funcionalidades do superadmin

- Login com conta mockada de superadmin
- Redirecionamento para area administrativa
- Dashboard inicial com indicadores gerais
- Tela de usuarios cadastrados
- Tela com todas as receitas
- Tela de receitas pendentes
- Tela de relatorios iniciais com categorias e ingredientes

## Regra de negocio principal

Uma receita so e considerada compativel quando:

- todos os ingredientes exigidos pela receita estao presentes na selecao do usuario
- a quantidade disponivel de cada ingrediente e maior ou igual a quantidade exigida

Exemplo:

- se a receita pede `200g` de arroz e o usuario informa `100g`, a receita nao aparece
- se a receita pede arroz e ovo, mas o usuario informa apenas arroz, a receita nao aparece
- se todos os ingredientes existem e todas as quantidades sao suficientes, a receita aparece

## Estrutura de pastas

```text
app/
  _layout.tsx
  index.tsx
  login.tsx
  cadastro.tsx
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
```

## Dados mockados incluidos

Usuarios:

- usuario comum principal
- superadmin
- usuario adicional

Ingredientes:

- arroz
- feijao
- ovo
- leite
- farinha
- tomate
- queijo
- frango
- macarrao
- acucar
- sal
- oleo

Receitas:

- receitas aprovadas para busca e filtro inteligente
- receitas pendentes para o fluxo administrativo
- receita rejeitada para compor os cenarios de moderacao

## Contas de teste

Usuario comum:

- E-mail: `ana@receitaspp.com`
- Senha: `123456`

Superadmin:

- E-mail: `admin@receitaspp.com`
- Senha: `admin123`

## Como instalar

```bash
npm install
```

## Como executar

```bash
npm start
npm run android
npm run ios
npm run web
```

## Como validar o fluxo atual

1. Abra o app e entre com a conta comum `ana@receitaspp.com / 123456`.
2. Na home, use `Buscar receitas` para filtrar por nome ou categoria.
3. Abra `Informar ingredientes`, selecione ingredientes, informe as quantidades e toque em `Encontrar receitas possiveis`.
4. Confira a tela de resultados e abra o detalhe de uma receita compativel.
5. Acesse `Perfil` e use `Sair` para testar o logout.
6. Entre com a conta `admin@receitaspp.com / admin123` para validar o redirecionamento ao dashboard admin.

## Verificacao de tipos

```bash
npx tsc --noEmit
```

## Status do projeto

O projeto ja deixou de ser um template Expo e passou a ter fluxo funcional minimo para demonstracao academica. Ainda faltam fases futuras, como cadastro completo de receitas pelo usuario, aprovacao com acoes administrativas completas e maior profundidade em relatorios.

## Relatorio do que foi implementado ate agora

Nesta etapa, o projeto Receitas++ saiu de uma base generica do Expo Router e passou a ter um fluxo funcional minimo alinhado ao objetivo do trabalho. A arquitetura foi reorganizada em `app/` e `src/`, com separacao entre componentes, hooks, services, tipos, mocks, tema e utilitarios.

No fluxo publico e autenticado, foram implementadas:

- tela inicial real do app
- tela de login funcional
- tela de cadastro funcional para usuario comum
- persistencia local de sessao com AsyncStorage
- redirecionamento por perfil entre usuario comum e superadmin
- protecao basica de rotas por layout

No fluxo do usuario comum, foram implementadas:

- home com atalhos rapidos
- busca de receitas por nome
- filtro por categoria
- listagem apenas de receitas aprovadas
- tela de detalhe da receita
- favoritos por usuario
- perfil com logout
- tela de ingredientes com informacao de quantidades
- tela de resultados baseada no filtro inteligente

Na regra central do projeto, foram implementadas:

- comparacao entre ingredientes exigidos e ingredientes disponiveis
- comparacao entre quantidade exigida e quantidade disponivel
- retorno apenas de receitas totalmente compativeis
- mensagens vazias quando nao ha busca ou nao ha receitas possiveis
- centralizacao da logica principal em `src/utils/recipeCompatibility.ts`

No fluxo administrativo inicial, foram implementadas:

- login com conta superadmin mockada
- redirecionamento para area administrativa
- dashboard inicial com indicadores
- listagem de usuarios cadastrados
- listagem geral de receitas
- fila de receitas pendentes
- relatorios iniciais com categorias e ingredientes

## Pontos de atencao no projeto atual

- A autenticacao ainda e simulada e local. Ela atende bem ao objetivo academico atual, mas nao substitui backend real, hash de senha, token ou controle de sessao de producao.
- As receitas ainda sao baseadas em mocks estaticos. O cadastro completo de novas receitas pelo usuario e a moderacao admin com edicao, aprovacao e remocao ainda precisam ser aprofundados nas proximas fases.
- O painel do superadmin ja existe, mas ainda esta em nivel inicial. Ele mostra dados e listas, porem ainda nao executa todas as acoes administrativas previstas no escopo final.
- A tela `nova-receita` continua como placeholder arquitetural e ainda nao representa o fluxo final de submissao.
- O projeto ainda nao passou por validacao completa em emulador/dispositivo para UX fina, apenas por revisao estrutural e checagem de TypeScript.
- Existe um diretorio antigo de teste em `components/__tests__`, mas o projeto ainda nao possui uma suite de testes configurada de fato. Isso merece alinhamento futuro para evitar falsa impressao de cobertura.
- O historico de buscas e a persistencia local ja foram preparados, mas o uso analitico desses dados ainda e simples nesta etapa.

## Observacoes

- A autenticacao desta etapa e local e simulada, adequada para demonstracao e testes academicos.
- Sessao, favoritos e historico simples de buscas sao persistidos via AsyncStorage.
- A arquitetura foi preparada para futura integracao com backend real sem concentrar regra de negocio nas telas.
