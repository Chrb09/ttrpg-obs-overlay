![Logo](public/Banner.png)

Ferramenta para mostrar as fichas de personagens de RPG no OBS

### Suporte a:

- Ordem Paranormal (Normal e com Determinação)
- Tormenta
- Mythic Bastionland
- Daggerheart
- Qualquer outro sistema ( Veja seção de sistemas personalizados )

## Como rodar o projeto

É necessario instalar o node.js e npm para rodar o projeto

Após a instalação do node e npm é necessário abrir o terminal e entrar na pasta do projeto

```bash
// instalar dependências
npm i

// iniciar servidor
npm run dev
```

Após isso é só abrir localhost:3000/dashboard no seu navegador para criar e editar as fichas do seu personagem

Para adicionar o overlay das fichas no seu obs é só clicar no botão de copiar da campanha ( para todos os personagens ) ou de um personagem especifico, depois adicione no source de navegador do OBS e ajuste como quiser

## Sistemas Personalizados

Para criar os próprios sistemas você precisa adiciona-lo no arquivo systems.json

```json
"Nome do Sistema": {
    "bg_from_color": "corDeBaixo",
    "bg_to_color": "corDeCima",
    "image_name": "nomeImagem.png",
    "stats": [
      { "name": "Stat com barra", "value": 1, "max": 1, "color": "corBarra" },
      { "name": "Stat sem barra", "value": 1 },
      { "name": "Stat String", "value": "Texto" },
      { "name": "Stat Boolean", "value": false }
    ]
  }
```
