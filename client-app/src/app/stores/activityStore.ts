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
    activities: IActivity[] = [];
    selectedActivity: IActivity | undefined;
    loadingInitital = false;
    editMode = false;
    submitting = false;
    target = '';

    get activitiesByDate() {
        return Array.from(this.activityRegistry.values()).sort((a, b)=>Date.parse(a.date) - Date.parse(b.date))
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

    createActivity = async (activity:IActivity)=>{
        this.submitting = true;
        try{
            await agent.Activities.create(activity);
            runInAction(()=>{
                this.activityRegistry.set(activity.id, activity);
                this.editMode=false;
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
                this.selectedActivity = activity;
                this.editMode = false;
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

     openCreateForm = ()=>{
        this.editMode = true;
        this.selectedActivity= undefined;
    }

    openEditForm = (id: string)=>{
        this.selectedActivity = this.activityRegistry.get(id);
        this.editMode = true;
    }

    cancelSelectedActivity = ()=>{
        this.selectedActivity= undefined;
    }

    cancelFormOpen = ()=>{
        this.editMode = false;
    }

     selectActivity = (id: string) =>{
        this.selectedActivity = this.activityRegistry.get(id);
        this.editMode= false;
    }
}

export default createContext(new AcitivtyStore());