import { observer } from "mobx-react-lite";
import React, { useContext } from "react";
import { Fragment } from "react";
import { Item, Label } from "semantic-ui-react";
import { RootStoreContext } from "../../../app/stores/rootStore";
import ActivityListItem from "./ActivityListItem";
import { format } from "date-fns";

const ActivityList: React.FC = () => {
  const rootStore = useContext(RootStoreContext);
  const { activitiesByDate } = rootStore.activityStore;
  return (
    <>
      {activitiesByDate.map(([group, activites]) => (
        <Fragment key={group}>
          <Label size="large" color="blue">
            {format(group, "eeee do MMMM")}
          </Label>
          <Item.Group divided>
            {activites.map((activity) => (
              <ActivityListItem activity={activity} key={activity.id} />
            ))}
          </Item.Group>
        </Fragment>
      ))}
    </>
  );
};

export default observer(ActivityList);
