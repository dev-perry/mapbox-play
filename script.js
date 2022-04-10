mapboxgl.accessToken =
  'pk.eyJ1IjoicGFid290YSIsImEiOiJjbDB5OXBnanIwZmtsM2JvM2M4dmQ0YXVxIn0.wYVFwY-nm8FOHlcz-dOUuA';

const zoomLevelText = document.getElementById('zoom-level');
const mousePositionText = document.getElementById('mouse-position');
const startPointText = document.getElementById('directions-start')
const endPointText = document.getElementById('directions-end')
const generateRouteButton = document.getElementById('build-route-btn')
const resetMapButton = document.getElementById('reset-map-btn')

let mapMarkersCoordinates = []
let mapMarkers = []

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v11',
  center: [-95.9928, 36.154],
  zoom: 12,
});

var directions = new MapboxDirections({
  accessToken: mapboxgl.accessToken,
  unit: 'imperial',
  profile: 'mapbox/driving-traffic'
});

map.on('click', (e) => {
  if(mapMarkersCoordinates.length < 2){
    const marker = new mapboxgl.Marker({
      color: "#22A7F4",
      draggable: false
      }).setLngLat(e.lngLat)
      marker.addTo(map);
      mapMarkers.push(marker)
      mapMarkersCoordinates.push(marker.getLngLat().toArray())

      startPointText.innerHTML = (mapMarkersCoordinates[0].join(', ') || 'unmarked')
      endPointText.innerHTML = (mapMarkersCoordinates[1].join(', ') || 'unmarked')
  }
})

map.on('mousemove', (e) => {
  mousePositionText.innerHTML = JSON.stringify(e.lngLat.wrap());
});

map.on('zoom', () => {
  zoomLevelText.innerHTML = map.getZoom();
});

generateRouteButton.addEventListener("click", () => {
  if(mapMarkersCoordinates.length == 2){
    const coordinates = mapMarkersCoordinates.map((location) => {
      return location.join(',')
    }).join(';')

    const getDirections = fetch(`https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${coordinates}?geometries=geojson&access_token=${mapboxgl.accessToken}`, {
      method: 'GET',
    })
    .then((response) => {
      if(!response.ok){
        throw new Error(`HTTP error! Status: ${ response.status }`);
      }
      return response.json()
    })
    .catch((error) => {
       console.error(error)
    })

    getDirections.then((directionsData) => {
      const data = directionsData.routes[0]
      const route = data.geometry.coordinates

      const geojson = {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: route
        }
      };

        map.addLayer({
          id: 'route',
          type: 'line',
          source: {
            type: 'geojson',
            data: geojson
          },
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#3887be',
            'line-width': 5,
            'line-opacity': 0.75
          }
        });
      })
    }
  })

  resetMapButton.addEventListener("click", () =>{
    location.reload()
  })