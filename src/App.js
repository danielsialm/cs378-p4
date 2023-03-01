import { useState } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import './App.css';

function CityTemperatures({ lat, long }) {
  const [time, setTime] = useState(null);
  const [temperatures, setTemperatures] = useState([Array(10).fill(null)]);

  const BASE_URL = `https://api.open-meteo.com/v1/forecast?hourly=temperature_2m&temperature_unit=fahrenheit&current_weather=true&latitude=${lat}&longitude=${long}`;

  fetch(BASE_URL)
    .then((response) => response.json())
    .then((data) => {
      setTime(parseInt(data["current_weather"]["time"].slice(-5, -3)));
      setTemperatures(data["hourly"]["temperature_2m"].slice(time, time+10));
    })
    .catch(error => console.log(error));

  let rows = [];
  for (let i = 0; i < 10; i++) {
    rows.push(
      <Row>
        <Col>{(time + i) % 24}:00</Col>
        <Col>{temperatures[i]} F</Col>
      </Row>
    )
  }

  return (
    <>
    <Row>
      <Col>Time</Col>
      <Col>Temperature</Col>
    </Row>
    {rows}
    </>
  );
}



function App() {
  const [currCity, setCurrCity] = useState("Austin");
  const [citySearch, setCitySearch] = useState("");
  const [cities, setCities] = useState({  "Austin":   ["30.27","-97.74"], 
                                          "Dallas":   ["32.78","-96.81"],
                                          "Houston":  ["29.76","-95.36"]  });

  const addCity = () => {
    const BASE_URL = `https://geocoding-api.open-meteo.com/v1/search?name=${citySearch}`

    fetch(BASE_URL)
      .then((response) => response.json())
      .then((data) => {
        const city_data = data["results"];
        if (city_data) {
          const lat = String(data["results"][0]["latitude"]);
          const long = String(data["results"][0]["longitude"]);

          cities[citySearch] = [lat, long];
          setCities(cities);
          setCurrCity(citySearch);
        }
        else
          alert("not a valid city");
      })
      .catch(error => console.log(error));
  }

  const cities_buttons = Object.keys(cities).map((city) => {
    return (
      <Col> 
        <Button onClick={() => setCurrCity(city)}>{city}</Button>
      </Col>
    );
  });

  return (
    <Container>
      <Row>
        {cities_buttons}
      </Row>
      <Row>
          <Col>
            <input
              type="text"
              name="city-name"
              value={citySearch}
              onChange={e => setCitySearch(e.target.value)}
              className="search-bar"
            />
          </Col>
          <Col>
            <Button onClick={addCity}>+</Button>
          </Col>
      </Row>
      <Row>
        {currCity == null ? null : (
          <CityTemperatures lat={cities[currCity][0]} long={cities[currCity][1]}/>
        )}
      </Row>
    </Container>
  );
}

export default App;
