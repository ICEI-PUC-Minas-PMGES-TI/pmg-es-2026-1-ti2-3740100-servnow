### 3.3.1 Processo 1 – Gestão de Clientes

Atualmente, não há uma plataforma centralizada que facilite essa interação, fazendo com que o cliente dependa de indicações informais ou contatos diretos, muitas vezes sem informações suficientes sobre o prestador. Isso gera insegurança, dificuldade na comunicação e falta de visibilidade sobre o andamento do serviço após a contratação.

A oportunidade de melhoria está na implementação de uma jornada digital completa por meio da plataforma. Nela, o cliente poderá criar sua conta, autenticar-se com segurança e ter acesso a uma lista de prestadores disponíveis, com informações relevantes e avaliações.


O processo de gestão de clientes envolve o cadastro e a autenticação do usuário na plataforma, etapas essenciais para garantir o acesso seguro às funcionalidades disponíveis. Por meio desse processo, o cliente consegue acessar seu painel, onde pode visualizar todos os serviços solicitados, acompanhar o status de cada atendimento e gerenciar suas interações dentro da plataforma.



=======
<img width="1350" height="791" alt="image" src="https://github.com/user-attachments/assets/849df7fa-6228-47a4-8d77-05a05cb70c44" />
>>>>>>> f2a6274338d7c39c54c5bf5c1d7eed81191181de

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



