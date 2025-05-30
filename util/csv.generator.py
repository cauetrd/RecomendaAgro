import csv
import random

# Lista de frutos (baseado no cabeçalho do CSV)
FRUTOS = [
    "Abacate", "Abóbora", "Abobrinha", "Acelga", "Alface", "Alho",
    "Batata doce", "Beterraba", "Brócolis", "Cebola", "Cebolinha",
    "Cenoura", "Chuchu", "Coentro", "Couve-flor", "Couve", "Espinafre",
    "Goiaba", "Hortelã", "Inhame", "Limão", "Manjericão", "Maracujá",
    "Milho verde", "Morango", "Pepino", "Pimentão", "Repolho verde",
    "Repolho roxo", "Salsa", "Tangerina", "Tomate", "Vagem", "Banana"
]

def processar_csv(caminho_csv):
    produtores = []
    
    with open(caminho_csv, mode='r', encoding='utf-8') as arquivo:
        leitor = csv.DictReader(arquivo)
        
        for linha in leitor:
            frutos_produzidos = []
            
            # Verifica quais frutos são produzidos (onde o valor é 'True')
            for fruto in FRUTOS:
                if linha[fruto].lower() == 'true':
                    frutos_produzidos.append(fruto)
            
            # Adiciona o produtor à lista
            produtores.append({
                "lat": float(linha["lat"]),
                "lon": float(linha["lon"]),
                "frutos": frutos_produzidos
            })
    
    return produtores

lista_produtores = processar_csv("..\data\produtores.csv")


# Gerar 1000 avaliações
with open('../data/avaliacoes.csv', 'w', newline='') as csvfile:
    writer = csv.writer(csvfile)
    writer.writerow(["id_usuario", "latitude_produtor", "longitude_produtor", "nota","tipo"])
    
    for i in range(1, 5001):
        id_usuario = random.randint(1, 1000)  # 100 usuários únicos
        produtor = random.choice(lista_produtores)
        writer.writerow([
            id_usuario,
            produtor["lat"],
            produtor["lon"],
            random.randint(3, 10),  # nota_atendimento
            "Real"
        ])