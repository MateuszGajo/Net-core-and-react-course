import React, { useState, useEffect } from "react";
import axios from "axios";
import { Header, Icon, List } from "semantic-ui-react";

const App: React.FC = () => {
  const [values, setValues] = useState([{ id: 1, name: "value 101" }]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/values").then((response) => {
      setValues(response.data);
    });
  }, []);

  return (
    <div className="App">
      <Header as="h2">
        <Icon name="users" />
        <Header.Content>Course</Header.Content>
      </Header>
      <List>
        {values.map((item) => (
          <List.Item key={item.id}>{item.name}</List.Item>
        ))}
      </List>
    </div>
  );
};

export default App;
