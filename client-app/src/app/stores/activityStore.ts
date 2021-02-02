import { makeAutoObservable, configure, runInAction} from "mobx";
import { createContext, SyntheticEvent } from "react";
import agent from "../api/agent";
import { IActivity } from "../models/activity";
import {history} from "../..";
import { toast } from "react-toastify";

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
            (a, b)=>a.date.getTime() - b.date.getTime()
        )
        return Object.entries(sortedActivities.reduce((activities,  activity)=>{
            const date = activity.date!.toISOString().split("T")[0];

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
                 activity.date = new Date (activity.date);
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
        if(activity){ 
            this.activity = activity;
            return activity;
        }
        else {
            this.loadingInitital = true;
            try{
                activity = await agent.Activities.details(id);
                runInAction(()=>{
                    activity.date = new Date(activity.date);
                    this.activity = activity;
                    this.activityRegistry.set(activity.id, activity);
                    this.loadingInitital = false
                })
                return activity;
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
            history.push(`/activities/${activity.id}`);
        }catch(error){
            runInAction(()=>{
                this.submitting = false;
            })
            toast.error("Problem submitting data");
            console.log(error);
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
            history.push(`/activities/${activity.id}`);
        }catch(error){
            runInAction(()=>{
                this.submitting = false;
            })
            toast.error("Problem submitting data");
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