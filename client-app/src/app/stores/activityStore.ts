import { makeAutoObservable, configure, runInAction} from "mobx";
import { createContext, SyntheticEvent } from "react";
import agent from "../api/agent";
import { IActivity } from "../models/activity";

configure({enforceActions:"always"});

class AcitivtyStore{
    constructor(){
        makeAutoObservable(this);
    }

    activityRegistry = new Map();
    activity: IActivity | null = null;
    loadingInitital = false;
    submitting = false;
    target = '';

    get activitiesByDate() {
        return this.groupActivitiesByDate(Array.from(this.activityRegistry.values()));
    }

  groupActivitiesByDate(activites: IActivity[]){
        const sortedActivities = activites.sort(
            (a, b)=>Date.parse(a.date) - Date.parse(b.date)
        )
        return Object.entries(sortedActivities.reduce((activities,  activity)=>{
            const date = activity.date.split("T")[0];

            activities[date] = activities[date] ? [...activities[date],activity] : [activity];
            return activities;
        },{} as {[key: string]:IActivity[]}));
    }

    loadActivities = async ()=>{
        this.loadingInitital  = true;
        try{
        const activities = await agent.Activities.list()
        runInAction(()=>{
            activities.forEach((activity) => {
                activity.date = activity.date.split(".")[0];
                this.activityRegistry.set(activity.id, activity);
              });
              this.loadingInitital = false;
        })
        }catch(error){
            runInAction(()=>{
                this.loadingInitital = false;
            }) 
        }
    }

    loadActivity = async (id:string) =>{
        let activity = this.getActivity(id);
        if(activity){ this.activity = activity;}
        else {
            this.loadingInitital = true;
            try{
                activity = await agent.Activities.details(id);
                runInAction(()=>{
                    this.activity = activity;
                    this.loadingInitital = false
                })
            }catch(error){
                runInAction(()=>{
                    this.loadingInitital = false
                })
            }
        }
    }

    clearActivity = ()=>{
        this.activity = null;
    }

    getActivity = (id: string)=>{
        return this.activityRegistry.get(id);
    }

    createActivity = async (activity:IActivity)=>{
        this.submitting = true;
        try{
            await agent.Activities.create(activity);
            runInAction(()=>{
                this.activityRegistry.set(activity.id, activity);
                this.submitting = false;
            })
           
        }catch(error){
            runInAction(()=>{
                this.submitting = false;
            })
            
        }
    }

    editActivity = async (activity: IActivity)=>{
        this.submitting = true;
        try{
            await agent.Activities.update(activity);
            runInAction(()=>{
                this.activityRegistry.set(activity.id, activity);
                this.activity = activity;
                this.submitting = false;
            })
            
        }catch(error){
            runInAction(()=>{
                this.submitting = false;
            })
        }
    }

    deleteActivity =  async(event: SyntheticEvent<HTMLButtonElement>, id: string)=>{
    this.submitting = true
    this.target = event.currentTarget.name;

    try{
        await agent.Activities.delete(id);
        runInAction(()=>{
            this.activityRegistry.delete(id);
            this.submitting = false;
            this.target = '';
        })
    }catch(error){
        runInAction(()=>{
            this.submitting = false;
            this.target = '';
        })
    }
    }
}

export default createContext(new AcitivtyStore());