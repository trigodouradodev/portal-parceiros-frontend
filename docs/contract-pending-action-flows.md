# Fluxos de cobrança e ações pendentes — etapa 5

Branch `feat/contract-pending-action-flows`, baseada em `origin/homolog`.

- Renegociação abre o calendário padrão para informar a data prevista do acordo,
  entre amanhã e D+10. Promessa de pagamento mantém sua janela de hoje a D+10.
  Calendário, resumo e validação compartilham o fluxo de escolha de data. A data
  representa a previsão de fechamento da negociação e é enviada como data civil.
- Trocar o resultado limpa uma data de outro tipo; cancelar sem confirmação deixa
  o resultado sem seleção. O botão não permite registrar sem a data obrigatória.
- O tomador com óbito confirmado fica desabilitado. O avalista vivo é selecionado
  automaticamente, usando seus dados de contato. Sem avalista disponível, o fluxo
  não permite continuar. Registrar um resultado não marca óbito diretamente.
- O lançamento da ação consulta o detalhe atualizado e só aceita pendentes com
  `isCollectible`. O backend continua validando a operação no momento do registro.
- O backend abre a ação pendente na mesma transação da interação e retorna uma
  mensagem sobre o encaminhamento. A tela usa essa mensagem e atualiza fila,
  histórico e permissões de originação. Tarefas que perderam elegibilidade levam
  o parceiro de volta à fila, com uma mensagem legível.

As regras de ausência de tarefa com ação pendente, bloqueios e contagem de atrasadas
são aplicadas pelo backend às listas e contagens. A interface mantém o histórico
das atividades concluídas. Nenhuma data nova é exigida ao encerrar uma ação no
backoffice.

Verificações cobrem os componentes, o hook de registro, payloads, data de São Paulo,
lançamento da tarefa e mensagens de erro. O ensaio completo com frontend, APIs,
migrations e novo job fica para o banco PostgreSQL local ao final, conforme combinado.
