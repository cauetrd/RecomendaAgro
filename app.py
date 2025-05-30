from flask import Flask, render_template
import pandas as pd
from flask import request, jsonify
from sklearn.neighbors import NearestNeighbors
import numpy as np

app = Flask(__name__)

df = pd.read_csv("data/produtores.csv")  # Needs Latitude, Longitude, MarketName
avdf = pd.read_csv("data/avaliacoes.csv")  # Needs UserID, Latitude, Longitude, Rating
@app.route("/")
def index():
    locations = df[["Nome", "lat", "lon", "Sigla"]].dropna().to_dict(orient="records")
    producers = merge_producers_avg_rating()
    avaliacoes = avdf[["id_usuario", "latitude_produtor", "longitude_produtor", "nota", "tipo"]].dropna().to_dict(orient="records") 
    return render_template("index.html", locations=locations, producers=producers, avaliacoes=avaliacoes)

def merge_producers_avg_rating():
    """
    Calcula a média de avaliações dos produtores e acrescenta ao DataFrame original.
    """
    avg_ratings = avdf.groupby(['latitude_produtor', 'longitude_produtor']).agg({'nota': 'mean'}).reset_index()
    avg_ratings = avg_ratings.rename(columns={
        'latitude_produtor': 'lat',
        'longitude_produtor': 'lon',
        'nota': 'media_atendimento'
    })
    
    # Merge with producer data to get names
    merged = pd.merge(df, avg_ratings, on=['lat', 'lon'], how='left')
    
    return merged.to_dict(orient='records')


def save_knn_recommendations(user_id, recommendations):
    """
    Salva as recomendações de KNN em um arquivo CSV.
    """
    filename = f"data/avaliacoes.csv"
    df_recommendations = pd.DataFrame([{
        "id_usuario": user_id,
        "latitude_produtor": rec['latitude_produtor'],
        "longitude_produtor": rec['longitude_produtor'],
        "nota": rec['media_nota'],
        "tipo": "KNN"
    } for rec in recommendations])

    df_recommendations.to_csv(filename, mode="a",header=False, index=False)


def knn_user_producer_similarity(user_id, n_neighbors=5):
    ratings_matrix = avdf.pivot_table(
        index='id_usuario',
        columns=['latitude_produtor', 'longitude_produtor'],
        values='nota'
    ).fillna(0)

    if user_id not in ratings_matrix.index:
        return []

    user_vector = ratings_matrix.loc[user_id].values.reshape(1, -1)

    knn = NearestNeighbors(n_neighbors=n_neighbors + 1, metric='euclidean')
    knn.fit(ratings_matrix.values)
    distances, indices = knn.kneighbors(user_vector)

    neighbor_indices = [i for i in indices[0] if ratings_matrix.index[i] != user_id][:n_neighbors]
    similar_users = ratings_matrix.index[neighbor_indices]

    # Avaliações dos vizinhos
    similar_avaliacoes = avdf[avdf['id_usuario'].isin(similar_users)]

    # Produtores que o usuário atual já avaliou
    user_producers = avdf[avdf['id_usuario'] == user_id][["latitude_produtor", "longitude_produtor"]]
    user_producers_set = set([tuple(x) for x in user_producers.values])

    # Agrupa as avaliações dos vizinhos por produtor
    grouped = similar_avaliacoes.groupby(["latitude_produtor", "longitude_produtor"])["nota"].mean().reset_index()
    grouped.rename(columns={"nota": "media_nota"}, inplace=True)

    # Remove produtores já avaliados pelo usuário
    grouped = grouped[~grouped.apply(lambda row: (row.latitude_produtor, row.longitude_produtor) in user_producers_set, axis=1)]

    # (Opcional) Ordenar por nota descendente
    grouped = grouped.sort_values(by="media_nota", ascending=False)

    return grouped.to_dict(orient="records")


@app.route("/api/knn_user", methods=["POST"])
def api_knn_user():
    data = request.get_json()
    user_id = data.get("id_usuario")
    n = data.get("n", 5)
    if user_id is None :
        return jsonify({"error": "id_usuario required"}), 400
    result = knn_user_producer_similarity(user_id,  n_neighbors=n)
    print(result)
    print(len(result))
    save_knn_recommendations(user_id, result)
    # Get all user evaluations from avaliacoes.csv
    avdf = pd.read_csv("data/avaliacoes.csv")
    user_avaliacoes = avdf[avdf["id_usuario"] == user_id].to_dict(orient="records")
    return jsonify(user_avaliacoes)


if __name__ == "__main__":
    app.run(debug=True)
