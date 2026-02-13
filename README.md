# Portifolio - Deploy e Envio de Mensagens

Guia rapido para publicar o portfolio e fazer o formulario de contato enviar e-mail.

## 1) Pre-requisitos

- Conta no Netlify
- Conta no Resend
- Git instalado
- (Opcional para testes locais) Node.js + Netlify CLI

## 2) Configurar o Resend

1. Crie uma API Key no Resend.
2. Defina o e-mail de destino (quem vai receber os contatos).
3. Defina um remetente valido:
   - Em producao, use um dominio verificado no Resend.
   - Exemplo: `Portfolio <contato@seudominio.com>`

## 3) Variaveis de ambiente

Use estas chaves:

- `RESEND_API_KEY`
- `CONTACT_TO_EMAIL`
- `CONTACT_FROM_EMAIL`
- `CONTACT_AUTOREPLY_ENABLED` (`true` ou `false`)

### No Netlify (producao)

1. Abra o site no Netlify.
2. Va em `Site settings > Environment variables`.
3. Adicione todas as variaveis acima.
4. Rode um novo deploy.

### Local (teste)

Voce pode criar um arquivo `.env` na raiz com os mesmos campos do `.env.example`.

## 4) Como subir o portfolio no Netlify

Este projeto ja esta preparado com:

- `netlify.toml` com `publish = ".vscode"`
- Funcoes em `netlify/functions`
- Endpoint de formulario em `/api/contact`

### Opcao A (recomendada): GitHub + Netlify

1. Suba o projeto para o GitHub.
2. No Netlify, clique em `Add new site` e conecte ao repositorio.
3. Confirme as configs (o `netlify.toml` ja cuida disso).
4. Deploy.

### Opcao B: Netlify CLI

```bash
netlify login
netlify deploy --prod --dir=.vscode --functions=netlify/functions
```

## 5) Testar localmente com funcoes (importante)

Nao use apenas Live Server para testar envio do formulario.
Para a rota `/api/contact` funcionar localmente, rode:

```bash
netlify dev
```

Depois abra a URL mostrada no terminal (normalmente `http://localhost:8888`).

## 6) Fluxo esperado do formulario

1. Usuario envia o formulario em `index.html`.
2. Front-end faz `POST` para `/api/contact`.
3. Funcao `netlify/functions/contact.js` envia o e-mail via Resend.
4. Em sucesso, o front redireciona para `obrigado.html`.

## 7) Checklist rapido de validacao

- Site publicado abre normalmente.
- Menu mobile e animacoes funcionando.
- Formulario envia sem erro no console.
- Redireciona para `obrigado.html`.
- E-mail chega em `CONTACT_TO_EMAIL`.

## 8) Erros comuns

- `404 /api/contact`:
  - Voce esta rodando fora do Netlify (ex.: Live Server puro).
  - Solucao: usar `netlify dev` local ou testar no dominio do Netlify.

- `500 Email service not configured`:
  - `RESEND_API_KEY` ausente/invalida.

- `502 Falha ao enviar email`:
  - Problema no remetente (`CONTACT_FROM_EMAIL`) ou no Resend.

- Nao redireciona para pagina de obrigado:
  - A requisicao nao retornou `200`.
  - Verifique `Network` no DevTools e logs da funcao no Netlify.

## 9) Arquivos principais deste projeto

- `netlify.toml`
- `netlify/functions/contact.js`
- `.vscode/index.html`
- `.vscode/obrigado.html`
- `.vscode/js/script.js`

