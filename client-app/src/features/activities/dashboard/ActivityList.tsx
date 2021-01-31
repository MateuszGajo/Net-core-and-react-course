import { observer } from "mobx-react-lite";
import React, { useContext } from "react";
import { Item, Label } from "semantic-ui-react";
import ActivityStore from "../../../app/stores/activityStore";
import ActivityListItem from "./ActivityListItem";

const ActivityList: React.FC = () => {
  const activityStore = useContext(ActivityStore);
  const { activitiesByDate } = activityStore;
  return (
    <>
      {activitiesByDate.map(([group, activites]) => (
        <>
          <Label key={group} size="large" color="blue">
            {group}
          </Label>
          <Item.Group divided>
            {activites.map((activity) => (
              <ActivityListItem activity={activity} key={activity.id} />
            ))}
          </Item.Group>
        </>
      ))}
    </>
  );
};

export default observer(ActivityList);
