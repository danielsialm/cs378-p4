import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useState, useEffect } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";

const databaseURL = "https://cs-378---p4-default-rtdb.firebaseio.com/";

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
        <Col>{(((time + i - 6) % 24) + 24) % 24}:00</Col>
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



function WeatherPage() {
  const { user } = useAuth0();
  const [currCity, setCurrCity] = useState(null);
  const [citySearch, setCitySearch] = useState("");
  const [cities, setCities] = useState({  "Austin":   ["30.27","-97.74"], 
                                          "Dallas":   ["32.78","-96.81"],
                                          "Houston":  ["29.76","-95.36"]  });


  useEffect(() => {
    fetch(`${databaseURL + "/" + user.sub}/.json`)
    .then((res) => {
      if (res.status === 200) {
        return res.json();
      }
    })
    .then((res) => {
      if (res) {
        setCities(res);
      }
    });
  }, []);
  

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
      .then(() => {
          return fetch(`${databaseURL + "/" + user.sub}/.json`, {
            method: "PATCH",
            body: JSON.stringify(cities)
          });
        }
      )
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
          <>
            <p>{currCity}</p>
            <CityTemperatures lat={cities[currCity][0]} long={cities[currCity][1]}/>
          </>
        )}
      </Row>
    </Container>
  );
}

const Profile = () => {
  const { user, isAuthenticated, isLoading } = useAuth0();

  if (isLoading) {
    return <div>Loading ...</div>;
  }

  return (
    isAuthenticated && (
      <div>
        <h2>{user.name}</h2>
        <WeatherPage/>
      </div>
    )
  );
};

export default Profile;