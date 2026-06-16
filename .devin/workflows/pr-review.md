---
description: Analisa uma PR do GitHub, gera respostas prontas para comentários e relatório final
---

# Workflow: /pr-review

Analisa uma Pull Request do GitHub, gera respostas prontas para cada comentário de review, roda validações (lint/typecheck) e produz relatório final.

## Uso

Execute com: `/pr-review #XXX`

Onde `XXX` é o número da PR (ex: `/pr-review #2`).

## Fluxo de execução

1. **Parse do comando** — Extrair número da PR do input
2. **Buscar dados da PR** — Usar GitHub MCP:
   - `get_pull_request` — detalhes básicos
   - `get_pull_request_files` — arquivos modificados
   - `get_pull_request_comments` — comentários de review
   - `get_pull_request_reviews` — revisões gerais
3. **Ler arquivos modificados** — Para cada arquivo alterado, ler conteúdo completo
4. **Ler comentários de review** — Para cada comentário, extrair contexto (arquivo, linha, diff)
5. **Análise de cada comentário**:
   - Verificar validade técnica (negócio, arquitetura, performance, segurança, UX, acessibilidade, manutenibilidade, escalabilidade)
   - Classificar como "Corrigido" ou "Não aplicável"
   - Gerar justificativa técnica
6. **Análise extra** — Buscar código morto, complexidade, duplicação, problemas de performance, re-renders, deps de hooks, tipos any, bugs, acessibilidade, responsividade, violações de padrões
7. **Rodar validações**:
   - `npm run typecheck`
   - `npm run lint`
   - Corrigir falhas automaticamente (quando seguro) ou reportar
8. **Gerar respostas** — Para cada comentário, no formato:

   ```
   ### Comentário
   [texto do comentário]

   ### Análise
   [análise técnica]

   ### Ação
   Corrigido | Não aplicável

   ### Resposta para o Reviewer
   [mensagem profissional pronta para colar no GitHub]
   ```

9. **Gerar relatório final** — Contendo:
   - Resumo das alterações realizadas (na análise)
   - Comentários resolvidos
   - Comentários rejeitados e justificativas
   - Melhorias identificadas fora do escopo da PR
   - Riscos encontrados
   - Sugestões de refatoração futura
10. **Salvar saídas** — Criar arquivo em `/home/gabriel/.windsurf/plans/pr-review-{number}-{timestamp}.md`
11. **Apresentar ao usuário** — Mostrar resumo executivo e caminho do arquivo gerado

## Escopo

- **Apenas análise** — Não implementa correções automaticamente
- Usuário decide se implementa após revisar as respostas e relatório

## Dependências

- GitHub MCP (tools `mcp1_*`)
- Scripts npm: `typecheck`, `lint`
