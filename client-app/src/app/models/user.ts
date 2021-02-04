export interface IUser{
    username: string,
    dispalyName: string,
    token: string,
    image: string
}

export interface IUserFormValues{
    email: string,
    password: string,
    displayName?:string,
    username?:string
}