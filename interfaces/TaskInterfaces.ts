export interface Task{
    id:string
    title:string
    desc?:string
    status:'PENDING'|'IN_PROGRESS'|'COMPLETED'|'CANCELED'
    dueDate?:Date
    createdAt: Date
    updatedAt:Date
    subTasks:SubTask[]
}

export interface SubTask{
    id:string
    title:string
    done:boolean
    children?:SubTask[]
    taskId:string
    parentId:string|null
    createdAt: Date
    updatedAt:Date
}