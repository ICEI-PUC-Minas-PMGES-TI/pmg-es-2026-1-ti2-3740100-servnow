### 3.3.4 Processo 4 – EXECUÇÃO DE SERVIÇO
//explicar o problema e melhorias

Oportunidades de melhoria:

Registro fotográfico obrigatório  ausência de documentação visual antes/depois do serviço, expondo ambas as partes em contestações.

Subprocesso de pagamento inexistente método registrado, mas sem confirmação de recebimento nem tratamento de falha.

Ausência de notificações, o cliente não recebe comunicação entre abertura do serviço e cobrança final.

Modelo BPMN do Processo 4 [EXECUÇÃO DE SERVIÇO](<EXECUÇÃO DE SERVIÇO.png>) 


#### Detalhamento das atividades


---

## 1-Solicitar início do atendimento

### Campos

| Campo                  | Tipo   | Restrições                                              | Valor Default |
|------------------------|--------|---------------------------------------------------------|--------------|
| Código de verificação  | Número | 6 dígitos, gerado automaticamente, válido por 10 minutos | —            |

### Comandos

| Comando           | Destino                         | Tipo    |
|------------------|----------------------------------|---------|
| Confirmar chegada | Gerar e enviar código ao cliente | default |
| Cancelar          | Cancelar atendimento             | cancel  |

---

## 2-Inserir código de verificação

### Campos

| Campo                        | Tipo   | Restrições                              | Valor Default |
|-----------------------------|--------|-----------------------------------------|--------------|
| Código informado pelo cliente | Número | 6 dígitos, obrigatório                  | —            |
| Tentativas realizadas        | Número | Preenchido automaticamente, máximo 3    | —            |

### Comandos

| Comando         | Destino                     | Tipo    |
|----------------|-----------------------------|---------|
| Validar código | Gateway "Código válido?"    | default |
| Reenviar código | Gerar novo código ao cliente | default |

---

##  3- Executar serviço

### Campos

| Campo                    | Tipo    | Restrições                                              | Valor Default |
|--------------------------|---------|---------------------------------------------------------|--------------|
| Hora de início           | Hora    | Preenchido automaticamente pelo sistema                 | —            |
| Fotos do estado inicial  | Imagem  | JPG/PNG, até 5 imagens, máx. 3MB cada                  | —            |
| Observações do serviço   | Texto   | Máximo de 300 caracteres                                | —            |
| Fotos do estado final    | Imagem  | JPG/PNG, até 5 imagens, máx. 3MB cada                  | —            |

### Comandos

| Comando            | Destino               | Tipo    |
|--------------------|------------------------|---------|
| Concluir execução  | Concluir atendimento   | default |

---

##  4- Concluir atendimento

### Campos

| Campo                 | Tipo    | Restrições                      | Valor Default |
|------------------------|---------|--------------------------------|--------------|
| Hora de conclusão      | Hora    | Preenchido automaticamente     | —            |
| Valor final cobrado    | Número  | Valor positivo (R$)            | —            |
| Método de pagamento    | Seleção | Pix / Cartão / Dinheiro        | —            |

### Comandos

| Comando                    | Destino              | Tipo    |
|---------------------------|----------------------|---------|
| Enviar cobrança ao cliente | Notificar cliente    | default |
| Cancelar conclusão         | Executar serviço     | cancel  |

---

## 5- Confirmar presença e fornecer código

### Campos

| Campo                 | Tipo   | Restrições                 | Valor Default |
|----------------------|--------|----------------------------|--------------|
| Nome do prestador    | Texto  | Somente leitura            | Automático   |
| Serviço contratado   | Texto  | Somente leitura            | Automático   |
| Código de verificação| Número | 6 dígitos, obrigatório     | —            |

### Comandos

| Comando                   | Destino                         | Tipo    |
|---------------------------|----------------------------------|---------|
| Confirmar e enviar código | Prestador insere código         | default |
| Recusar presença          | Cancelar atendimento            | cancel  |

---

##  6-Revisar serviço executado

### Campos

| Campo                   | Tipo    | Restrições        | Valor Default |
|--------------------------|---------|-------------------|--------------|
| Fotos do estado inicial  | Imagem  | Somente leitura   | —            |
| Fotos do estado final    | Imagem  | Somente leitura   | —            |
| Observações do prestador | Texto   | Somente leitura   | —            |
| Valor cobrado            | Número  | Somente leitura   | —            |

### Comandos

| Comando            | Destino                           | Tipo    |
|--------------------|------------------------------------|---------|
| Aceitar e pagar    | Processar pagamento                | default |
| Contestar valor    | Notificar prestador                | cancel  |

---

##  7- Processar pagamento

### Campos

| Campo                | Tipo    | Restrições                   | Valor Default            |
|---------------------|---------|------------------------------|--------------------------|
| Método de pagamento | Seleção | Pix / Cartão / Dinheiro      | —                        |
| Valor a pagar       | Número  | Somente leitura              | —                        |
| Status do pagamento | Texto   | Preenchido automaticamente   | Aguardando confirmação   |

### Comandos

| Comando             | Destino                                 | Tipo    |
|---------------------|------------------------------------------|---------|
| Confirmar pagamento | Emitir comprovante e encerrar OS         | default |
| Tentar novamente    | Selecionar método de pagamento           | default |
| Cancelar            | Revisar serviço executado                | cancel  |

---

##  8- Avaliar atendimento

### Campos

| Campo               | Tipo     | Restrições                           | Valor Default |
|---------------------|----------|--------------------------------------|--------------|
| Nota                | Seleção  | 1 a 5 estrelas, obrigatório          | —            |
| Comentário          | Texto    | Máx. 200 caracteres, opcional        | —            |
| Prazo para avaliação| Hora     | Até 48h após encerramento da OS      | —            |

### Comandos

| Comando            | Destino                                   | Tipo    |
|--------------------|--------------------------------------------|---------|
| Enviar avaliação   | Registrar e atualizar reputação            | default |
| Pular avaliação    | Registrar OS sem avaliação                 | cancel  |

---
