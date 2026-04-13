### 3.3.1 Processo 1 – Gestão de Clientes

O processo de gestão de clientes abrange desde o cadastro e autenticação na plataforma até a solicitação e acompanhamento de serviços residenciais. Atualmente, sem um sistema centralizado, o cliente depende de contatos informais e não tem visibilidade sobre o status do seu atendimento.

A oportunidade de melhoria está em oferecer ao cliente uma jornada digital completa: criar sua conta, autenticar-se com segurança, solicitar serviços informando tipo, descrição e localização, e acompanhar em tempo real o status de cada solicitação pelo painel da plataforma ServNow.

<img width="1164" height="658" alt="image" src="https://github.com/user-attachments/assets/905c26b0-7783-428f-953b-c149ff3d49ae" />


---

#### Detalhamento das atividades

Os tipos de dados utilizados nas atividades são:

* **Área de texto** - campo texto de múltiplas linhas
* **Caixa de texto** - campo texto de uma linha
* **Número** - campo numérico
* **Data** - campo do tipo data (dd-mm-aaaa)
* **Hora** - campo do tipo hora (hh:mm:ss)
* **Data e Hora** - campo do tipo data e hora (dd-mm-aaaa, hh:mm:ss)
* **Imagem** - campo contendo uma imagem
* **Seleção única** - campo com várias opções de valores que são mutuamente exclusivas (radio button ou combobox)
* **Seleção múltipla** - campo com várias opções que podem ser selecionadas mutuamente (checkbox ou listbox)
* **Arquivo** - campo de upload de documento
* **Link** - campo que armazena uma URL
* **Tabela** - campo formado por uma matriz de valores

---

## Cadastro

---

**Preencher cadastro**

| **Campo**       | **Tipo**        | **Restrições**                          | **Valor default** |
| ---             | ---             | ---                                     | ---               |
| Nome completo   | Caixa de texto  | mínimo de 10 caracteres                 |                   |
| Telefone        | Caixa de texto  | formato (XX) 00000-0000                 |                   |
| E-mail          | Caixa de texto  | formato de e-mail válido, único         |                   |
| Senha           | Caixa de texto  | mínimo de 8 caracteres                  |                   |

| **Comandos**    | **Destino**                        | **Tipo**  |
| ---             | ---                                | ---       |
| Cadastrar       | Validar dados (sistema)            | default   |
| Cancelar        | Home page                      | cancel    |

---


**Inserir credenciais**

| **Campo** | **Tipo**       | **Restrições**           | **Valor default** |
| ---       | ---            | ---                      | ---               |
| E-mail    | Caixa de texto | formato de e-mail válido |                   |
| Senha     | Caixa de texto | mínimo de 8 caracteres   |                   |

| **Comandos**     | **Destino**                  | **Tipo**  |
| ---              | ---                          | ---       |
| Entrar           | Autenticar (sistema)         | default   |
| Esqueci a senha  | Processo de recuperação      | cancel    |

---


### Configurar perfil do cliente

| Campo                    | Tipo             | Restrições                                      | Valor default |
|--------------------------|------------------|-------------------------------------------------|---------------|
| Endereço                 | Caixa de texto   | logradouro, número, bairro, cidade, CEP         |               |
| Foto de perfil           | Imagem           | JPG ou PNG, máximo de 2 MB                      |               |
| Foto do local (opcional) | Imagem           | JPG ou PNG, máximo de 5 MB                      |               |

| Comandos         | Destino                       | Tipo    |
|------------------|-------------------------------|---------|
| Salvar perfil    | Página inicial do cliente     | default |
| Editar depois    | Painel do cliente             | cancel  |



