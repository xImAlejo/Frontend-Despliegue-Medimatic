import { User } from "./user"

export interface Activity{
    id:number
    task:string
    asignation_date:Date
    limit_date:Date
    detail:string
    finalization_date:Date
    area:string
    priority:string
    state:string
    progress:string
    done:boolean
    observation:string
    notes:string
    user:number
}