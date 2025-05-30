// Inicia o mapa centralizado temporariamente em Brasília
var map = L.map("map").setView([-15.7939, -47.8828], 10);

// OpenStreetMap tiles
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

// Atualiza o valor exibido do slider
const slider = document.getElementById("distanceSlider");
const valueDisplay = document.getElementById("distanceValue");
slider.addEventListener("input", function () {
  valueDisplay.textContent = this.value;
  if (userLat && userLon) {
    updateMarkers();
  }
});

// Converte graus para radianos
function toRad(x) {
  return (x * Math.PI) / 180;
}

/*
    Função para filtrar produtores do CSV conforme seleção de produtos.
    - selectedProducts: array de produtos selecionados (strings)
    - locations: array de objetos do CSV, cada um com campo 'Produtos' (string separada por vírgula)
    Retorna array de nomes dos produtores que possuem todos os produtos selecionados.
*/

function filterProducersByProducts(selectedProducts, producer) {
  // Verifica se o produtor possui todos os produtos selecionados
  return selectedProducts.every((prod) => {
    // Normaliza o nome do produto para corresponder ao cabeçalho do CSV
    const key = prod.trim();
    // Verifica se o produtor tem o produto e está marcado como "1"

    return producer[key] && producer[key] === true;
  });
}

function filterProducersByDistances(selectedProducts) {
  return selectedProducts.filter((prod) => {
    return prod.Distancia <= maxDistance;
  });
}

function getMatchingProducers(selectedProducts) {
  let p = producers.filter((prod) => {
    // Verifica se o produtor possui todos os produtos selecionados
    return filterProducersByProducts(selectedProducts, prod);
  });
  p = filterProducersByDistances(p);
  return p;
}

// Fórmula de Haversine para distância em KM
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

let userLat = null;
let userLon = null;
let selectedProducts = [];
let maxDistance = 50; // Distância máxima padrão em km

// Atualiza os marcadores com base na distância máxima
function updateMarkers() {
  // Remove todos os marcadores exceto o do usuário
  map.eachLayer((layer) => {
    if (
      layer instanceof L.Marker &&
      !layer.options.icon?.options.className?.includes("user-marker")
    ) {
      map.removeLayer(layer);
    }
  });

  maxDistance = parseFloat(slider.value);

  producers.forEach((loc) => {
    const lat = parseFloat(loc.lat);
    const lon = parseFloat(loc.lon);
    if (!isNaN(lat) && !isNaN(lon)) {
      const distance = calculateDistance(userLat, userLon, lat, lon);
      if (
        distance <= maxDistance &&
        filterProducersByProducts(selectedProducts, loc)
      ) {
        L.marker([lat, lon])
          .addTo(map)
          .bindPopup(
            `<b>${loc.Sigla} - ${loc.Nome}</b><br>${distance.toFixed(1)} km`
          );
      }
    }
  });
}

function orderByDistance(Producers) {
  if (!userLat || !userLon) return Producers;

  return Producers.map((producer) => {
    const dist = calculateDistance(
      userLat,
      userLon,
      producer.lat,
      producer.lon
    );
    return { ...producer, Distancia: dist };
  }).sort((a, b) => {
    return a.Distancia - b.Distancia;
  });
}

function findDistanceToUser(producers) {
  return producers.map((producer) => {
    const dist = calculateDistance(
      userLat,
      userLon,
      producer.lat,
      producer.lon
    );
    return { ...producer, Distancia: dist };
  });
}

function findAvgProducerGrade(producers) {
  const notasPorProdutor = {};

  // Agrupa notas por coordenada do produtor
  avaliacoes.forEach((a) => {
    const lat = parseFloat(a.latitude_produtor).toFixed(4);
    const lon = parseFloat(a.longitude_produtor).toFixed(4);
    const key = `${lat},${lon}`;

    if (!notasPorProdutor[key]) {
      notasPorProdutor[key] = [];
    }

    notasPorProdutor[key].push(parseFloat(a.nota_atendimento));
  });

  // Calcula média para cada produtor no array `producers`
  producers.forEach((prod) => {
    const key = `${parseFloat(prod.lat).toFixed(4)},${parseFloat(
      prod.lon
    ).toFixed(4)}`;
    const notas = notasPorProdutor[key];

    if (notas && notas.length > 0) {
      const media = notas.reduce((a, b) => a + b, 0) / notas.length;
      const media_atendimento = parseFloat(media.toFixed(2));
    } else {
      const media_atendimento = null; // ou 0, ou "Sem avaliações"
    }

    return {
      ...prod,
      media_atendimento: media_atendimento,
    };
  });
}

function orderByAvgGrade() {
  const p = findAvgProducerGrade(producers);

  return p.sort((a, b) => {
    if (a.media_atendimento === null) return 1; // Coloca sem avaliações no final
    if (b.media_atendimento === null) return -1; // Coloca sem avaliações no final
    return b.media_atendimento - a.media_atendimento; // Ordem decrescente
  });
}

// Mostra o usuário no mapa e exibe produtores próximos
function showNearbyProducers(lat, lon) {
  userLat = lat;
  userLon = lon;

  const userIcon = L.icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/64/64113.png",
    iconSize: [32, 32],
    className: "user-marker",
  });

  L.marker([userLat, userLon], { icon: userIcon })
    .addTo(map)
    .bindPopup("Você está aqui")
    .openPopup();

  map.setView([userLat, userLon], 10);
  selectedProducts = getProdutosSelecionados();
  updateMarkers();
}

// Geolocalização
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      showNearbyProducers(lat, lon);
      producers = findDistanceToUser(producers);
    },
    (error) => {
      alert("Não foi possível obter sua localização.");
      console.error(error);
    }
  );
} else {
  alert("Geolocalização não é suportada pelo navegador.");
}

document.querySelectorAll('input[name="produto"]').forEach((checkbox) => {
  checkbox.addEventListener("change", () => {
    selectedProducts = getProdutosSelecionados();
    if (userLat && userLon) updateMarkers();
  });
});

document.getElementById("sortDistance").addEventListener("click", () => {
  producers = orderByDistance(producers);
  updateMarkers();
});
document.getElementById("sortGrade").addEventListener("click", () => {
  producers = orderByAvgGrade();
  updateMarkers();
});
