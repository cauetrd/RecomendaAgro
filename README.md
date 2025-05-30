# RecomendaAgro

RecomendaAgro é um sistema web para recomendação de produtores locais de alimentos, desenvolvido como Trabalho 1 da disciplina IIA.
Link para o repositório: https://github.com/cauetrd/RecomendaAgro

## Funcionalidades

- Visualização de produtores locais em um mapa interativo (Leaflet/OpenStreetMap)
- Filtro de produtores por produtos disponíveis
- Ordenação por qualidade de atendimento, distância ou ambos
- Recomendação inteligente baseada em avaliações de usuários (KNN)
- Avaliações de produtores por usuários

## Tecnologias Utilizadas

- Python 3
- Flask (backend web)
- Pandas, scikit-learn, numpy (processamento de dados e KNN)
- HTML, CSS, JavaScript (frontend)
- Leaflet.js (mapa)
- OpenStreetMap (tiles)

## Estrutura do Projeto

- `app.py`: Backend Flask, rotas e lógica de recomendação
- `templates/index.html`: Página principal
- `static/script.js`: Scripts JS para interação e mapa
- `data/produtores.csv`: Dados dos produtores
- `data/avaliacoes.csv`: Avaliações dos usuários
- `data/produtos.csv`: Lista de produtos
- `util/csv.generator.py`: Utilitário para geração de CSV

## Como Rodar o Projeto

1. Instale as dependências Python:
   ```powershell
   pip install flask pandas scikit-learn numpy
   ```
2. Certifique-se de que os arquivos CSV estejam na pasta `data/`.
3. Execute o servidor Flask:
   ```powershell
   python app.py
   ```
4. Acesse `http://127.0.0.1:5000` no navegador.
5. Para reiniciar a base de dados, certifique-se que esteja no caminho `/util` e execute o arquivo:
   ```powershell
   python csv.generator.py
   ```

## Explicação de Funcionalidades

- Obtenção das Coordenadas do Usuário

- - Tenta-se obter a geolocalização do usuário através do navegador

- - Caso não seja possível obter a geolocalização do usuário, é assumido que o usuário esteja no prédio de CIC/EST na Universidade de Brasília

- Cálculo de Distância

- - O cálculo de distância entre a localização do usuário e cada produtor é feita utilizando a fórmula de Harvesine.

- - A distância calculada é cada objeto da lista de objetos da lista de produtores.

- Filtragens

- - O usuário seleciona quais produtos deseja adquirir.

- - O usuário seleciona qual a distância máxima entre ele e os possíveis produtores.

- - São filtrados os produtores para que apareçam apenas os que estão dentro da distância permitida e vendem os produtos desejados pelo usuário.

- - O usuário escolhe como deseja ordenar a lista de produtores, por distância, por nota média do produtor, ou por uma ordenação inteligente

- - - A ordenação inteligente usa uma fórmula para ordenar os produtores buscando relacionar distância e nota média, tentando minimizar distância e maximizar nota média.

- Recomendação com IA

- - A recomendação de IA é feita por meio do algoritmo de KNN, com rota própria.

- - O algoritmo de KNN busca outros usuários com avaliações parecidas à do usuário e utiliza essas avaliações para prever qual nota o usuário daria para produtores ainda não avaliados.

## Observações

- O id de usuário escolhido como mock é o id 3.
- As recomendações de IA são feitas via `/api/knn_user`.
- Para testar recomendações, altere o `id_usuario` no frontend ou envie POST manualmente.

---

Desenvolvido para fins acadêmicos.
Cauê de Macedo Britto Trindade de Sousa - 231019003
