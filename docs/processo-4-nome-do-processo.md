### 3.3.4 Processo 4 – EXECUÇÃO DE SERVIÇO
//explicar o problema e melhorias
_Apresente aqui o nome e as oportunidades de melhoria para o processo 4. 
Em seguida, apresente o modelo do processo 4, descrito no padrão BPMN._ 

![Exemplo de um Modelo BPMN do PROCESSO 4](images/process.png "Modelo BPMN do Processo 4.")


#### Detalhamento das atividades

_Descreva aqui cada uma das propriedades das atividades do processo 4. 
Devem estar relacionadas com o modelo de processo apresentado anteriormente._



## Executar Serviço

| **Campo** | **Tipo** | **Restrições** | **Valor default** |
| --- | --- | --- | --- |
| Hora de início | Hora | preenchido automaticamente pelo sistema | — |
| Observações do serviço | Área de texto | máximo de 300 caracteres | |
| Fotos do serviço | Imagem | JPG ou PNG, até 5 imagens, máx. 3 MB cada | |

| **Comandos** | **Destino** | **Tipo** |
| --- | --- | --- |
| Concluir atendimento | Concluir atendimento | default |

---

## Concluir Atendimento

| **Campo** | **Tipo** | **Restrições** | **Valor default** |
| --- | --- | --- | --- |
| Hora de conclusão | Hora | preenchido automaticamente | — |
| Valor final cobrado | Número | valor positivo, em R$ | |
| Método de pagamento | Seleção única | Pix / Cartão / Dinheiro | |
| Confirmação do cliente | Seleção única | "Confirmar conclusão" / "Contestar" | |

| **Comandos** | **Destino** | **Tipo** |
| --- | --- | --- |
| Finalizar atendimento | Registrar avaliação e conclusão (sistema) | default |
| Cancelar conclusão | Executar serviço | cancel |
