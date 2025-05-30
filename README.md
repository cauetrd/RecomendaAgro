# RecomendaAgro

RecomendaAgro é um sistema web para recomendação de produtores locais de alimentos, desenvolvido como Trabalho 1 da disciplina IIA.

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

## Formas de filtragem

-

## Observações

- O sistema utiliza geolocalização do navegador para mostrar produtores próximos.
- As recomendações de IA são feitas via `/api/knn_user`.
- Para testar recomendações, altere o `id_usuario` no frontend ou envie POST manualmente.

---

Desenvolvido para fins acadêmicos.
